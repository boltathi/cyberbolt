#!/bin/bash
# ─── CyberBolt Deployment (Contabo) ──────────────────────────
#
# Prerequisites (already done on your server):
#   - Redis installed & running
#   - Nginx installed
#   - Node.js 18+ installed
#   - Python 3.10+ installed
#   - screen installed
#
# Workflow:
#   1. Push code to GitHub from local
#   2. SSH into Contabo
#   3. Clone: git clone https://github.com/boltathi/cyberbolt.git /opt/cyberbolt
#   4. Create .env: cp /opt/cyberbolt/.env.example /opt/cyberbolt/.env && nano /opt/cyberbolt/.env
#   5. Run: chmod +x /opt/cyberbolt/deploy-contabo.sh && /opt/cyberbolt/deploy-contabo.sh
#
# Re-deploy after code changes:
#   cd /opt/cyberbolt && git pull && ./deploy-contabo.sh
#
# ──────────────────────────────────────────────────────────────

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
ENV_FILE="$APP_DIR/.env"

echo -e "${CYAN}🔒 CyberBolt Deployment${NC}"
echo -e "   Directory: ${APP_DIR}"
echo ""

# ─── Check .env exists ───────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo ""
    echo "   Create it from the example:"
    echo "   cp $APP_DIR/.env.example $APP_DIR/.env"
    echo "   nano $APP_DIR/.env"
    echo ""
    echo "   Fill in your Redis password, admin credentials, domain, etc."
    exit 1
fi

# Load env vars for this script
set -a
source "$ENV_FILE"
set +a

echo -e "${GREEN}   ✅ .env loaded${NC}"

# ─── Check Redis ─────────────────────────────────────────────
echo -e "${CYAN}[1/6] Checking Redis...${NC}"

# Extract password from REDIS_URL (format: redis://:PASSWORD@host:port/db)
# The password may be URL-encoded (e.g. %40 for @), so decode it for redis-cli
REDIS_PASS=$(echo "$REDIS_URL" | sed -n 's|redis://:\([^@]*\)@.*|\1|p' | python3 -c "import sys, urllib.parse; print(urllib.parse.unquote(sys.stdin.read().strip()))")

if [ -n "$REDIS_PASS" ]; then
    REDIS_CLI_AUTH="-a $REDIS_PASS"
else
    REDIS_CLI_AUTH=""
fi

if redis-cli $REDIS_CLI_AUTH ping 2>/dev/null | grep -q PONG; then
    echo -e "${GREEN}   ✅ Redis is running${NC}"
else
    echo -e "${RED}   ❌ Redis not reachable. Check REDIS_URL in .env${NC}"
    exit 1
fi

# ─── Backend setup ───────────────────────────────────────────
echo -e "${CYAN}[2/6] Setting up backend...${NC}"

cd "$BACKEND_DIR"

if [ ! -f "venv/bin/activate" ]; then
    rm -rf venv
    echo -e "   Creating Python venv..."
    python3 -m venv venv || {
        echo -e "${RED}   ❌ Failed to create venv. Install python3-venv:${NC}"
        echo "      sudo apt install python3-venv -y"
        exit 1
    }
    echo -e "   Created Python venv"
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo -e "${GREEN}   ✅ Backend dependencies installed${NC}"

# Quick sanity check
python -c "from app import create_app; app = create_app(); print('   App factory OK')" 2>&1

# ─── Frontend setup ──────────────────────────────────────────
echo -e "${CYAN}[3/6] Building frontend...${NC}"

cd "$FRONTEND_DIR"

npm install --legacy-peer-deps -q 2>&1 | tail -1

echo -e "   Building Next.js (this takes a minute)..."
# NEXT_PUBLIC_* vars must be present at build time — Next.js inlines them
NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
npm run build 2>&1 | tail -10

# Verify standalone build succeeded
if [ ! -f ".next/standalone/server.js" ]; then
    echo -e "${RED}   ❌ Next.js standalone build failed — .next/standalone/server.js not found${NC}"
    echo "      Try running manually: cd $FRONTEND_DIR && npm run build"
    exit 1
fi

# Copy static assets to standalone (required for Next.js standalone mode)
cp -r public .next/standalone/ 2>/dev/null || true
cp -r .next/static .next/standalone/.next/ 2>/dev/null || true

echo -e "${GREEN}   ✅ Frontend built (standalone)${NC}"

# ─── Nginx config ────────────────────────────────────────────
echo -e "${CYAN}[4/6] Configuring Nginx...${NC}"

NGINX_CONF="/etc/nginx/sites-available/cyberbolt"

# If Certbot has already configured SSL, don't overwrite — just reload
if [ -f "$NGINX_CONF" ] && grep -q "ssl_certificate" "$NGINX_CONF"; then
    echo -e "${GREEN}   ✅ Nginx SSL config exists (managed by Certbot) — skipping overwrite${NC}"
else
    cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # API → Flask backend (gunicorn on :5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        client_max_body_size 1m;
    }

    # Everything else → Next.js frontend (:3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
NGINX
    echo -e "${GREEN}   ✅ Nginx base config written${NC}"
fi

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

if nginx -t 2>&1 | grep -q "successful"; then
    systemctl reload nginx
    echo -e "${GREEN}   ✅ Nginx reloaded${NC}"
else
    echo -e "${RED}   ❌ Nginx config error:${NC}"
    nginx -t
    exit 1
fi

# ─── Start services in screen ────────────────────────────────
echo -e "${CYAN}[5/6] Starting services in screen...${NC}"

# Kill old screen sessions
screen -S cyberbolt-backend -X quit 2>/dev/null || true
screen -S cyberbolt-frontend -X quit 2>/dev/null || true
sleep 1

# Kill anything on our ports
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start Backend (gunicorn) — wsgi.py auto-loads .env via python-dotenv
screen -dmS cyberbolt-backend bash -c "
    cd $BACKEND_DIR && \
    source venv/bin/activate && \
    exec gunicorn wsgi:app \
        --bind 127.0.0.1:5000 \
        --workers 3 \
        --timeout 120 \
        --access-logfile /var/log/cyberbolt-backend.log \
        --error-logfile /var/log/cyberbolt-backend-error.log
"

# Wait for backend
echo -n "   Waiting for backend"
for i in {1..20}; do
    if curl -s http://127.0.0.1:5000/api/v1/health 2>/dev/null | grep -q "healthy"; then
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

HEALTH_RESP=$(curl -s http://127.0.0.1:5000/api/v1/health 2>/dev/null)
if echo "$HEALTH_RESP" | grep -q "healthy"; then
    echo -e "${GREEN}   ✅ Backend running  →  screen -r cyberbolt-backend${NC}"
else
    echo -e "${RED}   ❌ Backend failed. Health response: $HEALTH_RESP${NC}"
    echo "      screen -r cyberbolt-backend"
    echo "      tail -20 /var/log/cyberbolt-backend-error.log"
    exit 1
fi

# Start Frontend (Next.js standalone)
screen -dmS cyberbolt-frontend bash -c "
    cd $FRONTEND_DIR && \
    export PORT=3000 && \
    export HOSTNAME=0.0.0.0 && \
    export NEXT_PUBLIC_API_URL='$NEXT_PUBLIC_API_URL' && \
    export INTERNAL_API_URL='$INTERNAL_API_URL' && \
    export NEXT_PUBLIC_SITE_URL='$NEXT_PUBLIC_SITE_URL' && \
    node .next/standalone/server.js >> /var/log/cyberbolt-frontend.log 2>&1
"

echo -n "   Waiting for frontend"
for i in {1..20}; do
    if curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Frontend running →  screen -r cyberbolt-frontend${NC}"
else
    echo -e "${RED}   ❌ Frontend failed. Debug:${NC}"
    echo "      tail -30 /var/log/cyberbolt-frontend.log"
    echo "      screen -ls"
    if [ -f /var/log/cyberbolt-frontend.log ]; then
        echo -e "${RED}   Last 10 lines of frontend log:${NC}"
        tail -10 /var/log/cyberbolt-frontend.log
    fi
    exit 1
fi

# ─── Seed data ───────────────────────────────────────────────
echo -e "${CYAN}[6/6] Seeding data...${NC}"

cd "$BACKEND_DIR"
source venv/bin/activate
python scripts/seed.py

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 CyberBolt is live!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Site:     http://${DOMAIN}"
echo "   API:      http://${DOMAIN}/api/v1/health"
echo "   Admin:    http://${DOMAIN}/admin"
echo ""
echo -e "${CYAN}Screen sessions:${NC}"
echo "   screen -r cyberbolt-backend     # view backend logs"
echo "   screen -r cyberbolt-frontend    # view frontend logs"
echo "   Ctrl+A then D                   # detach from screen"
echo ""
echo -e "${CYAN}Stop / Restart:${NC}"
echo "   screen -S cyberbolt-backend -X quit     # stop backend"
echo "   screen -S cyberbolt-frontend -X quit    # stop frontend"
echo "   ./deploy-contabo.sh                     # redeploy everything"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo "   tail -f /var/log/cyberbolt-backend.log"
echo "   tail -f /var/log/cyberbolt-backend-error.log"
echo ""
echo -e "${CYAN}SSL setup (after DNS points here):${NC}"
echo "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""

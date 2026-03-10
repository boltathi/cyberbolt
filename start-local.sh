#!/bin/bash
# ─── CyberBolt Local Dev (No Docker) ─────────
# Usage: ./start-local.sh
# Stop:  ./start-local.sh stop

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_LOG="$PROJECT_DIR/.backend.log"
FRONTEND_LOG="$PROJECT_DIR/.frontend.log"

# Redis config — set your local Redis password here
REDIS_PASSWORD="ZohoTest@24"
REDIS_BASE="redis://:${REDIS_PASSWORD}@localhost:6379"

stop_services() {
    echo -e "${CYAN}Stopping CyberBolt services...${NC}"
    lsof -ti:5000 | xargs kill 2>/dev/null
    lsof -ti:3000 | xargs kill 2>/dev/null
    rm -f "$BACKEND_LOG" "$FRONTEND_LOG"
    echo -e "${GREEN}✅ All services stopped${NC}"
}

if [ "$1" = "stop" ]; then
    stop_services
    exit 0
fi

# Stop any existing instances first
lsof -ti:5000 | xargs kill 2>/dev/null
lsof -ti:3000 | xargs kill 2>/dev/null
sleep 1

echo -e "${CYAN}🔒 Starting CyberBolt locally...${NC}"
echo ""

# ─── Check prerequisites ─────────────────────

if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "${CYAN}Creating Python venv...${NC}"
    python3 -m venv "$BACKEND_DIR/venv"
    source "$BACKEND_DIR/venv/bin/activate"
    pip install -r "$BACKEND_DIR/requirements.txt" -q
else
    source "$BACKEND_DIR/venv/bin/activate"
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${CYAN}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR" && npm install --legacy-peer-deps -q
fi

# ─── Start Backend ───────────────────────────
echo -e "${CYAN}Starting backend...${NC}"
cd "$BACKEND_DIR"
FLASK_ENV=development \
REDIS_URL="${REDIS_BASE}/0" \
REDIS_SESSION_URL="${REDIS_BASE}/1" \
REDIS_RATE_LIMIT_URL="${REDIS_BASE}/2" \
REDIS_JWT_BLOCKLIST_URL="${REDIS_BASE}/3" \
REDIS_DATA_URL="${REDIS_BASE}/4" \
FLASK_APP=wsgi:app \
    "$BACKEND_DIR/venv/bin/flask" run --host=0.0.0.0 --port=5000 --reload \
    > "$BACKEND_LOG" 2>&1 &

BACKEND_PID=$!

# Wait for backend to be ready
for i in {1..15}; do
    if curl -s http://localhost:5000/api/v1/health > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:5000/api/v1/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start. Check $BACKEND_LOG${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend running (PID $BACKEND_PID)${NC}"

# ─── Start Frontend ──────────────────────────
echo -e "${CYAN}Starting frontend...${NC}"
cd "$FRONTEND_DIR"
NEXT_PUBLIC_API_URL=http://localhost:5000 \
INTERNAL_API_URL=http://localhost:5000 \
    "$FRONTEND_DIR/node_modules/.bin/next" dev \
    > "$FRONTEND_LOG" 2>&1 &

FRONTEND_PID=$!

# Wait for frontend to be ready
for i in {1..15}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend failed to start. Check $FRONTEND_LOG${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend running (PID $FRONTEND_PID)${NC}"

# ─── Summary ─────────────────────────────────
echo ""
echo -e "${GREEN}🚀 CyberBolt is running!${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}     http://localhost:3000"
echo -e "  ${CYAN}Admin Panel:${NC}  http://localhost:3000/admin"
echo -e "  ${CYAN}Backend API:${NC}  http://localhost:5000/api/v1/"
echo -e "  ${CYAN}Swagger Docs:${NC} http://localhost:5000/api/v1/docs"
echo ""
echo -e "  Logs: tail -f $BACKEND_LOG"
echo -e "        tail -f $FRONTEND_LOG"
echo ""
echo -e "  Stop: ${CYAN}./start-local.sh stop${NC}"

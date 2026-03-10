# CyberBolt Deployment Guide

A complete step-by-step guide to deploy a Flask + Next.js app on a Contabo (or any Ubuntu) VPS.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites — Local Machine](#2-prerequisites--local-machine)
3. [Prerequisites — VPS Server](#3-prerequisites--vps-server)
4. [Domain Setup (GoDaddy)](#4-domain-setup-godaddy)
5. [Server Setup (First Time Only)](#5-server-setup-first-time-only)
6. [Deploy the App](#6-deploy-the-app)
7. [SSL with Certbot](#7-ssl-with-certbot)
8. [Post-SSL: Update .env & Redeploy](#8-post-ssl-update-env--redeploy)
9. [Managing the Running App](#9-managing-the-running-app)
10. [Redeploying After Code Changes](#10-redeploying-after-code-changes)
11. [Troubleshooting](#11-troubleshooting)
12. [Problems Faced & Solutions (Deploy Log)](#12-problems-faced--solutions-cyberbolt-deploy-log)

---

## 1. Architecture Overview

```
User → Nginx (:80/:443)
          ├── /api/*  → Gunicorn/Flask (:5000)
          └── /*      → Next.js standalone (:3000)
                          ↕
                        Redis (DBs 0–4)
```

| Component | Role | Port |
|-----------|------|------|
| **Nginx** | Reverse proxy, SSL termination | 80, 443 |
| **Gunicorn** | Python WSGI server running Flask | 5000 |
| **Next.js** | React frontend (standalone mode) | 3000 |
| **Redis** | Data storage, cache, sessions, rate limits, JWT blocklist | 6379 |

Redis databases:
- DB 0 = Cache
- DB 1 = Sessions
- DB 2 = Rate limits
- DB 3 = JWT blocklist
- DB 4 = Data storage (articles, blog posts, etc.)

---

## 2. Prerequisites — Local Machine

- Git + GitHub account
- Node.js 18+
- Python 3.10+
- Code pushed to a GitHub repo (e.g., `https://github.com/youruser/yourapp.git`)

---

## 3. Prerequisites — VPS Server

You need an Ubuntu 22.04+ VPS (Contabo, Hetzner, DigitalOcean, etc.).

### SSH into your server

```bash
ssh root@YOUR_SERVER_IP
```

### Install required packages

```bash
# Update system
apt update && apt upgrade -y

# Python
apt install python3 python3-pip python3-venv -y

# Node.js 18+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs -y

# Verify versions
node --version    # should be 18+
python3 --version # should be 3.10+

# Nginx
apt install nginx -y

# Redis
apt install redis-server -y

# Screen (for running processes in background)
apt install screen -y

# Certbot (for SSL)
apt install certbot python3-certbot-nginx -y

# Git
apt install git -y
```

### Configure Redis with a password

```bash
nano /etc/redis/redis.conf
```

Find the line `# requirepass foobared` and change it to:

```
requirepass YourStrongPassword
```

> ⚠️ **Special characters**: If your password has `@`, `#`, or `:`, you'll need to URL-encode them in your `.env` file later:
> - `@` → `%40`
> - `#` → `%23`
> - `:` → `%3A`

Restart Redis:

```bash
systemctl restart redis
redis-cli -a 'YourStrongPassword' ping
# Should return: PONG
```

### Verify everything is running

```bash
systemctl status nginx    # should be active
systemctl status redis    # should be active
node --version            # 18+
python3 --version         # 3.10+
```

---

## 4. Domain Setup (GoDaddy)

You need to point your domain to your server's IP address.

### Find your server IP

```bash
# Run on your VPS:
curl -4 ifconfig.me
```

### GoDaddy DNS Settings

Go to **GoDaddy** → **My Products** → **Your Domain** → **DNS**.

Add/edit these **A records**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_SERVER_IP` | 600 |
| A | `www` | `YOUR_SERVER_IP` | 600 |

> ⚠️ If you get a "conflicts with another record" error for `www`, **delete** the existing CNAME record for `www` first, then add the A record.

### Verify DNS propagation

```bash
# Wait 5–30 minutes, then check:
dig yourdomain.com +short
dig www.yourdomain.com +short
# Both should return your server IP
```

---

## 5. Server Setup (First Time Only)

### Clone the repo

```bash
git clone https://github.com/youruser/yourapp.git /opt/yourapp
cd /opt/yourapp
```

### Create the .env file

```bash
cp .env.example .env
nano .env
```

Fill in all values. Key things to change:

```dotenv
# Generate strong secrets (run this command twice, use each output):
# openssl rand -hex 32

SECRET_KEY=<paste-first-secret-here>
JWT_SECRET_KEY=<paste-second-secret-here>

# Redis — URL-encode special chars in password
REDIS_URL=redis://:YourPassword@localhost:6379/0
REDIS_SESSION_URL=redis://:YourPassword@localhost:6379/1
REDIS_RATE_LIMIT_URL=redis://:YourPassword@localhost:6379/2
REDIS_JWT_BLOCKLIST_URL=redis://:YourPassword@localhost:6379/3
REDIS_DATA_URL=redis://:YourPassword@localhost:6379/4

# Your domain
DOMAIN=yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
ADMIN_EMAIL=admin@yourdomain.com

# URLs (use http first, change to https after SSL setup)
NEXT_PUBLIC_API_URL=http://yourdomain.com
INTERNAL_API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_SITE_URL=http://yourdomain.com
```

### Make deploy script executable

```bash
chmod +x deploy-contabo.sh
```

---

## 6. Deploy the App

```bash
cd /opt/yourapp
./deploy-contabo.sh
```

The script does 6 steps automatically:

| Step | What it does |
|------|-------------|
| **[1/6]** | Checks Redis is reachable |
| **[2/6]** | Creates Python venv, installs backend dependencies |
| **[3/6]** | Installs npm packages, builds Next.js in standalone mode |
| **[4/6]** | Writes Nginx config, enables site, reloads Nginx |
| **[5/6]** | Starts gunicorn (backend) and Next.js (frontend) in screen sessions |
| **[6/6]** | Seeds initial data (articles, blog posts, etc.) |

### Verify it's working

```bash
# From the server:
curl http://127.0.0.1:5000/api/v1/health    # Backend health
curl http://127.0.0.1:3000                    # Frontend

# From your browser:
# http://yourdomain.com                       # Site
# http://yourdomain.com/api/v1/health         # API
# http://yourdomain.com/admin                 # Admin panel
```

---

## 7. SSL with Certbot

> ⚠️ DNS must be pointing to your server first. Verify with `dig yourdomain.com +short`.

### Get the certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will:
- Ask for your email address
- Ask you to agree to terms
- Automatically update your Nginx config for HTTPS
- Set up HTTP → HTTPS redirect

### Verify auto-renewal

```bash
sudo certbot renew --dry-run
```

Certbot auto-renews every 90 days via a systemd timer.

---

## 8. Post-SSL: Update .env & Redeploy

After SSL is active, update your `.env` to use `https`:

```bash
nano /opt/yourapp/.env
```

Change:

```dotenv
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Then rebuild and restart (so Next.js bakes in the new HTTPS URLs):

```bash
cd /opt/yourapp && ./deploy-contabo.sh
```

### Verify HTTPS

```bash
curl https://yourdomain.com/api/v1/health
```

Visit `https://yourdomain.com` in your browser — you should see the padlock icon.

---

## 9. Managing the Running App

### View running sessions

```bash
screen -ls
```

### Attach to a session (view logs live)

```bash
screen -r cyberbolt-backend     # Backend logs
screen -r cyberbolt-frontend    # Frontend logs
```

To detach: press **Ctrl+A** then **D**.

### Stop services

```bash
screen -S cyberbolt-backend -X quit
screen -S cyberbolt-frontend -X quit
```

### View log files

```bash
tail -50 /var/log/cyberbolt-backend.log         # Backend access log
tail -50 /var/log/cyberbolt-backend-error.log    # Backend error log
tail -50 /var/log/cyberbolt-frontend.log         # Frontend log
```

### Check what's running on ports

```bash
lsof -i:5000    # Backend (gunicorn)
lsof -i:3000    # Frontend (Next.js)
lsof -i:80      # Nginx HTTP
lsof -i:443     # Nginx HTTPS
```

---

## 10. Redeploying After Code Changes

### Workflow

```
Local Machine                  Server
─────────────                  ──────
1. Make code changes
2. git add -A
3. git commit -m "message"
4. git push
                               5. cd /opt/yourapp
                               6. git pull
                               7. ./deploy-contabo.sh
```

### Quick redeploy command (run on server)

```bash
cd /opt/yourapp && git pull && ./deploy-contabo.sh
```

---

## 11. Troubleshooting

### Backend won't start

```bash
# Check error log
tail -30 /var/log/cyberbolt-backend-error.log

# Test manually
cd /opt/yourapp/backend
source venv/bin/activate
python -c "from app import create_app; app = create_app(); print('OK')"

# Test gunicorn directly
gunicorn wsgi:app --bind 127.0.0.1:5000 --workers 1
```

### Frontend won't start

```bash
# Check log
tail -30 /var/log/cyberbolt-frontend.log

# Test manually
cd /opt/yourapp/frontend
node .next/standalone/server.js

# If standalone doesn't exist, rebuild
NEXT_PUBLIC_API_URL=https://yourdomain.com npm run build
ls .next/standalone/server.js   # should exist
```

### Nginx errors

```bash
nginx -t                           # Test config syntax
cat /etc/nginx/sites-available/cyberbolt  # View config
systemctl status nginx             # Check status
journalctl -u nginx --no-pager -n 30     # View logs
```

### Redis connection failed

```bash
redis-cli -a 'YourPassword' ping   # Should return PONG
systemctl status redis              # Check status

# Test from Python
python3 -c "import redis; r=redis.from_url('redis://:YourPassword@localhost:6379/0'); print(r.ping())"
```

### SSL / Certbot issues

```bash
# Re-run certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Port already in use

```bash
lsof -ti:5000 | xargs kill -9    # Kill whatever is on port 5000
lsof -ti:3000 | xargs kill -9    # Kill whatever is on port 3000
```

### "venv not found" or "python3-venv missing"

```bash
sudo apt install python3-venv -y
cd /opt/yourapp/backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### DNS not resolving

```bash
dig yourdomain.com +short          # Should show your server IP
dig www.yourdomain.com +short      # Same IP
# If empty, wait or check GoDaddy DNS settings
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| SSH into server | `ssh root@YOUR_SERVER_IP` |
| Deploy / Redeploy | `cd /opt/yourapp && git pull && ./deploy-contabo.sh` |
| View backend logs | `screen -r cyberbolt-backend` |
| View frontend logs | `screen -r cyberbolt-frontend` |
| Detach from screen | `Ctrl+A` then `D` |
| Stop everything | `screen -S cyberbolt-backend -X quit && screen -S cyberbolt-frontend -X quit` |
| Check health | `curl https://yourdomain.com/api/v1/health` |
| Test Nginx config | `nginx -t` |
| Renew SSL | `sudo certbot renew` |
| Generate a secret | `openssl rand -hex 32` |
| Check server IP | `curl -4 ifconfig.me` |

---

## 12. Problems Faced & Solutions (CyberBolt Deploy Log)

A log of every issue encountered during the actual CyberBolt deployment to Contabo, for future reference.

---

### Problem 1: Redis "not reachable" — `@` in password breaks URL parsing

**Symptom:** Deploy script reports `❌ Redis not reachable` even though Redis is running.

**Root cause:** The Redis password `ZohoTest@24` contains `@`, which is the credentials/host separator in URLs. `redis://:ZohoTest@24@localhost:6379/0` is ambiguous — the parser thinks the password is `ZohoTest` and the host is `24@localhost`.

**Solution:** URL-encode special characters in the `.env` file:
- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`

```dotenv
# ❌ Wrong
REDIS_URL=redis://:ZohoTest@24@localhost:6379/0

# ✅ Correct
REDIS_URL=redis://:ZohoTest%4024@localhost:6379/0
```

---

### Problem 2: `redis-cli` needs decoded password, not URL-encoded

**Symptom:** Deploy script's Redis check fails. `redis-cli -a ZohoTest%4024 ping` doesn't authenticate.

**Root cause:** The deploy script extracted the password from `REDIS_URL` (which is URL-encoded: `ZohoTest%4024`), but `redis-cli` needs the actual password (`ZohoTest@24`).

**Solution:** Pipe through Python's `urllib.parse.unquote` to decode:

```bash
REDIS_PASS=$(echo "$REDIS_URL" | sed -n 's|redis://:\([^@]*\)@.*|\1|p' \
  | python3 -c "import sys, urllib.parse; print(urllib.parse.unquote(sys.stdin.read().strip()))")
```

---

### Problem 3: `python3 -m venv` fails silently on Ubuntu

**Symptom:** Deploy script passes step [2/6] but backend fails later. The `venv/` directory exists but is broken (missing `venv/bin/activate`).

**Root cause:** On Ubuntu, `python3 -m venv` requires the `python3-venv` package. Without it, the command fails silently and creates an incomplete directory.

**Solution:**
1. Check for `venv/bin/activate` (not just `venv/` directory)
2. Remove broken venvs before retrying
3. Show a helpful error message

```bash
if [ ! -f "venv/bin/activate" ]; then
    rm -rf venv
    python3 -m venv venv || {
        echo "Failed. Run: sudo apt install python3-venv -y"
        exit 1
    }
fi
```

Install fix: `sudo apt install python3-venv -y`

---

### Problem 4: Health check looked for `"ok"` but endpoint returns `"healthy"`

**Symptom:** Deploy script reports `❌ Backend failed` even though gunicorn starts successfully with 3 workers.

**Root cause:** The health endpoint `/api/v1/health` returns `{"status": "healthy"}`, but the deploy script used `grep -q "ok"` — which never matches.

**Solution:** Changed `grep -q "ok"` to `grep -q "healthy"` and added the actual health response to error output for easier debugging.

---

### Problem 5: TypeScript build error — `difficulty` type mismatch

**Symptom:** `npm run build` fails with: `Type 'string' is not assignable to type '"beginner" | "intermediate" | "advanced"'`

**Root cause:** `useState({ difficulty: "beginner" })` infers `difficulty` as `string`, but the API function expects the narrow union type `"beginner" | "intermediate" | "advanced"`.

**Solution:** Cast in the payload:

```typescript
const payload = {
  ...form,
  difficulty: form.difficulty as "beginner" | "intermediate" | "advanced",
  tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
};
```

---

### Problem 6: TypeScript build error — implicit `any[]`

**Symptom:** `npm run build` fails with: `Variable 'featuredArticles' implicitly has type 'any[]'`

**Root cause:** `let featuredArticles = []` is inferred as `any[]` under TypeScript strict mode.

**Solution:** Add explicit type annotation:

```typescript
import { Article } from "@/types";
let featuredArticles: Article[] = [];
```

---

### Problem 7: Frontend screen session dies silently

**Symptom:** `❌ Frontend failed. Debug: screen -r cyberbolt-frontend` but `screen -ls` shows no frontend session.

**Root cause:** Three issues combined:
1. `NEXT_PUBLIC_*` env vars weren't passed during `npm run build` (Next.js inlines them at build time)
2. `INTERNAL_API_URL` wasn't passed to the screen session
3. No log file — the screen session crashed with no trace

**Solution:**
- Pass env vars at build time: `NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" npm run build`
- Pass all env vars to the screen session
- Log output to `/var/log/cyberbolt-frontend.log`
- Verify `.next/standalone/server.js` exists before trying to start
- Print last 10 lines of log on failure

---

### Problem 8: HTTPS not working after redeploy (503 error)

**Symptom:** `http://cyberbolt.in` works but `https://cyberbolt.in` returns 503 / "can't establish connection".

**Root cause:** The deploy script's Nginx step **overwrites** `/etc/nginx/sites-available/cyberbolt` every time with an HTTP-only config, destroying the SSL directives that Certbot had added.

**Solution:** Check if Certbot has already configured SSL before writing the Nginx config:

```bash
if [ -f "$NGINX_CONF" ] && grep -q "ssl_certificate" "$NGINX_CONF"; then
    echo "SSL config exists (managed by Certbot) — skipping overwrite"
else
    cat > "$NGINX_CONF" <<NGINX
    # ... base HTTP config ...
NGINX
fi
```

After fixing, re-run `sudo certbot --nginx -d cyberbolt.in -d www.cyberbolt.in` to restore SSL.

---

### Problem 9: GoDaddy DNS — `www` record conflicts

**Symptom:** Adding an A record for `www` in GoDaddy fails with "Record name www conflicts with another record."

**Root cause:** GoDaddy had an existing **CNAME** record for `www` (default parking page). You can't have both a CNAME and an A record for the same name.

**Solution:** Delete the existing CNAME record for `www` first, then add the A record.

---

### Key Lessons Learned

| Lesson | Detail |
|--------|--------|
| **URL-encode Redis passwords** | Special chars (`@#:`) in passwords break URL parsing |
| **`redis-cli` needs decoded passwords** | URL-encoded values don't work with `redis-cli -a` |
| **Ubuntu needs `python3-venv` package** | `python3 -m venv` fails silently without it |
| **Always match health check strings** | If endpoint returns `"healthy"`, don't grep for `"ok"` |
| **Next.js inlines `NEXT_PUBLIC_*` at build time** | Must be present during `npm run build`, not just at runtime |
| **Log everything in screen sessions** | Redirect stdout/stderr to log files for debugging |
| **Don't overwrite Certbot's Nginx config** | Check for `ssl_certificate` before writing Nginx config |
| **TypeScript strict mode** | Always add explicit types to `let x = []` declarations |
| **Delete conflicting DNS records** | Remove old CNAMEs before adding A records |

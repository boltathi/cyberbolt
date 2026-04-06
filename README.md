# CyberBolt 🔒

> AI Security Articles & Technology Platform

**[cyberbolt.in](https://cyberbolt.in)** — An enterprise-grade web platform built with Flask + Next.js, featuring AI security articles, an AI-powered OWASP Top 10 Checklist Generator, full-text search, and Agentic AI optimizations.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                  │
│                Port 80/443 · SSL · Rate Limiting          │
├────────────────────┬─────────────────────────────────────┤
│                    │                                      │
│  ┌─────────────┐   │   ┌──────────────────────┐          │
│  │   Next.js    │   │   │      Flask API        │          │
│  │  Frontend    │   │   │   Backend (Gunicorn)  │          │
│  │  Port 3000   │   │   │   Port 5000           │          │
│  └─────────────┘   │   └──────────┬───────────┘          │
│                    │              │                        │
│                    │   ┌──────────┴───────────┐           │
│                    │   │    Redis 7            │           │
│                    │   │  5 DBs: Cache ·       │           │
│                    │   │  Sessions · Rate      │           │
│                    │   │  Limits · JWT · Data  │           │
│                    │   └──────────────────────┘           │
│                    │              │                        │
│                    │   ┌──────────┴───────────┐           │
│                    │   │  Ollama (Local LLM)   │           │
│                    │   │  qwen2.5:0.5b · :11434│           │
│                    │   └──────────────────────┘           │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript 5.7, Tailwind CSS 3.4 |
| **Backend** | Flask 3.1, Flask-RESTX, Gunicorn 23, Marshmallow |
| **State** | Zustand 5 (client), Redis 7 (server) |
| **Storage** | Redis DB 4 — all data stored as JSON via `RedisRepository` |
| **Auth** | JWT (access 1h + refresh 7d) with token rotation, Redis blocklist (DB 3) |
| **AI/LLM** | Ollama + Qwen2.5-0.5B (local, CPU-only, ~398 MB) |
| **Deployment** | Contabo VPS, Nginx, screen sessions |
| **SEO** | JSON-LD, Dynamic Sitemap, robots.txt, llms.txt, RSS 2.0, Dynamic OG Images, Canonical URLs |
| **PWA** | @ducanh2912/next-pwa, Workbox, Service Worker, Offline Support, Install Prompt |

## Features

### Content
- 📝 **Articles** — AI security & technology articles with 10 security-focused categories, tags, search, pagination, optional author field, difficulty levels (beginner/intermediate/advanced), and social share buttons (Twitter, LinkedIn, Reddit, HN)
- 📑 **Table of Contents** — Auto-generated sticky TOC sidebar on article pages with IntersectionObserver scroll spy, only shows for articles with 3+ headings
- 🔍 **Search** — Full-text search across articles with real-time results and search bar UI
- 🎯 **Difficulty Levels** — Articles tagged as beginner, intermediate, or advanced with color-coded badges and filter support on the articles page
- 📡 **RSS Feed** — RSS 2.0 feed at `/rss.xml` with Atom self-link and 1-hour caching
- 📖 **Cybersecurity Glossary** — 60+ cybersecurity terms at `/glossary` with definitions, categories, search, alphabetical navigation, and category filtering. Hardcoded in Python — no Redis needed.
- 📩 **Newsletter Signup** — Email subscription form (inline variant at end of articles + compact footer variant), backed by Redis storage with rate limiting and duplicate detection
- 🖼️ **Dynamic OG Images** — Auto-generated Open Graph images at `/og/[slug]` via Next.js `ImageResponse` (edge runtime, 1200×630) with category badge, title, and branding
- 🔗 **Canonical URLs** — Proper `rel="canonical"` and Twitter card metadata on all article pages
- 📋 **Code Copy Button** — One-click copy button on all code blocks in articles, with visual feedback
- 🔀 **Related Articles** — Auto-suggested related articles at the bottom of each article page, based on category with fallback to latest
- 🤖 **Download JSON for LLM** — One-click download of any article as clean JSON (title, content as plaintext, metadata). Feed into ChatGPT, Claude, or any LLM for summaries, analysis, or study notes

### AI Tools
- 🛡️ **OWASP Top 10 Checklist Generator** — Admin-only tool at `/tools/owasp-checklist`. User inputs app name + type, local LLM generates tailored security recommendations for each OWASP Top 10 category. Hybrid architecture: OWASP data hardcoded in Python, LLM only generates contextual recommendations.
- 🔴 **AI/ML CVE Threat Feed** — AI & machine learning vulnerability feed at `/tools/cve-feed` from the National Vulnerability Database (NVD). Filtered for AI/ML-related CVEs using 16 keyword categories (TensorFlow, PyTorch, LangChain, prompt injection, etc.). Shows CVSS severity scores, CISA KEV status, CWE weakness IDs, and references. 7-day Redis cache, daily refresh, 30-day lookback window. Authenticated via NVD API key.
- 🧰 **Tools Index** — Landing page at `/tools` listing all available security tools with descriptions and access requirements.
- 🤖 **Agentic AI** — `llms.txt` / `llms-full.txt` endpoints for AI agent discovery per [llmstxt.org](https://llmstxt.org) spec.

### Admin Panel
- 🔐 **Authentication** — JWT-based login with admin role
- 📊 **Dashboard** — Content statistics and quick actions
- ✏️ **CRUD** — Full create/read/update/delete for articles with optional author field
- 📝 **Rich Text Editor** — Enterprise-grade TipTap WYSIWYG editor with headings (H1-H3), bold/italic/underline/strikethrough, text alignment, bullet & ordered lists, blockquote, inline code, code blocks with syntax highlighting (Lowlight), links, image upload (max 2 MB, stored in Redis), tables (add/remove rows/columns), text color, highlight, undo/redo, floating bubble menu, and **HTML source mode** toggle for pasting raw HTML
- 🖼️ **Image Upload** — Admin-only image upload endpoint (`POST /api/v1/upload/image`). Images up to 2 MB stored as base64 in Redis, served via `GET /api/v1/upload/image/<id>` with immutable caching
- 🏷️ **SEO Fields** — Custom meta titles, descriptions, and OG images per content item

### Infrastructure
- ⚡ **Redis** — 5 databases (DB 0 cache, DB 1 sessions, DB 2 rate-limits, DB 3 JWT blocklist, DB 4 data storage)
- 🧠 **Ollama** — Local LLM server running Qwen2.5-0.5B (~600 MB RAM), auto-unloads after 5 min idle
- 🔒 **Security** — Rate limiting, CORS, HSTS, CSP headers, bcrypt, JWT auth with refresh token rotation, input sanitization (bleach), 5 MB request limit, Marshmallow validation
- 📈 **Scalable** — Gunicorn workers, standalone Next.js, horizontal scaling ready

### Progressive Web App (PWA)
- 📲 **Install Prompt** — "Install CyberBolt" banner appears after 3 seconds, dismissible for 7 days, triggers native app install via `beforeinstallprompt` API
- 📴 **Offline Support** — Previously visited pages cached by service worker. Offline fallback page suggests cached pages (articles, glossary, tools)
- ⚡ **Caching Strategies** — CacheFirst for static assets & Google Fonts (30-day TTL), StaleWhileRevalidate for article & glossary APIs (1-hour TTL), NetworkFirst for CVE feed & page navigations (1-day TTL, 5s timeout)
- 🎨 **Web App Manifest** — Standalone display, teal (#2dd4bf) theme color, app shortcuts for Tools, Articles & Glossary, PWA-optimized icons (192×192, 512×512, maskable)
- 📱 **Native Experience** — Standalone mode, apple-web-app-capable, custom status bar styling, app icon on home screen

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis 7+
- Ollama (for AI tools)

### Development

```bash
# Clone
git clone https://github.com/boltathi/cyberbolt.git
cd cyberbolt

# Copy environment file
cp .env.example .env
# Edit .env with your Redis password, admin credentials, etc.

# Backend (terminal 1)
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
FLASK_ENV=development FLASK_APP=wsgi:app flask run --port=5000

# Frontend (terminal 2)
cd frontend && npm install --legacy-peer-deps
NEXT_PUBLIC_API_URL=http://localhost:5000 INTERNAL_API_URL=http://localhost:5000 npx next dev

# Install Ollama + model (for AI tools)
brew install ollama        # macOS
ollama serve &             # start in background
ollama pull qwen2.5:0.5b   # ~398 MB download

# Seed sample data
cd backend && source venv/bin/activate && python scripts/seed.py

# Run tests
cd backend && source venv/bin/activate && python -m pytest tests/ -v
```

### Access Points
| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Frontend |
| `http://localhost:5000/api/v1/docs` | Swagger API Docs |
| `http://localhost:3000/admin` | Admin Panel |
| `http://localhost:3000/tools/owasp-checklist` | OWASP Checklist Generator (admin) |

### Default Admin Credentials
- **Username:** `admin`
- **Password:** Set via `ADMIN_PASSWORD` in `.env`

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/articles` | List articles (paginated) |
| GET | `/api/v1/articles/featured` | Featured articles |
| GET | `/api/v1/articles/categories` | Article categories |
| GET | `/api/v1/articles/search?q=` | Search articles |
| GET | `/api/v1/articles/<slug>` | Get article by slug |
| POST | `/api/v1/contact` | Submit contact form |
| GET | `/api/v1/ai/llms.txt` | AI-readable site description |
| GET | `/api/v1/ai/content` | All articles as JSON |
| GET | `/api/v1/ai/articles/<slug>.md` | Article as markdown |
| GET | `/api/v1/upload/image/<id>` | Serve uploaded image |
| POST | `/api/v1/newsletter/subscribe` | Subscribe to newsletter |
| GET | `/api/v1/newsletter/unsubscribe` | Unsubscribe (token-verified) |
| GET | `/api/v1/glossary` | List glossary terms (filter by q=, category=) |
| GET | `/api/v1/glossary/<slug>` | Get glossary term by slug |
| GET | `/api/v1/cve/recent` | Recent CVEs from NVD (limit= param) |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login (returns access + refresh JWT) |
| POST | `/api/v1/auth/refresh` | Refresh tokens (rotates refresh token) |
| DELETE | `/api/v1/auth/logout` | Logout (blocklists both tokens) |
| GET | `/api/v1/auth/me` | Current user info |

### Admin (Requires JWT + admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/articles/admin` | Create article |
| PUT | `/api/v1/articles/admin/<id>` | Update article |
| DELETE | `/api/v1/articles/admin/<id>` | Delete article |
| GET | `/api/v1/ai/owasp/app-types` | List OWASP app types |
| POST | `/api/v1/ai/owasp/generate` | Generate OWASP checklist |
| POST | `/api/v1/upload/image` | Upload image (max 2 MB) |
| GET | `/api/v1/newsletter/admin/subscribers` | List newsletter subscribers |
| POST | `/api/v1/newsletter/admin/send` | Send newsletter to all subscribers |

## OWASP Top 10 Checklist Generator

An AI-powered security assessment tool that generates tailored OWASP Top 10 checklists.

### How It Works
1. Admin logs in and navigates to `/tools/owasp-checklist`
2. Inputs an application name (e.g., "ShopApp") and selects a type (e.g., "E-Commerce")
3. Backend iterates all 10 OWASP categories (hardcoded in `owasp_service.py`)
4. For each category, calls the local Ollama LLM to generate a contextual recommendation
5. Python assembles the final JSON response (LLM never produces JSON directly)
6. Frontend displays an interactive checklist with severity badges and progress tracking

### Architecture (Hybrid)
- **OWASP data** — Hardcoded in `backend/app/services/owasp_service.py` (categories, IDs, descriptions, severity). Never generated by the LLM.
- **LLM role** — Only generates 1-2 sentence contextual recommendations per category. Tiny prompt → tiny response.
- **Fallback** — If Ollama is down, returns generic recommendations (no crash).
- **Model** — `qwen2.5:0.5b` (~398 MB disk, ~600 MB RAM). Swap to `qwen2.5:1.5b` for better quality via env var.

### Configuration
```bash
# .env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:0.5b
```

## Deployment (Contabo VPS)

### Server Requirements
- **Minimum**: 4 vCPU, 8 GB RAM, 50 GB disk
- **Recommended**: 6 vCPU, 12 GB RAM, 100 GB NVMe (~€8.33/mo)
- **OS**: Ubuntu 22.04

### Deploy Steps
```bash
# 1. SSH into VPS
ssh root@YOUR_VPS_IP

# 2. Clone repo
git clone https://github.com/boltathi/cyberbolt.git /opt/cyberbolt

# 3. Create .env
cp /opt/cyberbolt/.env.example /opt/cyberbolt/.env
nano /opt/cyberbolt/.env

# 4. Install Ollama + model
sudo /opt/cyberbolt/install-ollama.sh

# 5. Deploy everything
chmod +x /opt/cyberbolt/deploy-contabo.sh
/opt/cyberbolt/deploy-contabo.sh

# 6. SSL (after DNS)
certbot --nginx -d cyberbolt.in -d www.cyberbolt.in
```

### Re-deploy After Code Changes
```bash
cd /opt/cyberbolt && git pull && ./deploy-contabo.sh
```

### DNS Configuration
| Type | Name | Value |
|------|------|-------|
| A | `cyberbolt.in` | `YOUR_VPS_IP` |
| A | `www.cyberbolt.in` | `YOUR_VPS_IP` |

## Project Structure

```
cyberbolt/
├── .github/
│   └── copilot-instructions.md  # AI coding assistant context
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory (create_app)
│   │   ├── config.py            # Config classes (Dev/Prod/Test)
│   │   ├── extensions.py        # Flask extensions init
│   │   ├── models/
│   │   │   ├── base.py          # RedisRepository (JSON + sorted sets)
│   │   │   ├── __init__.py      # Repo factories (get_articles_repo, etc.)
│   │   │   └── schemas.py       # Marshmallow validation schemas
│   │   ├── services/
│   │   │   ├── auth_service.py      # JWT auth + admin bootstrap
│   │   │   ├── article_service.py   # Article CRUD + search
│   │   │   ├── cve_service.py       # CVE feed from NVD + CISA KEV
│   │   │   ├── glossary_service.py  # 60+ cybersecurity terms (hardcoded)
│   │   │   ├── newsletter_service.py # Newsletter send + unsubscribe tokens
│   │   │   └── owasp_service.py     # OWASP checklist + Ollama LLM
│   │   ├── api/v1/
│   │   │   ├── __init__.py      # Blueprint + namespace registration
│   │   │   ├── health.py        # GET /health
│   │   │   ├── auth.py          # Login/logout/refresh/me
│   │   │   ├── articles.py      # Public + admin article endpoints
│   │   │   ├── ai.py            # llms.txt, AI content, OWASP generator
│   │   │   ├── cve.py           # CVE threat feed endpoints
│   │   │   ├── glossary.py      # Glossary endpoints
│   │   │   ├── upload.py        # Image upload/serve (Redis-stored)
│   │   │   ├── contact.py       # Contact form (SMTP)
│   │   │   └── newsletter.py    # Newsletter subscribe/unsubscribe/admin send
│   │   └── utils/
│   │       ├── decorators.py    # @admin_required()
│   │       └── sanitize.py      # HTML/input sanitization
│   ├── scripts/seed.py          # Sample data seeder
│   ├── tests/
│   │   ├── conftest.py          # Fixtures (client, auth_headers)
│   │   └── test_api.py          # API integration tests
│   ├── requirements.txt
│   └── wsgi.py                  # Gunicorn entry point
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout (Header/Footer/InstallPrompt)
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── not-found.tsx        # 404 page
│   │   │   ├── _offline/page.tsx    # PWA offline fallback page
│   │   │   ├── robots.ts            # robots.txt generator
│   │   │   ├── sitemap.ts           # Sitemap generator
│   │   │   ├── about/
│   │   │   │   ├── page.tsx           # About page (team, stats, values, tech, timeline, FAQ)
│   │   │   │   └── FaqAccordion.tsx   # Client-side FAQ accordion component
│   │   │   ├── contact/page.tsx     # Contact form
│   │   │   ├── glossary/page.tsx    # Cybersecurity glossary (60+ terms)
│   │   │   ├── newsletter/
│   │   │   │   └── unsubscribe/page.tsx # Public unsubscribe page
│   │   │   ├── articles/            # Article list + search + [slug] detail
│   │   │   ├── og/[slug]/route.tsx  # Dynamic OG image generation (edge)
│   │   │   ├── rss.xml/route.ts     # RSS 2.0 feed
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx                  # Tools index page
│   │   │   │   ├── owasp-checklist/page.tsx  # OWASP generator (admin-only)
│   │   │   │   └── cve-feed/page.tsx         # CVE threat feed (public)
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx       # Admin shell + auth guard
│   │   │   │   ├── page.tsx         # Dashboard
│   │   │   │   ├── login/           # Login page (own layout)
│   │   │   │   ├── articles/        # Article CRUD pages
│   │   │   │   ├── newsletter/page.tsx # Newsletter compose + subscriber list
│   │   │   ├── llms.txt/route.ts        # Proxy to backend
│   │   │   └── llms-full.txt/route.ts   # Proxy to backend
│   │   ├── components/
│   │   │   ├── article/
│   │   │   │   ├── ShareButtons.tsx   # Social share (Twitter, LinkedIn, Reddit, HN, copy)
│   │   │   │   ├── TableOfContents.tsx # Sticky TOC with scroll spy
│   │   │   │   ├── NewsletterCTA.tsx # Newsletter signup (inline + footer)
│   │   │   │   ├── CodeCopyButton.tsx # Copy button for code blocks
│   │   │   │   ├── RelatedArticles.tsx # Related articles suggestions
│   │   │   │   └── DownloadArticleJson.tsx # Download article as JSON for LLM
│   │   │   ├── editor/
│   │   │   │   └── RichTextEditor.tsx # TipTap WYSIWYG editor + image upload
│   │   │   ├── ui/
│   │   │   │   ├── CopyLinkButton.tsx # Copy-to-clipboard button (legacy)
│   │   │   │   └── InstallPrompt.tsx  # PWA install prompt banner
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx       # Nav bar (5 links incl. Tools)
│   │   │   │   └── Footer.tsx       # Site footer (newsletter, RSS, GitHub)
│   │   │   └── seo/
│   │   │       └── JsonLd.tsx       # Structured data components
│   │   ├── lib/
│   │   │   ├── api.ts           # fetchAPI, fetchServerAPI, all API clients
│   │   │   ├── store.ts         # Zustand auth store
│   │   │   └── utils.ts         # cn(), CATEGORIES (10), readingTime(), utilities
│   │   └── types/
│   │       └── index.ts         # TypeScript interfaces
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   ├── scripts/
│   │   └── generate-icons.js    # PWA icon generator (sharp)
│   └── public/
│       ├── manifest.json        # PWA Web App Manifest
│       ├── icon.svg             # SVG logo (shield + bolt)
│       ├── favicon.ico          # Favicon (32×32)
│       ├── apple-touch-icon.png # Apple touch icon (180×180)
│       └── icons/               # PWA icons (192, 512, maskable)
├── site.conf                    # Project-specific config (ports, name, emoji)
├── deploy-contabo.sh            # Unified deployment script (reads site.conf)
├── migrate.sh                   # Data migration manager (backup/audit/migrate/rollback/cleanup)
├── install-ollama.sh            # Ollama + model installer
├── backups/                     # Redis RDB + JSON backups (gitignored)
├── research.md                  # Comprehensive technical documentation for newbies
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key-change-me` |
| `JWT_SECRET_KEY` | JWT signing key | `jwt-secret-change-me` |
| `ADMIN_USERNAME` | Admin login | `admin` |
| `ADMIN_PASSWORD` | Admin password | `change-me-in-production` |
| `REDIS_URL` | Redis cache (DB 0) | `redis://localhost:6379/0` |
| `REDIS_DATA_URL` | Redis data store (DB 4) | `redis://localhost:6379/4` |
| `OLLAMA_URL` | Ollama API URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | LLM model name | `qwen2.5:0.5b` |
| `NVD_API_KEY` | NVD API key for CVE feed (50 req/30s) | (empty) |
| `DOMAIN` | Site domain | `cyberbolt.in` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend → backend URL | `http://localhost:5000` |
| `INTERNAL_API_URL` | Server-side → backend URL | `http://localhost:5000` |
| `SMTP_USER` | Gmail address for contact | (empty) |
| `SMTP_PASSWORD` | Gmail app password | (empty) |
| `CONTACT_EMAIL` | Recipient for contact form | (empty) |

## Roadmap

- [x] OWASP Top 10 Checklist Generator (Ollama + Qwen2.5)
- [x] Article search with search bar UI
- [x] Blog removed — content unified into Articles
- [x] Enterprise TipTap WYSIWYG editor with image upload
- [x] Image upload stored in Redis (max 2 MB)
- [x] Optional author field on articles
- [x] Copy link button on article detail page
- [x] Migration manager (`migrate.sh`) — backup, audit, migrate, rollback, cleanup
- [x] RSS 2.0 feed (`/rss.xml`)
- [x] Active nav highlighting with `usePathname`
- [x] Security-focused categories (10, removed lifestyle)
- [x] About page rewrite with real identity
- [x] About page enhancement (stats bar, tech stack, timeline, values, skills tags, FAQ, structured data)
- [x] Social share buttons (Twitter, LinkedIn, Reddit, HN)
- [x] Table of Contents sidebar with scroll spy
- [x] Newsletter signup (inline + footer, Redis backend)
- [x] Newsletter admin panel (compose, send, subscriber list, unsubscribe)
- [x] Dynamic OG image generation (edge runtime)
- [x] Canonical URLs and Twitter card metadata
- [x] Code copy button on all code blocks
- [x] Related articles section on article pages
- [x] Download article as JSON for LLM consumption
- [x] JWT security hardening (refresh token rotation, dual blocklisting, 7d refresh TTL)
- [x] Comprehensive research.md documentation for newbie developers
- [x] Cybersecurity glossary (60+ terms, searchable, categorized)
- [x] CVE threat feed (NVD API + CISA KEV, public)
- [x] Difficulty levels on articles (beginner/intermediate/advanced)
- [x] Tools index page
- [x] Content coverage for all 10 categories
- [x] Unified deployment script (`site.conf` + shared `deploy-contabo.sh`)
- [x] Progressive Web App (PWA) with offline support
- [x] Install prompt ("Add to Home Screen" banner)
- [x] Offline fallback page with cached page suggestions
- [x] Service worker with multi-strategy caching (articles, glossary, CVE feed)
- [x] PWA icons and Web App Manifest
- [ ] Comments system
- [ ] Analytics dashboard
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Prometheus + Grafana)

## License

MIT © CyberBolt

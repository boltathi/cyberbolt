# CyberBolt 🔒

> AI Security Learning Hub, Technology Articles & Lifestyle Blog

**[cyberbolt.in](https://cyberbolt.in)** — An enterprise-grade web platform built with Flask + Next.js, featuring AI security articles, structured learning paths, a lifestyle blog, and Agentic AI optimizations.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)              │
│                Port 80/443 · SSL · Rate Limiting      │
├────────────────────┬────────────────────────────────┤
│                    │                                  │
│  ┌─────────────┐   │   ┌──────────────────────┐      │
│  │   Next.js    │   │   │      Flask API        │      │
│  │  Frontend    │   │   │   Backend (Gunicorn)  │      │
│  │  Port 3000   │   │   │   Port 5000           │      │
│  └─────────────┘   │   └──────────┬───────────┘      │
│                    │              │                    │
│                    │   ┌──────────┴───────────┐      │
│                    │   │    Redis 7            │      │
│                    │   │  Cache · Sessions     │      │
│                    │   │  Rate Limits · JWT    │      │
│                    │   └──────────────────────┘      │
│                    │              │                    │
│                    │   ┌──────────┴───────────┐      │
│                    │   │  JSON File Storage    │      │
│                    │   │  (Prototyping)        │      │
│                    │   └──────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript 5.7, Tailwind CSS 3.4 |
| **Backend** | Flask 3.1, Flask-RESTX, Gunicorn 23, Marshmallow |
| **State** | Zustand 5 (client), Redis 7 (server) |
| **Storage** | JSON files with filelock (prototyping) |
| **Auth** | JWT (access + refresh) with Redis blocklist |
| **Deployment** | Docker Compose, Nginx, Contabo VPS |
| **SEO** | JSON-LD, Dynamic Sitemap, robots.txt, llms.txt |

## Features

### Content
- 📝 **Articles** — AI security articles with categories, tags, search, and pagination
- 📚 **Learning Hub** — Structured learning paths with 8 categories and 3 difficulty levels
- ✍️ **Blog** — Lifestyle/personal blog with rich content
- 🔍 **Search** — Full-text search across all content

### Admin Panel
- 🔐 **Authentication** — JWT-based login with admin role
- 📊 **Dashboard** — Content statistics and quick actions
- ✏️ **CRUD** — Full create/read/update/delete for articles, blog posts, and learning resources
- 🏷️ **SEO Fields** — Custom meta titles, descriptions, and OG images per content item

### SEO & AI
- 🗺️ **Dynamic Sitemap** — Auto-generated from published content
- 🤖 **llms.txt** — [Agentic AI specification](https://llmstxt.org/) for AI crawler discovery
- 📄 **llms-full.txt** — Extended version with full article content
- 📊 **JSON-LD** — Structured data (WebSite, Article, Person, BlogPosting)
- 🌐 **AI Bot Whitelisting** — GPTBot, Claude-Web, Anthropic-AI in robots.txt

### Infrastructure
- 🐳 **Docker Compose** — 4 services (backend, frontend, redis, nginx)
- ⚡ **Redis** — 4 databases (cache, sessions, rate-limits, JWT blocklist)
- 🔒 **Security** — Rate limiting, CORS, HSTS, CSP headers, bcrypt
- 📈 **Scalable** — Gunicorn workers, standalone Next.js, horizontal scaling ready

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cyberbolt.git
cd cyberbolt

# Copy environment file
cp .env.example .env

# Start all services
make dev
# or: docker compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/v1/
# Swagger Docs: http://localhost:5000/api/v1/docs
# Admin Panel: http://localhost:3000/admin
```

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `cyberbolt_admin_2024` (change in `.env`)

### Using the Makefile

```bash
make dev          # Start development
make build        # Build all containers
make up           # Start production
make down         # Stop all services
make logs         # View logs
make clean        # Remove containers and volumes
make seed         # Seed sample data
make test         # Run backend tests
make shell-back   # Shell into backend container
make shell-front  # Shell into frontend container
```

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
| GET | `/api/v1/blog` | List blog posts |
| GET | `/api/v1/blog/<slug>` | Get blog post by slug |
| GET | `/api/v1/learning/categories` | Learning categories |
| GET | `/api/v1/learning/paths` | Learning paths |
| GET | `/api/v1/learning/resources` | List resources |
| GET | `/api/v1/ai/llms.txt` | AI-readable site description |
| GET | `/api/v1/ai/content` | All articles as JSON |
| GET | `/api/v1/ai/articles/<slug>.md` | Article as markdown |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (blocklist token) |
| GET | `/api/v1/auth/me` | Current user info |

### Admin (Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/articles` | Create article |
| PUT | `/api/v1/articles/<id>` | Update article |
| DELETE | `/api/v1/articles/<id>` | Delete article |
| POST | `/api/v1/blog` | Create blog post |
| PUT | `/api/v1/blog/<id>` | Update blog post |
| DELETE | `/api/v1/blog/<id>` | Delete blog post |
| POST | `/api/v1/learning/resources` | Create resource |
| PUT | `/api/v1/learning/resources/<id>` | Update resource |
| DELETE | `/api/v1/learning/resources/<id>` | Delete resource |

## Deployment (Contabo VPS)

### 1. Provision VPS
- Recommended: **Cloud VPS 20** (6 vCPU, 12GB RAM, 100GB NVMe, ~€8.33/mo)
- OS: Ubuntu 22.04

### 2. Deploy
```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Download and run deployment script
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/cyberbolt/main/scripts/deploy.sh | bash
```

### 3. SSL Setup
```bash
# After DNS is configured
bash /opt/cyberbolt/scripts/setup-ssl.sh
```

### 4. DNS Configuration
Point these records to your VPS IP:
- `A` record: `cyberbolt.in` → `YOUR_VPS_IP`
- `A` record: `www.cyberbolt.in` → `YOUR_VPS_IP`

## Project Structure

```
cyberbolt/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory
│   │   ├── config.py            # Configuration
│   │   ├── extensions.py        # Flask extensions
│   │   ├── models/
│   │   │   ├── base.py          # JsonRepository (file storage)
│   │   │   ├── __init__.py      # Repository factories
│   │   │   └── schemas.py       # Marshmallow schemas
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── article_service.py
│   │   │   ├── blog_service.py
│   │   │   └── learning_service.py
│   │   ├── api/v1/
│   │   │   ├── health.py
│   │   │   ├── auth.py
│   │   │   ├── articles.py
│   │   │   ├── blog.py
│   │   │   ├── learning.py
│   │   │   └── ai.py
│   │   └── utils/decorators.py
│   ├── scripts/seed.py
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── wsgi.py
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # API client, store, utils
│   │   └── types/               # TypeScript interfaces
│   ├── Dockerfile
│   ├── next.config.ts
│   └── package.json
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
├── scripts/
│   ├── deploy.sh
│   └── setup-ssl.sh
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
└── .env.example
```

## Environment Variables

See `.env.example` for all available configuration options. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment mode | `development` |
| `SECRET_KEY` | Flask secret key | (random) |
| `JWT_SECRET_KEY` | JWT signing key | (random) |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | (see .env.example) |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379/0` |

## Roadmap

- [ ] Markdown editor with live preview
- [ ] Image upload (S3/local)
- [ ] Email newsletter integration
- [ ] Comments system
- [ ] Analytics dashboard
- [ ] Migrate to PostgreSQL
- [ ] Full-text search with Elasticsearch
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Prometheus + Grafana)

## License

MIT © CyberBolt

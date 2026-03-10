# CyberBolt — Copilot Instructions

## Architecture Overview

CyberBolt is a Flask + Next.js content platform: **backend** (Flask :5000), **frontend** (Next.js :3000), and **Redis** (5 DBs). All data is stored in Redis (DB 4) via `RedisRepository` — no filesystem storage.

## Backend (Flask)

- **App factory** pattern in `backend/app/__init__.py` — `create_app(config_name)` initializes extensions and registers a single API blueprint.
- **Layered architecture**: API routes (`api/v1/`) → Services (`services/`) → Repository (`models/base.py`). Never access `RedisRepository` directly from routes — always go through a service class.
- **API routes** use Flask-RESTX `Namespace`/`Resource` classes. Each namespace is registered in `api/v1/__init__.py`. Public endpoints and admin endpoints coexist in the same file (e.g., `/articles` is public, `/articles/admin` requires auth).
- **Data layer**: `RedisRepository` in `models/base.py` stores each record as a JSON string in Redis, with sorted-set indexes for ordering and set indexes for fast filtered queries. Obtain repos via factory functions in `models/__init__.py` (e.g., `get_articles_repo()`). The repo caches instances in `_repos` dict — tests must clear `_repos` between runs (see `conftest.py`).
- **Validation**: Marshmallow schemas in `models/schemas.py` with `@pre_load` hooks for auto-slug generation via `python-slugify`.
- **Auth**: JWT via `flask-jwt-extended`. Admin routes use `@admin_required()` decorator from `utils/decorators.py` which checks `role` claim. Token blocklist stored in Redis DB 3.
- **Redis databases**: DB 0 = cache, DB 1 = sessions, DB 2 = rate limits, DB 3 = JWT blocklist, DB 4 = data storage. Redis is **required** — the app cannot store data without it.
- **Content lifecycle**: Articles/blog posts have `status` field (`draft`/`published`). `published_at` is auto-set on first transition to `published`. Public endpoints filter by `status="published"` by default.
- **Swagger docs** auto-generated at `/api/v1/docs` by Flask-RESTX.

## Frontend (Next.js 15 / React 19)

- **App Router** with `src/app/` directory structure. Public pages use server-side fetching (`fetchServerAPI`), admin pages use client-side fetching (`fetchAPI`) with JWT from localStorage.
- **Two fetch functions** in `lib/api.ts`: `fetchServerAPI` (server components, uses `INTERNAL_API_URL`, revalidates at 60s in prod / 0 in dev) and `fetchAPI` (client-side, attaches Bearer token from localStorage).
- **State management**: Zustand store in `lib/store.ts` for auth state only. Content data is fetched per-page, not stored globally.
- **Admin panel** at `/admin/*` is fully client-side (`"use client"`). Auth guard in `admin/layout.tsx` redirects to `/admin/login` if unauthenticated. Login page uses its own layout (no sidebar).
- **SEO components** in `components/seo/JsonLd.tsx` — use `ArticleJsonLd`, `BlogPostJsonLd`, `WebSiteJsonLd` for structured data. Every content page should include appropriate JSON-LD.
- **AI discoverability**: `llms.txt/route.ts` and `llms-full.txt/route.ts` are Next.js route handlers proxying to the backend's `/api/v1/ai/llms.txt` with static fallback.
- **Styling**: Tailwind CSS with dark theme (bg-gray-950, text-gray-100). Use `cn()` from `lib/utils.ts` for conditional class merging (tailwind-merge). Two font variables: `--font-inter` (body) and `--font-jetbrains` (code).
- **TypeScript types** in `types/index.ts` — always use these interfaces (`Article`, `BlogPost`, `LearningResource`, `PaginatedResponse<T>`) for API responses.

## Key Developer Commands

```bash
# Backend (terminal 1)
cd backend && source venv/bin/activate
FLASK_ENV=development FLASK_APP=wsgi:app flask run --port=5000

# Frontend (terminal 2)
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:5000 INTERNAL_API_URL=http://localhost:5000 npx next dev

# Tests
cd backend && source venv/bin/activate && python -m pytest tests/ -v

# Seed data
cd backend && source venv/bin/activate && python scripts/seed.py
```

## Patterns to Follow

- **New content type**: Add repo factory in `models/__init__.py` → service class in `services/` → RESTX namespace in `api/v1/` → register namespace in `api/v1/__init__.py` → add TypeScript type in `types/index.ts` → add API client in `lib/api.ts`.
- **New admin CRUD page**: Create `admin/<entity>/page.tsx` (list) and `admin/<entity>/[id]/page.tsx` (edit form). Use `"use client"` directive, fetch via `fetchAPI`, and follow the pattern in `admin/articles/`.
- **Tests**: Use fixtures from `conftest.py` — `client` for unauthenticated requests, `auth_headers` for admin. Tests use `TestingConfig` (SimpleCache, rate limiting disabled, Redis DB 15 for isolation).
- **Environment config**: All env vars go through `config.py` classes with `os.getenv()` defaults. Never hardcode URLs or secrets.

# CyberBolt — Research & Technical Documentation

> A complete, beginner-friendly guide to understanding how CyberBolt works — from zero to production. This document explains every framework, pattern, and design decision so anyone can build a similar application.

**Last updated:** April 2026  
**Author:** Athithan Raj V  
**Repository:** [github.com/boltathi/cyberbolt](https://github.com/boltathi/cyberbolt)

---

## Table of Contents

1. [What Is CyberBolt?](#1-what-is-cyberbolt)
2. [Architecture Overview](#2-architecture-overview)
3. [Backend — Flask (Python)](#3-backend--flask-python)
   - [What Is Flask?](#31-what-is-flask)
   - [App Factory Pattern](#32-app-factory-pattern)
   - [Configuration Management](#33-configuration-management)
   - [Flask Extensions Used](#34-flask-extensions-used)
   - [Layered Architecture](#35-layered-architecture)
   - [API Routes with Flask-RESTX](#36-api-routes-with-flask-restx)
   - [Data Layer — RedisRepository](#37-data-layer--redisrepository)
   - [Validation with Marshmallow](#38-validation-with-marshmallow)
   - [Authentication — JWT Deep Dive](#39-authentication--jwt-deep-dive)
   - [Security Measures](#310-security-measures)
4. [Frontend — Next.js (React)](#4-frontend--nextjs-react)
   - [What Is Next.js?](#41-what-is-nextjs)
   - [App Router and File-Based Routing](#42-app-router-and-file-based-routing)
   - [Server Components vs Client Components](#43-server-components-vs-client-components)
   - [Two Fetch Functions — Why?](#44-two-fetch-functions--why)
   - [State Management with Zustand](#45-state-management-with-zustand)
   - [Styling with Tailwind CSS](#46-styling-with-tailwind-css)
   - [TypeScript Types](#47-typescript-types)
   - [SEO Features](#48-seo-features)
   - [Rich Text Editor — TipTap](#49-rich-text-editor--tiptap)
5. [Database — Redis](#5-database--redis)
6. [AI Layer — Ollama](#6-ai-layer--ollama)
7. [Deployment — Contabo VPS](#7-deployment--contabo-vps)
8. [Security Architecture](#8-security-architecture)
9. [How to Build This From Scratch](#9-how-to-build-this-from-scratch)
10. [Glossary](#10-glossary)

---

## 1. What Is CyberBolt?

CyberBolt is a **content platform** focused on AI security and cybersecurity articles. Think of it as a self-hosted blog engine with:

- A **Python/Flask backend** that serves a REST API
- A **Next.js/React frontend** that renders the website
- **Redis** as the sole database (no PostgreSQL, no MongoDB)
- **Ollama** (local LLM) for AI-powered features
- Everything deployed on a single **VPS (Virtual Private Server)**

The key design decision: **no traditional database**. All data lives in Redis as JSON strings with sorted-set indexes. This makes the system extremely simple to set up (no database migrations, no schemas) but trades off advanced querying capabilities.

---

## 2. Architecture Overview

```
Browser (User) ──→ Nginx (port 80/443) ──→ Next.js (port 3000) ──→ Flask API (port 5000) ──→ Redis (port 6379)
                                                                                           ──→ Ollama (port 11434)
```

### Request Flow

**Public pages (articles, about, home):**
1. User visits `https://cyberbolt.in/articles`
2. Nginx receives the request, proxies to Next.js (port 3000)
3. Next.js **server component** calls Flask API internally (`http://localhost:5000/api/v1/articles`)
4. Flask reads from Redis, returns JSON
5. Next.js renders the HTML with the data and sends it to the browser
6. The page is **server-rendered** — Google can index it, fast first load

**Admin pages (create article, dashboard):**
1. Admin visits `https://cyberbolt.in/admin/articles`
2. Nginx → Next.js serves the page shell (HTML/JS)
3. The page is a **client component** (`"use client"`) — it runs in the browser
4. JavaScript fetches data from Flask API with a JWT token in the `Authorization` header
5. Flask verifies the JWT, checks the `role` claim, returns data
6. React renders the content in the browser

### Why This Architecture?

| Choice | Reason |
|--------|--------|
| **Separate frontend/backend** | Each can be developed, deployed, and scaled independently |
| **Server-side rendering for public pages** | SEO — search engines see fully rendered HTML |
| **Client-side rendering for admin** | Admin panel doesn't need SEO; simpler auth with localStorage |
| **Redis instead of PostgreSQL** | Zero setup, no migrations, works instantly. Suitable for a content site with <10K records |
| **Nginx reverse proxy** | SSL termination, rate limiting, static file serving, single entry point |

---

## 3. Backend — Flask (Python)

### 3.1 What Is Flask?

Flask is a **micro web framework** for Python. "Micro" means it gives you the essentials (URL routing, request/response handling, templating) and lets you pick extensions for everything else.

```python
# The simplest Flask app
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, World!"

# Run: flask run
```

**Flask vs Django:** Django is a "batteries included" framework (ORM, admin panel, auth built in). Flask is minimal — you add what you need. CyberBolt uses Flask because:
- We don't need Django's ORM (we use Redis, not SQL)
- We want full control over the API structure
- Flask-RESTX gives us auto-generated Swagger docs

### 3.2 App Factory Pattern

Instead of creating the Flask app at module level, CyberBolt uses the **factory pattern** — a function that creates and configures the app:

```python
# backend/app/__init__.py
def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object(config_map[config_name])
    
    # Initialize extensions
    cache.init_app(app)
    cors.init_app(app, ...)
    jwt.init_app(app)
    limiter.init_app(app)
    
    # Initialize Redis
    init_redis(app)
    
    # Register API routes
    from .api.v1 import api_bp
    app.register_blueprint(api_bp)
    
    return app
```

**Why the factory pattern?**
- **Testing**: Create a separate app instance with `TestingConfig` (different Redis DB, rate limiting disabled)
- **Multiple configs**: Switch between development, production, and testing configurations
- **Circular imports**: Extensions are defined once, initialized with the app later

### 3.3 Configuration Management

All configuration flows through Python classes with environment variable overrides:

```python
# backend/app/config.py
class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    ...

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    CACHE_TYPE = "SimpleCache"          # In-memory, no Redis needed for cache

class ProductionConfig(BaseConfig):
    pass                                # Uses all base defaults (Redis cache)

class TestingConfig(BaseConfig):
    TESTING = True
    REDIS_DATA_URL = "redis://localhost:6379/15"  # Isolated DB for tests
```

**Pattern**: Every config value has a sensible default via `os.getenv("VAR", "default")`. In production, values come from `.env` files or system environment variables. In development, defaults just work.

### 3.4 Flask Extensions Used

| Extension | Purpose | How It's Used |
|-----------|---------|---------------|
| **Flask-RESTX** | REST API framework + Swagger docs | Defines `Namespace`/`Resource` classes for each endpoint group |
| **Flask-JWT-Extended** | JWT authentication | Creates/verifies tokens, token blocklist, role claims |
| **Flask-Caching** | Response caching | Redis-backed cache for frequently accessed data |
| **Flask-CORS** | Cross-Origin Resource Sharing | Allows the Next.js frontend (port 3000) to call Flask (port 5000) |
| **Flask-Limiter** | Rate limiting | `5/minute` on login, `60/minute` on list endpoints, etc. |

Extensions follow a pattern: **define globally, initialize with app**.

```python
# backend/app/extensions.py
from flask_jwt_extended import JWTManager
jwt = JWTManager()              # Define (no app yet)

# backend/app/__init__.py
jwt.init_app(app)               # Initialize with the app
```

### 3.5 Layered Architecture

CyberBolt separates concerns into three layers:

```
API Routes (api/v1/*.py)  →  Services (services/*.py)  →  Repository (models/base.py)
    ↕                            ↕                              ↕
HTTP request/response      Business logic               Redis read/write
```

**Rule**: Routes never access Redis directly. They always go through a service.

```python
# ❌ BAD — route directly accesses Redis
@ns.route("/admin")
class AdminArticleList(Resource):
    def post(self):
        repo = get_articles_repo()
        article = repo.create(data)  # Direct repo access in a route!

# ✅ GOOD — route calls a service
@ns.route("/admin")
class AdminArticleList(Resource):
    def post(self):
        article = ArticleService.create(data)  # Service handles validation + repo
```

**Why layers?**
- **Routes** handle HTTP concerns: parsing request bodies, setting status codes, rate limiting
- **Services** handle business logic: slug generation, status transitions, validation
- **Repository** handles data I/O: Redis commands, indexing, pagination

### 3.6 API Routes with Flask-RESTX

Flask-RESTX structures APIs using **Namespaces** (groups of related endpoints) and **Resources** (individual endpoint classes):

```python
# backend/app/api/v1/articles.py
from flask_restx import Namespace, Resource

ns = Namespace("articles", description="Cybersecurity articles")

@ns.route("")                    # → GET /api/v1/articles
class ArticleList(Resource):
    def get(self):
        """List published articles."""
        page = request.args.get("page", 1, type=int)
        articles, total = ArticleService.get_all(page=page)
        return {"articles": articles, "total": total, "page": page}

@ns.route("/<string:slug>")     # → GET /api/v1/articles/my-article-slug
class ArticleBySlug(Resource):
    def get(self, slug):
        """Get a single article."""
        article = ArticleService.get_by_slug(slug)
        if not article:
            return {"error": "Not found"}, 404
        return {"article": article}

@ns.route("/admin")             # → POST /api/v1/articles/admin (admin only)
class AdminArticleList(Resource):
    @admin_required()           # ← JWT + admin role check
    def post(self):
        """Create article."""
        data = request.get_json()
        article = ArticleService.create(data)
        return {"article": article}, 201
```

Namespaces are registered in `api/v1/__init__.py`:

```python
# backend/app/api/v1/__init__.py
api = Api(api_bp, doc="/docs")   # Swagger UI at /api/v1/docs

from .articles import ns as articles_ns
from .auth import ns as auth_ns
api.add_namespace(articles_ns, path="/articles")
api.add_namespace(auth_ns, path="/auth")
```

### 3.7 Data Layer — RedisRepository

This is the most unique part of CyberBolt. Instead of a SQL database, everything is stored in Redis.

#### How Records Are Stored

Each record is stored as **three Redis data structures**:

```
1. String:     articles:<uuid>                    → JSON blob (the full record)
2. Sorted Set: articles:_idx                      → score=timestamp, member=uuid
3. Set:        articles:_f:category:ai-security   → set of UUIDs matching this filter
```

**Example**: Creating an article:

```python
# What the code does:
repo.create({
    "title": "SQL Injection Guide",
    "category": "web-security",
    "status": "published"
})

# What happens in Redis:
SET  articles:abc-123  '{"id":"abc-123","title":"SQL Injection Guide","category":"web-security","status":"published","created_at":"2026-04-03T..."}'
ZADD articles:_idx     1743638400 abc-123
SADD articles:_f:category:web-security    abc-123
SADD articles:_f:status:published         abc-123
```

#### How Queries Work

**Get by ID** — O(1): Direct key lookup
```python
GET articles:abc-123  → parse JSON → return dict
```

**Filter by category** — O(n) but fast with sets:
```python
SMEMBERS articles:_f:category:web-security  → {abc-123, def-456}
# Then GET each record individually
```

**Pagination** — Uses sorted set ordering:
```python
ZREVRANGE articles:_idx 0 -1    # All IDs sorted by creation time (newest first)
# Then slice by page/per_page in Python
```

**Full-text search** — Brute force (not optimized):
```python
# Scans ALL records, checks if query appears in title/content/excerpt
for rid in all_ids:
    record = GET(rid)
    if query in record.title.lower() or query in record.content.lower():
        matches.append(record)
```

#### Limitations

| Feature | CyberBolt (Redis) | Traditional DB (PostgreSQL) |
|---------|-------------------|----------------------------|
| Simple CRUD | ✅ Works great | ✅ Works great |
| Full-text search | ⚠️ Brute force scan | ✅ GIN indexes, `tsvector` |
| Complex joins | ❌ Not supported | ✅ SQL JOINs |
| Transactions | ⚠️ Pipeline (partial) | ✅ Full ACID |
| Scaling to 100K+ records | ⚠️ Memory-bound | ✅ Disk-based, optimized |
| Setup complexity | ✅ Zero migrations | ⚠️ Schema migrations needed |

**When is this approach OK?** For content sites with <10,000 records and simple query patterns. CyberBolt has articles, users, and newsletter subscribers — all simple CRUD.

### 3.8 Validation with Marshmallow

Marshmallow validates and transforms incoming data before it reaches the service layer:

```python
# backend/app/models/schemas.py
from marshmallow import Schema, fields, pre_load
from slugify import slugify

class ArticleCreateSchema(Schema):
    title = fields.Str(required=True)            # Must be present
    content = fields.Str(required=True)           # Must be present
    category = fields.Str(load_default="ai-security")  # Default if missing
    tags = fields.List(fields.Str(), load_default=[])
    status = fields.Str(load_default="draft")
    author = fields.Str(load_default="")

    @pre_load
    def normalize_fields(self, data, **kwargs):
        # Auto-generate slug from title
        if "title" in data and "slug" not in data:
            data["slug"] = slugify(data["title"])
        return data
```

**How it's used in routes:**

```python
from marshmallow import ValidationError

@admin_required()
def post(self):
    data = request.get_json()
    try:
        article = ArticleService.create(data)   # Schema validates inside service
    except ValidationError as e:
        return {"error": str(e.messages)}, 400   # Return which fields failed
    return {"article": article}, 201
```

### 3.9 Authentication — JWT Deep Dive

#### What Is JWT?

JSON Web Token (JWT) is a compact, URL-safe token format. It has three parts separated by dots:

```
header.payload.signature

eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZXhwIjoxNzQzNjM4NDAwLCJyb2xlIjoiYWRtaW4ifQ.signature_here
```

Decoded payload:
```json
{
  "sub": "dcb8995d-9399-4cf0-a062-12e8e8d9ddc1",  // User ID
  "exp": 1743638400,                                // Expires at (Unix timestamp)
  "role": "admin",                                   // Custom claim
  "jti": "unique-token-id",                          // For blocklisting
  "type": "access"                                   // access or refresh
}
```

#### CyberBolt's JWT Configuration

| Setting | Value | Why |
|---------|-------|-----|
| Access token lifetime | **1 hour** (3600s) | Short-lived — limits damage if stolen |
| Refresh token lifetime | **7 days** (604800s) | Longer-lived — used to get new access tokens |
| Algorithm | **HS256** | HMAC with SHA-256 — good for single-server setups |
| Token location | **Authorization header** | `Authorization: Bearer <token>` |
| Blocklist storage | **Redis DB 3** | Logged-out tokens are blocklisted until they expire |
| Refresh token rotation | **Yes** | Old refresh token is blocklisted when a new one is issued |

#### Login Flow

```
1. Client POST /api/v1/auth/login  { username, password }
2. Server verifies password with bcrypt
3. Server creates access_token (1h) + refresh_token (7d)
4. Client stores both tokens in localStorage
5. Client sends access_token in every API request header
```

#### Token Refresh Flow (with Rotation)

```
1. Access token expires after 1 hour
2. Client sends refresh_token to POST /api/v1/auth/refresh
3. Server verifies refresh_token, blocklists the OLD refresh token
4. Server returns NEW access_token + NEW refresh_token
5. Client replaces both tokens in localStorage
```

**Why rotation?** If a refresh token is stolen, it can only be used once. The moment the legitimate user or the attacker uses it, the other's copy becomes invalid.

#### Logout Flow

```
1. Client sends DELETE /api/v1/auth/logout (with token in header)
2. Server adds the token's JTI (unique ID) to the Redis blocklist
3. Any future requests with this token are rejected
4. Blocklist entry auto-expires after the token's original TTL
```

#### The `@admin_required()` Decorator

```python
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()              # 1. Is there a valid JWT?
            claims = get_jwt()                    # 2. Decode it
            if claims.get("role") != "admin":     # 3. Is the role "admin"?
                return {"error": "Admin access required"}, 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
```

#### Security Improvements Made

| Before | After | Why |
|--------|-------|-----|
| Refresh token: 30 days | Refresh token: 7 days | Less exposure window |
| Logout only blocklists access token | Logout blocklists both access AND refresh tokens | Prevents minting new tokens after logout |
| Refresh returns same refresh token | Refresh rotates — old one is blocklisted | Stolen refresh tokens become single-use |
| Frontend uses POST for logout | Frontend uses DELETE for logout | Matches backend route method |

### 3.10 Security Measures

CyberBolt implements defense-in-depth across multiple layers:

| Layer | Measure | Code Location |
|-------|---------|---------------|
| **Transport** | HTTPS enforced via HSTS header | `__init__.py` after_request |
| **Input** | Marshmallow schema validation | `models/schemas.py` |
| **Input** | HTML sanitization with bleach (whitelist-based) | `utils/sanitize.py` |
| **Input** | Request body size limit (5 MB) | `__init__.py` MAX_CONTENT_LENGTH |
| **Auth** | bcrypt password hashing | `services/auth_service.py` |
| **Auth** | JWT with short-lived access tokens | `config.py` |
| **Auth** | Token blocklist on logout | `api/v1/auth.py` |
| **Auth** | Refresh token rotation | `api/v1/auth.py` |
| **Rate Limiting** | Login: 5/min, API: 60/min, Search: 30/min | `api/v1/*.py` decorators |
| **Headers** | CSP, X-Frame-Options, X-Content-Type-Options | `__init__.py` after_request |
| **CORS** | Whitelist of allowed origins | `__init__.py` cors.init_app |
| **Data** | UUID validation on all record IDs | `models/base.py` _validate_id |
| **Storage** | Max 10,000 records per collection | `models/base.py` _MAX_RECORDS |

---

## 4. Frontend — Next.js (React)

### 4.1 What Is Next.js?

Next.js is a **React framework** that adds:
- **Server-side rendering (SSR)** — Pages are rendered on the server as HTML, so search engines can index them
- **File-based routing** — Create a file at `app/about/page.tsx` → it becomes the `/about` route
- **API routes** — Write serverless functions alongside your pages
- **Image optimization, caching, code splitting** — Production optimizations built in

**React alone** renders everything in the browser (client-side). **Next.js** can render on the server too, giving you SEO and faster initial page loads.

### 4.2 App Router and File-Based Routing

Next.js 15 uses the **App Router** where the file system defines the routes:

```
frontend/src/app/
├── page.tsx                      → /
├── about/page.tsx                → /about
├── articles/
│   ├── page.tsx                  → /articles
│   └── [slug]/page.tsx           → /articles/any-slug-here (dynamic route)
├── admin/
│   ├── layout.tsx                → Wraps all /admin/* pages (auth guard)
│   ├── page.tsx                  → /admin
│   └── articles/
│       ├── page.tsx              → /admin/articles
│       └── [id]/page.tsx         → /admin/articles/some-uuid
├── og/[slug]/route.tsx           → /og/any-slug (API route, not a page)
├── rss.xml/route.ts              → /rss.xml (API route)
└── layout.tsx                    → Root layout (wraps EVERYTHING)
```

**Key concepts:**
- `page.tsx` — A route/page component
- `layout.tsx` — Wraps child pages (persistent across navigations)
- `[slug]` — Dynamic segment (captured as a parameter)
- `route.ts` — API route handler (returns raw data, not HTML)

### 4.3 Server Components vs Client Components

This is the **most important concept** in modern Next.js:

| | Server Component (default) | Client Component (`"use client"`) |
|---|---|---|
| **Runs where** | Server only | Browser (hydrated) |
| **Can use** | `async/await`, database calls, file system | `useState`, `useEffect`, `onClick`, browser APIs |
| **Good for** | Data fetching, SEO content | Interactive UI, forms, auth state |
| **Example** | Article detail page | Login form, TipTap editor, share buttons |

```tsx
// Server Component (default) — runs on the server
export default async function ArticlePage({ params }) {
  const article = await articlesAPI.get(params.slug);  // Fetches on server
  return <h1>{article.title}</h1>;                     // Rendered as HTML
}

// Client Component — runs in the browser
"use client";
export default function ShareButtons({ url }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(url); setCopied(true); };
  return <button onClick={handleCopy}>Copy</button>;   // Needs browser APIs
}
```

**CyberBolt's split:**
- **Server components**: Home page, article list, article detail, about, contact, sitemap, robots
- **Client components**: Admin pages, login form, TipTap editor, share buttons, newsletter CTA, code copy button, download JSON button

### 4.4 Two Fetch Functions — Why?

CyberBolt has two different fetch functions:

```typescript
// 1. fetchServerAPI — for server components
// Called during server-side rendering, no auth needed, uses internal URL
async function fetchServerAPI<T>(endpoint: string): Promise<T> {
  const backendUrl = process.env.INTERNAL_API_URL || "http://backend:5000";
  const res = await fetch(`${backendUrl}/api/v1${endpoint}`, {
    next: { revalidate: 60 },  // Cache for 60 seconds in production
  });
  return res.json();
}

// 2. fetchAPI — for client components (admin panel)
// Called from the browser, attaches JWT token from localStorage
async function fetchAPI<T>(endpoint: string, options = {}): Promise<T> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/api/v1${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return res.json();
}
```

**Why two?**
- Server components run on the server — they can call Flask directly via `localhost:5000` (fast, no internet roundtrip)
- Client components run in the browser — they need the public URL and must attach auth tokens
- Server components can't access `localStorage` (it doesn't exist on the server)

### 4.5 State Management with Zustand

Zustand is a minimal state management library (like Redux but 10x simpler). CyberBolt uses it **only for auth state**:

```typescript
// frontend/src/lib/store.ts
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("access_token");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    // On page load, check localStorage for existing tokens
    const token = localStorage.getItem("access_token");
    if (token) set({ accessToken: token, isAuthenticated: true });
  },
}));
```

**Why Zustand over Redux?** CyberBolt only has one piece of global state (auth). Zustand is 1 file, ~30 lines, no boilerplate. Redux would be overkill.

**Why not React Context?** Context re-renders all consumers on any change. Zustand only re-renders components that use the specific slice of state that changed.

### 4.6 Styling with Tailwind CSS

Tailwind is a **utility-first CSS framework**. Instead of writing CSS classes, you apply utility classes directly in your HTML:

```tsx
// Traditional CSS approach:
// .article-card { border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 24px; }
// <div className="article-card">

// Tailwind approach (CyberBolt):
<div className="rounded-xl border border-white/10 bg-gray-900/50 p-6 hover:border-cyber-400/30">
```

**CyberBolt's custom design system** (defined in `globals.css`):

```css
.cyber-card { @apply rounded-xl border border-white/10 bg-gray-900/50 p-6 ...; }
.cyber-btn  { @apply rounded-lg bg-cyber-600 px-4 py-2 text-white ...; }
.cyber-input { @apply rounded-lg border border-white/10 bg-gray-900/50 ...; }
.prose-cyber { @apply prose prose-invert max-w-none prose-headings:text-white ...; }
```

**`cn()` utility** — merges Tailwind classes intelligently:

```typescript
import { twMerge } from "tailwind-merge";
export function cn(...classes) {
  return twMerge(classes.filter(Boolean).join(" "));
}

// Usage: cn("text-red-500", isActive && "text-green-500")
// If both are passed, twMerge keeps only "text-green-500" (no conflict)
```

### 4.7 TypeScript Types

All API responses have TypeScript interfaces:

```typescript
// frontend/src/types/index.ts
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  author?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
```

**Why types?** TypeScript catches errors at compile time. If the API returns `article.titl` (typo), TypeScript shows an error before you even run the code.

### 4.8 SEO Features

CyberBolt implements several SEO optimizations:

| Feature | Implementation | File |
|---------|---------------|------|
| **Dynamic `<title>` and `<meta>`** | `generateMetadata()` in each page | `articles/[slug]/page.tsx` |
| **JSON-LD structured data** | `ArticleJsonLd`, `WebSiteJsonLd` components | `components/seo/JsonLd.tsx` |
| **Dynamic sitemap** | Fetches all articles, generates XML | `app/sitemap.ts` |
| **robots.txt** | Allows search engines, blocks admin paths | `app/robots.ts` |
| **RSS feed** | RSS 2.0 XML at `/rss.xml` | `app/rss.xml/route.ts` |
| **Dynamic OG images** | Generated per article with title + category | `app/og/[slug]/route.tsx` |
| **Canonical URLs** | `<link rel="canonical">` on every article | `articles/[slug]/page.tsx` |
| **llms.txt** | AI agent discoverability | `app/llms.txt/route.ts` |

### 4.9 Rich Text Editor — TipTap

TipTap is a headless editor framework built on ProseMirror. CyberBolt's editor includes 16+ extensions:

```
Headings (H1-H3) | Bold | Italic | Underline | Strikethrough
Text Alignment | Bullet Lists | Ordered Lists | Blockquote
Inline Code | Code Blocks (syntax-highlighted) | Links
Image Upload (max 2MB, stored in Redis) | Tables
Text Color | Highlight | Undo/Redo | Floating Bubble Menu
HTML Source Mode Toggle
```

**Image upload flow:**
1. User clicks the image button or drags an image into the editor
2. JavaScript reads the file, validates size (<2MB) and type (JPEG/PNG/GIF/WebP/SVG)
3. Sends `POST /api/v1/upload/image` with the file as FormData + JWT token
4. Flask saves the image as base64 in Redis: `images:<uuid>` hash
5. Returns the URL: `/api/v1/upload/image/<uuid>`
6. TipTap inserts an `<img>` tag with that URL into the content

---

## 5. Database — Redis

Redis is an **in-memory data store**. It's extremely fast (sub-millisecond reads) because everything lives in RAM.

### CyberBolt's 5 Redis Databases

Redis supports 16 databases (numbered 0-15). CyberBolt uses 5:

| DB | Purpose | Data Stored |
|----|---------|------------|
| 0 | Cache | Cached API responses (TTL-based) |
| 1 | Sessions | Reserved for future use |
| 2 | Rate Limits | Request counters per IP/endpoint |
| 3 | JWT Blocklist | Revoked token JTIs (auto-expire) |
| 4 | Data Storage | Articles, users, subscribers, images |

### Data Structures Used

| Redis Type | CyberBolt Use |
|------------|---------------|
| **String** | Each record stored as a JSON string |
| **Sorted Set** | Index of all record IDs, scored by timestamp (for pagination/ordering) |
| **Set** | Secondary indexes for filtering (e.g., all articles with `category:web-security`) |
| **Hash** | Image storage (stores base64 data, content type, filename per image) |

### Persistence

Redis stores data in memory but can persist to disk:
- **RDB snapshots** — Periodic point-in-time snapshots (default: every 60s if 1000+ keys changed)
- **AOF (Append Only File)** — Logs every write operation

CyberBolt relies on RDB snapshots. If Redis crashes between snapshots, you may lose the last few seconds of data. For a content site, this is acceptable.

---

## 6. AI Layer — Ollama

Ollama runs **Large Language Models locally** on your server. No API keys, no cloud costs, no data leaving your machine.

### How CyberBolt Uses Ollama

**OWASP Checklist Generator** — the only AI-powered feature:

```python
# backend/app/services/owasp_service.py (simplified)

# OWASP categories are HARDCODED in Python — never generated by the LLM
OWASP_CATEGORIES = [
    {"id": "A01", "name": "Broken Access Control", "severity": "critical", ...},
    {"id": "A02", "name": "Cryptographic Failures", "severity": "high", ...},
    ...
]

def generate_checklist(app_name, app_type):
    results = []
    for category in OWASP_CATEGORIES:
        # LLM only generates a short recommendation
        recommendation = call_ollama(
            f"Give a 1-2 sentence security recommendation for {category['name']} "
            f"specifically for a {app_type} application called {app_name}."
        )
        results.append({**category, "recommendation": recommendation})
    return results

def call_ollama(prompt):
    try:
        response = requests.post(f"{OLLAMA_URL}/api/generate", json={
            "model": "qwen2.5:0.5b",
            "prompt": prompt,
            "stream": False,
        }, timeout=30)
        return response.json()["response"]
    except:
        return "Review this category for potential vulnerabilities."  # Fallback
```

**Key design decisions:**
1. **OWASP data is never generated by the LLM** — categories, IDs, descriptions, and severity are all hardcoded. The LLM only adds a contextual sentence.
2. **Fallback on failure** — If Ollama is down, the tool returns generic recommendations instead of crashing.
3. **Tiny model** — `qwen2.5:0.5b` (398 MB) runs on CPU-only servers. No GPU required.

---

## 7. Deployment — Contabo VPS

### Server Setup

| Component | How It Runs |
|-----------|------------|
| **Nginx** | systemd service — reverse proxy, SSL, rate limiting |
| **Flask (Gunicorn)** | screen session — `gunicorn --workers 3 --bind 0.0.0.0:5000 wsgi:app` |
| **Next.js** | screen session — `node .next/standalone/server.js` |
| **Redis** | systemd service — `redis-server` |
| **Ollama** | systemd service — `ollama serve` |

### Nginx Configuration (simplified)

```nginx
server {
    listen 443 ssl;
    server_name cyberbolt.in;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
    }
}
```

### Deployment Script

`deploy-contabo.sh` automates the entire deployment:
1. Pull latest code from GitHub
2. Install/update Python dependencies
3. Install/update Node.js dependencies
4. Build Next.js (`npx next build`)
5. Restart Flask (kill old screen, start new one)
6. Restart Next.js (kill old screen, start new one)
7. Reload Nginx config

---

## 8. Security Architecture

### Defense in Depth

```
Layer 1: Nginx
├── SSL/TLS termination (HTTPS only)
├── Rate limiting (10 req/s per IP)
├── Client body size limit (3 MB)
└── Security headers (HSTS, X-Frame-Options)

Layer 2: Flask Application
├── CORS whitelist (only allow cyberbolt.in)
├── Rate limiting per endpoint (5/min login, 60/min API)
├── Request body size limit (5 MB)
├── Security headers (CSP, X-Content-Type-Options)
└── Input validation (Marshmallow schemas)

Layer 3: Authentication
├── bcrypt password hashing (cost factor 12)
├── JWT with 1-hour access tokens
├── Refresh token rotation (one-time use)
├── Token blocklist on logout (both tokens)
└── Admin role verification via JWT claims

Layer 4: Data
├── HTML sanitization (bleach — whitelist-based)
├── UUID validation on all record IDs
├── Max 10,000 records per collection (DoS guard)
└── Redis password authentication
```

### Remaining Risks and Mitigations

| Risk | Current Status | Recommendation |
|------|---------------|----------------|
| JWT in localStorage (XSS can steal it) | ⚠️ Current approach | CSP headers block inline scripts. Consider HttpOnly cookies for higher security. |
| No error tracking | ❌ Missing | Add Sentry for production error monitoring |
| No web analytics | ❌ Missing | Add Plausible or Umami (privacy-focused) |
| Single server | ⚠️ SPOF | Acceptable for a content site. Use Redis backups. |
| Default secret keys | ⚠️ Risky if not overridden | Always set `SECRET_KEY` and `JWT_SECRET_KEY` via env vars in production |

---

## 9. How to Build This From Scratch

### Step-by-Step Roadmap (4-Week Plan)

#### Week 1: Backend Foundation

```bash
# Create project structure
mkdir -p cyberbolt/backend/app/{api/v1,models,services,utils}
cd cyberbolt/backend

# Set up Python environment
python3 -m venv venv && source venv/bin/activate
pip install flask flask-restx flask-jwt-extended flask-cors flask-caching flask-limiter
pip install redis marshmallow python-slugify bcrypt bleach gunicorn
pip freeze > requirements.txt
```

**Build in this order:**
1. `app/config.py` — Configuration classes
2. `app/extensions.py` — Flask extension instances
3. `app/__init__.py` — App factory with `create_app()`
4. `app/models/base.py` — `RedisRepository` class
5. `app/models/__init__.py` — Repository factory functions
6. `app/services/auth_service.py` — Password hashing + admin bootstrap
7. `app/api/v1/auth.py` — Login/logout/refresh endpoints
8. `app/utils/decorators.py` — `@admin_required()` decorator
9. `app/models/schemas.py` — Marshmallow validation schemas
10. `app/services/article_service.py` — Article CRUD logic
11. `app/api/v1/articles.py` — Article endpoints (public + admin)
12. `wsgi.py` — Gunicorn entry point

#### Week 2: Frontend Foundation

```bash
cd cyberbolt/frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir
npm install zustand lucide-react tailwind-merge date-fns
```

**Build in this order:**
1. `src/types/index.ts` — TypeScript interfaces
2. `src/lib/utils.ts` — Helper functions, constants, categories
3. `src/lib/api.ts` — `fetchServerAPI` and `fetchAPI` functions + API clients
4. `src/lib/store.ts` — Zustand auth store
5. `src/app/layout.tsx` — Root layout (header, footer, fonts)
6. `src/components/layout/Header.tsx` — Navigation bar
7. `src/components/layout/Footer.tsx` — Footer
8. `src/app/page.tsx` — Homepage
9. `src/app/articles/page.tsx` — Article list with search + category filter
10. `src/app/articles/[slug]/page.tsx` — Article detail page

#### Week 3: Admin Panel + Editor

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline
# ... (all TipTap extensions)
```

**Build in this order:**
1. `src/app/admin/login/page.tsx` — Login form
2. `src/app/admin/layout.tsx` — Auth guard layout
3. `src/app/admin/page.tsx` — Dashboard with stats
4. `src/components/editor/RichTextEditor.tsx` — TipTap WYSIWYG
5. `src/app/admin/articles/page.tsx` — Article list (admin)
6. `src/app/admin/articles/[id]/page.tsx` — Article create/edit form
7. Image upload endpoint (`api/v1/upload.py`)

#### Week 4: SEO, Deployment, Polish

**Build in this order:**
1. `src/components/seo/JsonLd.tsx` — Structured data
2. `src/app/sitemap.ts` — Dynamic XML sitemap
3. `src/app/robots.ts` — robots.txt
4. `src/app/rss.xml/route.ts` — RSS feed
5. `src/app/og/[slug]/route.tsx` — Dynamic OG images
6. Share buttons, TOC, newsletter CTA, code copy button
7. `deploy-contabo.sh` — Deployment script
8. Nginx configuration + SSL setup
9. Test everything end-to-end

### Key Decisions You'll Face

| Decision | CyberBolt's Choice | Alternatives |
|----------|-------------------|--------------|
| Database | Redis (simple, fast, no migrations) | PostgreSQL (scalable, complex queries), MongoDB (document store), SQLite (embedded) |
| Auth | JWT in localStorage | Session cookies (more secure against XSS), OAuth providers |
| Editor | TipTap (headless, customizable) | Quill (simpler), CKEditor (enterprise), Markdown-only (easiest) |
| CSS | Tailwind (utility-first) | CSS Modules, Styled Components, plain CSS |
| Deployment | VPS + screen sessions | Docker Compose, Kubernetes, Vercel + Railway, serverless |
| LLM | Ollama (local, free) | OpenAI API (better quality, costs money), no AI features |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **API** | Application Programming Interface — a contract for how software communicates. CyberBolt's API returns JSON data. |
| **App Factory** | A function that creates and configures a Flask application instance. Enables multiple configs. |
| **bcrypt** | A password hashing algorithm that intentionally runs slowly, making brute-force attacks impractical. |
| **Blueprint** | Flask's way of organizing related routes into groups. CyberBolt has one blueprint: `api_bp`. |
| **CORS** | Cross-Origin Resource Sharing — browser security feature. Flask must explicitly allow requests from the Next.js origin. |
| **CSP** | Content Security Policy — HTTP header that tells the browser which scripts/styles/images are allowed to load. |
| **HSTS** | HTTP Strict Transport Security — tells browsers to only connect via HTTPS, never HTTP. |
| **Hydration** | The process where React attaches event handlers to server-rendered HTML in the browser. |
| **JWT** | JSON Web Token — a self-contained token with user identity and claims, signed with a secret key. |
| **JTI** | JWT ID — a unique identifier for each token, used for blocklisting specific tokens. |
| **Middleware** | Code that runs between receiving a request and sending a response (e.g., auth checks, rate limiting). |
| **Namespace** | Flask-RESTX concept — groups related API endpoints (e.g., all article routes under `/articles`). |
| **OG Image** | Open Graph image — the preview image shown when sharing a link on social media. |
| **ORM** | Object-Relational Mapping — maps database tables to Python classes. CyberBolt doesn't use one (Redis isn't relational). |
| **Rate Limiting** | Restricting the number of API requests a client can make in a time window (e.g., 5 login attempts per minute). |
| **Resource** | Flask-RESTX class representing a single API endpoint with HTTP methods (GET, POST, PUT, DELETE). |
| **RSA/HMAC** | Signing algorithms for JWT. HMAC (HS256) uses a shared secret; RSA (RS256) uses public/private keys. |
| **Server Component** | Next.js component that runs only on the server — can fetch data, access databases, no browser APIs. |
| **Sorted Set** | Redis data structure — like a set but each member has a score. Used for ordered indexes. |
| **SSR** | Server-Side Rendering — generating HTML on the server instead of in the browser. Better for SEO. |
| **Zustand** | Minimal React state management library — alternative to Redux with much less boilerplate. |

---

*This document is part of the CyberBolt project. For setup instructions, see [README.md](README.md).*

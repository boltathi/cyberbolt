import type {
  Article,
  BlogPost,
  LearningResource,
  PaginatedResponse,
  AuthTokens,
  User,
  OwaspChecklistResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Client-side fetch
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Server-side fetch (no auth, direct backend)
async function fetchServerAPI<T>(endpoint: string): Promise<T> {
  const backendUrl =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:5000";
  const res = await fetch(`${backendUrl}/api/v1${endpoint}`, {
    next: { revalidate: process.env.NODE_ENV === "development" ? 0 : 60 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Normalizers: map backend field names → frontend TypeScript types ───
/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeArticle(raw: any): Article {
  return {
    ...raw,
    featured: raw.is_featured ?? raw.featured ?? false,
    published: raw.status ? raw.status === "published" : (raw.published ?? false),
    og_image: raw.featured_image ?? raw.og_image ?? "",
  };
}

function normalizeBlogPost(raw: any): BlogPost {
  return {
    ...raw,
    published: raw.status ? raw.status === "published" : (raw.published ?? false),
    og_image: raw.featured_image ?? raw.og_image ?? "",
  };
}

function normalizeLearningResource(raw: any): LearningResource {
  return {
    ...raw,
    published: raw.status ? raw.status === "published" : (raw.published ?? false),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Articles API
export const articlesAPI = {
  list: async (page = 1, per_page = 12, category?: string) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(per_page) });
    if (category) params.set("category", category);
    const data = await fetchServerAPI<{ articles: any[]; total: number; page: number; pages: number }>(`/articles?${params}`);
    return { items: data.articles.map(normalizeArticle), total: data.total, page: data.page, per_page, total_pages: data.pages } as PaginatedResponse<Article>;
  },
  get: async (slug: string) => {
    const data = await fetchServerAPI<{ article: any }>(`/articles/${slug}`);
    return normalizeArticle(data.article);
  },
  featured: async () => {
    const data = await fetchServerAPI<{ articles: any[] }>("/articles/featured");
    return data.articles.map(normalizeArticle);
  },
  categories: async () => {
    const data = await fetchServerAPI<{ categories: string[] }>("/articles/categories");
    return data.categories;
  },
  search: async (q: string) => {
    const data = await fetchServerAPI<{ articles: any[] }>(`/articles/search?q=${encodeURIComponent(q)}`);
    return data.articles.map(normalizeArticle);
  },

  // Admin
  create: async (data: Partial<Article>) => {
    const raw = await fetchAPI<any>("/articles/admin", { method: "POST", body: JSON.stringify(data) });
    return normalizeArticle(raw.article ?? raw);
  },
  update: async (id: string, data: Partial<Article>) => {
    const raw = await fetchAPI<any>(`/articles/admin/${id}`, { method: "PUT", body: JSON.stringify(data) });
    return normalizeArticle(raw.article ?? raw);
  },
  delete: (id: string) => fetchAPI<void>(`/articles/admin/${id}`, { method: "DELETE" }),
  adminList: async (page = 1, per_page = 20) => {
    const data = await fetchAPI<{ articles: any[]; total: number; page: number; pages: number }>(`/articles/admin?page=${page}&per_page=${per_page}`);
    return { items: data.articles.map(normalizeArticle), total: data.total, page: data.page, per_page, total_pages: data.pages } as PaginatedResponse<Article>;
  },
};

// Blog API
export const blogAPI = {
  list: async (page = 1, per_page = 12) => {
    const data = await fetchServerAPI<{ posts: any[]; total: number; page: number; pages: number }>(`/blog?page=${page}&per_page=${per_page}`);
    return { items: data.posts.map(normalizeBlogPost), total: data.total, page: data.page, per_page, total_pages: data.pages } as PaginatedResponse<BlogPost>;
  },
  get: async (slug: string) => {
    const data = await fetchServerAPI<{ post: any }>(`/blog/${slug}`);
    return normalizeBlogPost(data.post);
  },

  // Admin
  create: async (data: Partial<BlogPost>) => {
    const raw = await fetchAPI<any>("/blog/admin", { method: "POST", body: JSON.stringify(data) });
    return normalizeBlogPost(raw.post ?? raw);
  },
  update: async (id: string, data: Partial<BlogPost>) => {
    const raw = await fetchAPI<any>(`/blog/admin/${id}`, { method: "PUT", body: JSON.stringify(data) });
    return normalizeBlogPost(raw.post ?? raw);
  },
  delete: (id: string) => fetchAPI<void>(`/blog/admin/${id}`, { method: "DELETE" }),
  adminList: async (page = 1, per_page = 20) => {
    const data = await fetchAPI<{ posts: any[]; total: number; page: number; pages: number }>(`/blog/admin?page=${page}&per_page=${per_page}`);
    return { items: data.posts.map(normalizeBlogPost), total: data.total, page: data.page, per_page, total_pages: data.pages } as PaginatedResponse<BlogPost>;
  },
};

// Learning API
export const learningAPI = {
  categories: () => fetchServerAPI<{ categories: Array<{ id: string; name: string; description: string; icon: string; count: number }> }>("/learning/categories"),
  paths: () => fetchServerAPI<{ paths: Array<{ id: string; title: string; description: string; difficulty: string; estimated_hours: number; topics: string[] }> }>("/learning/paths"),
  resources: async (category?: string) => {
    const params = category ? `?category=${category}` : "";
    const data = await fetchServerAPI<{ resources: any[]; total: number; page: number; pages: number }>(`/learning/resources${params}`);
    return { items: data.resources.map(normalizeLearningResource), total: data.total, page: data.page, per_page: 20, total_pages: data.pages } as PaginatedResponse<LearningResource>;
  },
  get: async (id: string) => {
    const data = await fetchServerAPI<{ resource: any }>(`/learning/resources/${id}`);
    return normalizeLearningResource(data.resource);
  },

  // Admin
  create: async (data: Partial<LearningResource>) => {
    const raw = await fetchAPI<any>("/learning/admin", { method: "POST", body: JSON.stringify(data) });
    return normalizeLearningResource(raw.resource ?? raw);
  },
  update: async (id: string, data: Partial<LearningResource>) => {
    const raw = await fetchAPI<any>(`/learning/admin/${id}`, { method: "PUT", body: JSON.stringify(data) });
    return normalizeLearningResource(raw.resource ?? raw);
  },
  delete: (id: string) => fetchAPI<void>(`/learning/admin/${id}`, { method: "DELETE" }),
  adminList: async (page = 1, per_page = 20) => {
    const data = await fetchAPI<{ resources: any[]; total: number; page: number; pages: number }>(`/learning/admin?page=${page}&per_page=${per_page}`);
    return { items: data.resources.map(normalizeLearningResource), total: data.total, page: data.page, per_page, total_pages: data.pages } as PaginatedResponse<LearningResource>;
  },
};

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    fetchAPI<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  refresh: (refreshToken: string) =>
    fetchAPI<{ access_token: string }>("/auth/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
  logout: () => fetchAPI<void>("/auth/logout", { method: "POST" }),
  me: () => fetchAPI<User>("/auth/me"),
};

// AI content API
export const aiAPI = {
  llmsTxt: () =>
    fetch(`${API_BASE}/api/v1/ai/llms.txt`).then((r) => r.text()),
  content: () => fetchServerAPI<{ articles: Article[] }>("/ai/content"),
};

// OWASP Checklist Generator API (admin-only)
export const owaspAPI = {
  generate: (appName: string, appType: string) =>
    fetchAPI<OwaspChecklistResponse>("/ai/owasp/generate", {
      method: "POST",
      body: JSON.stringify({ app_name: appName, app_type: appType }),
    }),
  appTypes: () =>
    fetchAPI<{ app_types: string[] }>("/ai/owasp/app-types").then((d) => d.app_types),
};

import type {
  Article,
  BlogPost,
  LearningResource,
  PaginatedResponse,
  AuthTokens,
  User,
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
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

// Articles API
export const articlesAPI = {
  list: (page = 1, per_page = 12, category?: string) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(per_page) });
    if (category) params.set("category", category);
    return fetchServerAPI<PaginatedResponse<Article>>(`/articles?${params}`);
  },
  get: (slug: string) => fetchServerAPI<Article>(`/articles/${slug}`),
  featured: () => fetchServerAPI<Article[]>("/articles/featured"),
  categories: () => fetchServerAPI<string[]>("/articles/categories"),
  search: (q: string) => fetchServerAPI<Article[]>(`/articles/search?q=${encodeURIComponent(q)}`),

  // Admin
  create: (data: Partial<Article>) => fetchAPI<Article>("/articles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Article>) => fetchAPI<Article>(`/articles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/articles/${id}`, { method: "DELETE" }),
  adminList: (page = 1, per_page = 20) =>
    fetchAPI<PaginatedResponse<Article>>(`/articles?page=${page}&per_page=${per_page}`),
};

// Blog API
export const blogAPI = {
  list: (page = 1, per_page = 12) =>
    fetchServerAPI<PaginatedResponse<BlogPost>>(`/blog?page=${page}&per_page=${per_page}`),
  get: (slug: string) => fetchServerAPI<BlogPost>(`/blog/${slug}`),

  // Admin
  create: (data: Partial<BlogPost>) => fetchAPI<BlogPost>("/blog", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BlogPost>) => fetchAPI<BlogPost>(`/blog/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/blog/${id}`, { method: "DELETE" }),
  adminList: (page = 1, per_page = 20) =>
    fetchAPI<PaginatedResponse<BlogPost>>(`/blog?page=${page}&per_page=${per_page}`),
};

// Learning API
export const learningAPI = {
  categories: () => fetchServerAPI<{ categories: Record<string, { name: string; description: string; icon: string }> }>("/learning/categories"),
  paths: () => fetchServerAPI<{ paths: Array<{ id: string; name: string; description: string; resources: string[] }> }>("/learning/paths"),
  resources: (category?: string) => {
    const params = category ? `?category=${category}` : "";
    return fetchServerAPI<PaginatedResponse<LearningResource>>(`/learning/resources${params}`);
  },
  get: (id: string) => fetchServerAPI<LearningResource>(`/learning/resources/${id}`),

  // Admin
  create: (data: Partial<LearningResource>) => fetchAPI<LearningResource>("/learning/resources", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<LearningResource>) => fetchAPI<LearningResource>(`/learning/resources/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI<void>(`/learning/resources/${id}`, { method: "DELETE" }),
  adminList: (page = 1, per_page = 20) =>
    fetchAPI<PaginatedResponse<LearningResource>>(`/learning/resources?page=${page}&per_page=${per_page}`),
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

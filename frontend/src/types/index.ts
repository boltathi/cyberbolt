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
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  reading_time?: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  reading_time?: number;
  created_at: string;
  updated_at: string;
}

export interface LearningResource {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  description?: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resource_type?: string;
  estimated_minutes?: number;
  external_url?: string;
  is_free?: boolean;
  tags: string[];
  published: boolean;
  order: number;
  meta_title?: string;
  meta_description?: string;
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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface DashboardStats {
  articles: number;
  blog_posts: number;
  learning_resources: number;
}

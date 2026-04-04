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
  difficulty?: "beginner" | "intermediate" | "advanced";
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  reading_time?: number;
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
  subscribers: number;
}

export interface OwaspChecklistItem {
  id: string;
  category: string;
  severity: string;
  description: string;
  recommendation: string;
  checked: boolean;
}

export interface OwaspChecklistResponse {
  app_name: string;
  app_type: string;
  checklist: OwaspChecklistItem[];
  generated_at: string;
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category: string;
}

export interface CVEEntry {
  id: string;
  description: string;
  cvss_score: number | null;
  cvss_severity: string;
  cvss_vector: string;
  published: string;
  references: { url: string; source: string }[];
  weaknesses: string[];
  in_kev: boolean;
  nvd_url: string;
}

export interface CVEFeedResponse {
  cves: CVEEntry[];
  total: number;
  updated_at: string;
  source: string;
}

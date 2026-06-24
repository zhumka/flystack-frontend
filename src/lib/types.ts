// Типы ответов Go-API (соответствуют моделям бэкенда).

export interface Work {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  year: number | null;
  cover_url: string | null;
  tagline: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: unknown;
  services: string[];
  gallery: string[];
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WorkRef {
  id: string;
  slug: string;
  title: string;
  category: string;
}

export interface ReviewItem {
  id: string;
  author_name: string;
  role_text: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  work: WorkRef;
}

export interface ReviewsFeed {
  reviews: ReviewItem[];
  summary: { average: number; count: number };
}

export interface ReviewsCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface MyReviews {
  reviews: ReviewItem[];
  counts: ReviewsCounts;
}

export interface User {
  id: string;
  email: string | null;
  name: string;
  role: "user" | "admin";
  email_verified: boolean;
  auth_provider: "email" | "google" | "telegram";
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResult {
  user: User;
  tokens: Tokens;
}

export interface SiteContent {
  id: string;
  key: string;
  locale: "ru" | "en";
  value: unknown;
  updated_at: string;
  updated_by: string | null;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  service: string;
  budget: string;
  message: string;
  status: "new" | "in_progress" | "done";
  created_at: string;
}

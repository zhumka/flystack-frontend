// Типы ответов Go-API (соответствуют моделям бэкенда).

// Поддерживаемые локали (бэкенд: ru/en, дефолт ru).
export type Locale = "ru" | "en";

// Локализованный текст в админских ответах works — объект {ru,en}.
export interface LocalizedText {
  ru?: string;
  en?: string;
}

// Публичный Work: тексты уже свёрнуты в одну локаль (бэкенд резолвит по ?locale=).
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

// AdminWork: тот же work, но локализованные поля приходят/уходят объектами {ru,en}.
export interface AdminWork {
  id: string;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  category: string;
  year: number | null;
  cover_url: string | null;
  tagline: LocalizedText;
  challenge: LocalizedText;
  solution: LocalizedText;
  result: LocalizedText;
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

// Тонкий клиент Go-API. Работает и на сервере (SSR), и в браузере.
// Токен доступа в браузере берётся из localStorage (см. auth.ts).

import { getAccessToken } from "./auth";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // добавить Authorization из localStorage
  // Кеш для серверных GET (Next.js). По умолчанию без кеша.
  revalidate?: number;
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  if (opts.auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const next =
    opts.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined;

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: next ? undefined : "no-store",
    next,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && data.error) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, String(message));
  }

  return data as T;
}

// Безопасный GET для серверных компонентов: при сбое возвращает fallback,
// чтобы страница рендерилась даже если API недоступен.
export async function apiGetSafe<T>(
  path: string,
  fallback: T,
  revalidate = 60,
): Promise<T> {
  try {
    return await apiRequest<T>(path, { revalidate });
  } catch {
    return fallback;
  }
}

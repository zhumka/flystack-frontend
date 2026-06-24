// Клиентское хранилище токенов и текущего пользователя (только в браузере).
import type { AuthResult, Tokens, User } from "./types";

const ACCESS_KEY = "flystack_access";
const REFRESH_KEY = "flystack_refresh";
const USER_KEY = "flystack_user";

// Событие смены авторизации в текущей вкладке — навбар и прочие клиентские
// компоненты подписываются на него, чтобы обновиться без перезагрузки страницы.
export const AUTH_EVENT = "flystack-auth";

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function saveAuth(result: AuthResult) {
  saveTokens(result.tokens);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  notifyAuthChange();
}

export function saveTokens(tokens: Tokens) {
  localStorage.setItem(ACCESS_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

// Точечно обновляет сохранённого пользователя (например, email_verified после
// подтверждения почты) и оповещает подписчиков — без повторного логина.
export function updateStoredUser(patch: Partial<User>) {
  const current = getStoredUser();
  if (!current) return;
  localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...patch }));
  notifyAuthChange();
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

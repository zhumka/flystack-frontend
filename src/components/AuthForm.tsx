"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, ApiError, apiRequest } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { AuthResult } from "@/lib/types";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login" ? { email, password } : { email, password, name };
      const res = await apiRequest<AuthResult>(path, { method: "POST", body });
      saveAuth(res);
      // Админа сразу в админ-панель, остальных — в личный кабинет.
      router.push(res.user.role === "admin" ? "/admin" : "/me");
      router.refresh();
    } catch (err) {
      setError(messageFor(err, mode));
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      {/* Переключатель вход/регистрация */}
      <div className="mb-6 flex rounded-full bg-cream p-1">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-primary text-white" : "text-ink/70"
            }`}
          >
            {m === "login" ? "Вход" : "Регистрация"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <label className="block">
            <span className="text-sm font-medium">Имя</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
              required
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1.5 ${inputClass}`}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1.5 ${inputClass}`}
            minLength={8}
            required
          />
          {mode === "register" && (
            <span className="mt-1 block text-xs text-muted">
              Минимум 8 символов. После регистрации подтвердите почту по ссылке
              из письма, чтобы оставлять отзывы.
            </span>
          )}
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting
            ? "Подождите…"
            : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
        </button>
      </form>

      {/* Сторонние способы входа (§6.6) */}
      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-black/10" />
        или
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <div className="space-y-3">
        <a
          href={`${API_URL}/auth/google`}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium ring-1 ring-black/10 hover:ring-primary/40"
        >
          Продолжить с Google
        </a>
        <button
          type="button"
          title="Требуется настройка Telegram Login Widget на бэкенде"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-muted ring-1 ring-black/10 opacity-60"
        >
          Telegram (скоро)
        </button>
      </div>
    </div>
  );
}

function messageFor(err: unknown, mode: Mode): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Неверный email или пароль.";
    if (err.status === 409) return "Этот email уже зарегистрирован.";
    if (err.status === 403) return "Аккаунт заблокирован.";
    if (err.status === 400) return "Проверьте корректность данных.";
  }
  return mode === "login"
    ? "Не удалось войти. Попробуйте ещё раз."
    : "Не удалось зарегистрироваться. Попробуйте ещё раз.";
}

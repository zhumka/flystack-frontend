"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, ApiError, apiRequest } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import type { AuthResult, Locale } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AuthForm() {
  const router = useRouter();
  const { locale } = useLocale();
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
      setError(messageFor(err, mode, locale));
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
            {m === "login" ? t(locale, "auth.login") : t(locale, "auth.register")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <label className="block">
            <span className="text-sm font-medium">{t(locale, "auth.name")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
              required
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium">{t(locale, "auth.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1.5 ${inputClass}`}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t(locale, "auth.password")}</span>
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
              {t(locale, "auth.passwordHint")}
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
            ? t(locale, "auth.wait")
            : mode === "login"
              ? t(locale, "auth.loginBtn")
              : t(locale, "auth.registerBtn")}
        </button>
      </form>

      {/* Сторонние способы входа (§6.6) */}
      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-black/10" />
        {t(locale, "auth.or")}
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <div className="space-y-3">
        <a
          href={`${API_URL}/auth/google`}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium ring-1 ring-black/10 hover:ring-primary/40"
        >
          {t(locale, "auth.google")}
        </a>
        <button
          type="button"
          title="Требуется настройка Telegram Login Widget на бэкенде"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-muted ring-1 ring-black/10 opacity-60"
        >
          {t(locale, "auth.telegramSoon")}
        </button>
      </div>
    </div>
  );
}

function messageFor(err: unknown, mode: Mode, locale: Locale): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return t(locale, "auth.err401");
    if (err.status === 409) return t(locale, "auth.err409");
    if (err.status === 403) return t(locale, "auth.err403");
    if (err.status === 400) return t(locale, "auth.err400");
  }
  return mode === "login" ? t(locale, "auth.errLogin") : t(locale, "auth.errRegister");
}

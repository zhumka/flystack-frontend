"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { saveAuth, saveTokens } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { User } from "@/lib/types";

// Бэкенд после Google OAuth редиректит сюда с токенами во фрагменте URL:
// /auth/callback#access_token=...&refresh_token=...
// (для этого APP_BASE_URL на бэкенде должен указывать на фронтенд.)
export default function AuthCallbackPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [error, setError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const params = new URLSearchParams(hash);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (!access || !refresh) {
      setError(true);
      return;
    }

    (async () => {
      try {
        saveTokens({ access_token: access, refresh_token: refresh });
        const user = await apiRequest<User>("/auth/me", { auth: true });
        saveAuth({ user, tokens: { access_token: access, refresh_token: refresh } });
        router.replace(user.role === "admin" ? "/admin" : "/me");
        router.refresh();
      } catch {
        setError(true);
      }
    })();
  }, [router]);

  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      {error ? (
        <>
          <h1 className="text-2xl font-bold">{t(locale, "cb.failTitle")}</h1>
          <p className="mt-2 text-muted">{t(locale, "cb.failText")}</p>
          <button
            onClick={() => router.replace("/login")}
            className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            {t(locale, "cb.toLogin")}
          </button>
        </>
      ) : (
        <p className="text-muted">{t(locale, "cb.finishing")}</p>
      )}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

type Status = "verifying" | "success" | "expired" | "invalid" | "missing";

// Бэкенд присылает письмо со ссылкой на фронтенд:
// /verify-email?token=...  Здесь дёргаем POST /auth/verify-email { token }.
export function VerifyEmail() {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "verifying" : "missing");
  // В dev StrictMode эффект вызывается дважды — токен одноразовый, поэтому шлём один раз.
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;

    (async () => {
      try {
        await apiRequest("/auth/verify-email", {
          method: "POST",
          body: { token },
        });
        // Если пользователь уже вошёл — отметим почту подтверждённой локально.
        updateStoredUser({ email_verified: true });
        setStatus("success");
      } catch (err) {
        // 410/404 — ссылка устарела или уже использована; остальное — недействительна.
        if (err instanceof ApiError && (err.status === 410 || err.status === 404)) {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      }
    })();
  }, [token]);

  return (
    <section className="mx-auto max-w-md px-4 py-24 text-center">
      {status === "verifying" && (
        <p className="text-muted">{t(locale, "ve.verifying")}</p>
      )}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold">{t(locale, "ve.successTitle")}</h1>
          <p className="mt-2 text-muted">{t(locale, "ve.successText")}</p>
          <Link
            href="/me"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            {t(locale, "ve.toCabinet")}
          </Link>
        </>
      )}

      {status === "expired" && (
        <>
          <h1 className="text-2xl font-bold">{t(locale, "ve.expiredTitle")}</h1>
          <p className="mt-2 text-muted">{t(locale, "ve.expiredText")}</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            {t(locale, "ve.toLogin")}
          </Link>
        </>
      )}

      {(status === "invalid" || status === "missing") && (
        <>
          <h1 className="text-2xl font-bold">{t(locale, "ve.failTitle")}</h1>
          <p className="mt-2 text-muted">
            {status === "missing"
              ? t(locale, "ve.missingText")
              : t(locale, "ve.invalidText")}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            {t(locale, "ve.toLogin")}
          </Link>
        </>
      )}
    </section>
  );
}

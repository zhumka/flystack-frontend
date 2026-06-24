"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";

type Status = "verifying" | "success" | "expired" | "invalid" | "missing";

// Бэкенд присылает письмо со ссылкой на фронтенд:
// /verify-email?token=...  Здесь дёргаем POST /auth/verify-email { token }.
export function VerifyEmail() {
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
        <p className="text-muted">Подтверждаем почту…</p>
      )}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold">Почта подтверждена</h1>
          <p className="mt-2 text-muted">
            Теперь вы можете оставлять отзывы и пользоваться всеми возможностями.
          </p>
          <Link
            href="/me"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            В личный кабинет
          </Link>
        </>
      )}

      {status === "expired" && (
        <>
          <h1 className="text-2xl font-bold">Ссылка недействительна</h1>
          <p className="mt-2 text-muted">
            Срок действия ссылки истёк или она уже была использована. Войдите и
            запросите подтверждение повторно.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            На страницу входа
          </Link>
        </>
      )}

      {(status === "invalid" || status === "missing") && (
        <>
          <h1 className="text-2xl font-bold">Не удалось подтвердить почту</h1>
          <p className="mt-2 text-muted">
            {status === "missing"
              ? "В ссылке нет токена подтверждения. Откройте ссылку из письма целиком."
              : "Ссылка повреждена. Попробуйте открыть её из письма ещё раз."}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            На страницу входа
          </Link>
        </>
      )}
    </section>
  );
}

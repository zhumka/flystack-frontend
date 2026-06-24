"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { clearAuth, getAccessToken, getStoredUser } from "@/lib/auth";
import type { MyReviews, ReviewItem, User } from "@/lib/types";

const statusMeta: Record<
  ReviewItem["status"],
  { label: string; cls: string }
> = {
  pending: { label: "На модерации", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Опубликован", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Отклонён", cls: "bg-red-100 text-red-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ResendState = "idle" | "sending" | "sent" | "error";

export default function CabinetPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<MyReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [resend, setResend] = useState<ResendState>("idle");

  async function resendVerification() {
    setResend("sending");
    try {
      await apiRequest("/auth/resend-verification", {
        method: "POST",
        auth: true,
      });
      setResend("sent");
    } catch {
      setResend("error");
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());

    (async () => {
      try {
        const mine = await apiRequest<MyReviews>("/me/reviews", { auth: true });
        setData(mine);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
          router.replace("/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center text-muted">
        Загружаем кабинет…
      </section>
    );
  }

  const counts = data?.counts ?? {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const reviews = data?.reviews ?? [];

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Личный кабинет</h1>
      {user && (
        <p className="mt-2 text-muted">
          {user.name} · {user.email}
        </p>
      )}

      {/* Напоминание о подтверждении почты (скрыто, если почта подтверждена) */}
      {user && !user.email_verified && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <span>
            Подтвердите почту по ссылке из письма — до этого оставлять отзывы
            нельзя.
          </span>
          {resend === "sent" ? (
            <span className="font-medium text-amber-900">
              Письмо отправлено — проверьте почту.
            </span>
          ) : (
            <button
              onClick={resendVerification}
              disabled={resend === "sending"}
              className="shrink-0 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
            >
              {resend === "sending"
                ? "Отправляем…"
                : resend === "error"
                  ? "Не вышло — повторить"
                  : "Отправить письмо повторно"}
            </button>
          )}
        </div>
      )}

      {/* Счётчики */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { label: "Всего", value: counts.total },
          { label: "На модерации", value: counts.pending },
          { label: "Опубликовано", value: counts.approved },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-sm ring-1 ring-black/5"
          >
            <div className="text-3xl font-bold text-primary">{c.value}</div>
            <div className="mt-1 text-sm text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Список отзывов */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Мои отзывы</h2>
        <Link
          href="/reviews/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          + Оставить отзыв
        </Link>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-primary">
                    {r.work.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    {formatDate(r.created_at)} · оценка {r.rating}/5
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusMeta[r.status].cls}`}
                >
                  {statusMeta[r.status].label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink/90">
                {r.text}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[var(--radius-card)] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-muted">
            У вас пока нет отзывов. Расскажите о работе, которая вам понравилась.
          </p>
          <Link
            href="/reviews/new"
            className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            Оставить первый отзыв
          </Link>
        </div>
      )}
    </section>
  );
}

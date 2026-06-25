"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, localePath } from "@/lib/api";
import { clearAuth, getAccessToken, getStoredUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { MyReviews, ReviewItem, User } from "@/lib/types";

const statusCls: Record<ReviewItem["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

type ResendState = "idle" | "sending" | "sent" | "error";

export default function CabinetPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<MyReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [resend, setResend] = useState<ResendState>("idle");

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

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
        const mine = await apiRequest<MyReviews>(
          localePath("/me/reviews", locale),
          { auth: true },
        );
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
  }, [router, locale]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center text-muted">
        {t(locale, "me.loading")}
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
      <h1 className="text-3xl font-bold sm:text-4xl">{t(locale, "me.title")}</h1>
      {user && (
        <p className="mt-2 text-muted">
          {user.name} · {user.email}
        </p>
      )}

      {/* Напоминание о подтверждении почты (скрыто, если почта подтверждена) */}
      {user && !user.email_verified && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <span>{t(locale, "me.verifyBanner")}</span>
          {resend === "sent" ? (
            <span className="font-medium text-amber-900">
              {t(locale, "me.verifySent")}
            </span>
          ) : (
            <button
              onClick={resendVerification}
              disabled={resend === "sending"}
              className="shrink-0 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
            >
              {resend === "sending"
                ? t(locale, "me.resending")
                : resend === "error"
                  ? t(locale, "me.resendError")
                  : t(locale, "me.resend")}
            </button>
          )}
        </div>
      )}

      {/* Счётчики */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[
          { label: t(locale, "me.total"), value: counts.total },
          { label: t(locale, "me.pending"), value: counts.pending },
          { label: t(locale, "me.approved"), value: counts.approved },
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
        <h2 className="text-2xl font-bold">{t(locale, "me.myReviews")}</h2>
        <Link
          href="/reviews/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {t(locale, "me.leaveReview")}
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
                    {formatDate(r.created_at)} · {t(locale, "me.ratingShort")} {r.rating}/5
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusCls[r.status]}`}
                >
                  {t(locale, `status.${r.status}`)}
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
          <p className="text-muted">{t(locale, "me.empty")}</p>
          <Link
            href="/reviews/new"
            className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
          >
            {t(locale, "me.leaveFirst")}
          </Link>
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { t, localized } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { AdminWork, ReviewItem } from "@/lib/types";

export default function AdminDashboard() {
  const { locale } = useLocale();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [works, setWorks] = useState<AdminWork[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [r, w] = await Promise.all([
      apiRequest<ReviewItem[]>("/admin/reviews", { auth: true }),
      apiRequest<AdminWork[]>("/admin/works", { auth: true }),
    ]);
    setReviews(r);
    setWorks(w);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function moderate(id: string, status: "approved" | "rejected") {
    await apiRequest(`/admin/reviews/${id}/moderate`, {
      method: "PATCH",
      auth: true,
      body: { status },
    });
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  if (loading) {
    return <p className="text-muted">{t(locale, "admin.loading")}</p>;
  }

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");

  const cards = [
    { label: t(locale, "admin.card.pending"), value: pending.length },
    { label: t(locale, "admin.card.published"), value: approved.length },
    { label: t(locale, "admin.card.works"), value: works.length },
    { label: t(locale, "admin.card.totalReviews"), value: reviews.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">{t(locale, "admin.overview")}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5"
          >
            <div className="text-3xl font-bold text-primary">{c.value}</div>
            <div className="mt-1 text-sm text-muted">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Ждут модерации */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t(locale, "admin.pendingTitle")}</h2>
        <Link href="/admin/reviews" className="text-sm text-primary hover:underline">
          {t(locale, "admin.allReviews")}
        </Link>
      </div>
      {pending.length > 0 ? (
        <div className="mt-4 space-y-3">
          {pending.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--radius-card)] bg-white p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-primary">
                  {r.work.title} · {r.rating}/5
                </div>
                <div className="text-sm text-ink/80">{r.author_name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{r.text}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moderate(r.id, "approved")}
                  className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                >
                  {t(locale, "admin.publish")}
                </button>
                <button
                  onClick={() => moderate(r.id, "rejected")}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                >
                  {t(locale, "admin.reject")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-muted">{t(locale, "admin.noPending")}</p>
      )}

      {/* Последние работы */}
      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t(locale, "admin.recentWorks")}</h2>
        <Link href="/admin/works" className="text-sm text-primary hover:underline">
          {t(locale, "admin.allWorks")}
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {works.slice(0, 5).map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/5"
          >
            <span className="font-medium">{localized(w.title, locale)}</span>
            <span className="text-xs text-muted">
              {w.category} ·{" "}
              {w.published ? t(locale, "admin.published") : t(locale, "admin.draft")}
            </span>
          </div>
        ))}
        {works.length === 0 && <p className="text-muted">{t(locale, "admin.noWorks")}</p>}
      </div>
    </div>
  );
}

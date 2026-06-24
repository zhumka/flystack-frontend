"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { ReviewItem } from "@/lib/types";

type Tab = "pending" | "approved" | "rejected";

const tabs: { key: Tab; label: string }[] = [
  { key: "pending", label: "Ожидают" },
  { key: "approved", label: "Опубликованные" },
  { key: "rejected", label: "Отклонённые" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<ReviewItem[]>("/admin/reviews", { auth: true })
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function moderate(id: string, status: Tab) {
    await apiRequest(`/admin/reviews/${id}/moderate`, {
      method: "PATCH",
      auth: true,
      body: { status },
    });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const counts: Record<Tab, number> = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };
  const list = reviews.filter((r) => r.status === tab);

  return (
    <div>
      <h1 className="text-2xl font-bold">Модерация отзывов</h1>

      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-primary text-white"
                : "bg-white text-ink/70 ring-1 ring-black/10"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-muted">Здесь пусто.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((r) => (
            <article
              key={r.id}
              className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-primary">
                    {r.work.title} · {r.rating}/5
                  </div>
                  <div className="text-sm text-ink/80">
                    {r.author_name}
                    {r.role_text && ` · ${r.role_text}`}
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(r.created_at).toLocaleString("ru-RU")}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tab !== "approved" && (
                    <button
                      onClick={() => moderate(r.id, "approved")}
                      className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      {tab === "rejected" ? "Всё же опубликовать" : "Опубликовать"}
                    </button>
                  )}
                  {tab !== "rejected" && (
                    <button
                      onClick={() => moderate(r.id, "rejected")}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                    >
                      Отклонить
                    </button>
                  )}
                  {tab === "approved" && (
                    <button
                      onClick={() => moderate(r.id, "pending")}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-50"
                    >
                      Снять с публикации
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink/90">{r.text}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

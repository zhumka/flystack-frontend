"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { t, localized } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { AdminWork } from "@/lib/types";
import { WorkForm } from "@/components/admin/WorkForm";

export default function AdminWorksPage() {
  const { locale } = useLocale();
  const [works, setWorks] = useState<AdminWork[]>([]);
  const [loading, setLoading] = useState(true);
  // null — форма скрыта; { } — создание; { work } — редактирование
  const [editing, setEditing] = useState<{ work: AdminWork | null } | null>(null);

  function load() {
    setLoading(true);
    apiRequest<AdminWork[]>("/admin/works", { auth: true })
      .then(setWorks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm(t(locale, "admin.deleteConfirm"))) return;
    await apiRequest(`/admin/works/${id}`, { method: "DELETE", auth: true });
    setWorks((prev) => prev.filter((w) => w.id !== id));
  }

  if (editing) {
    return (
      <WorkForm
        initial={editing.work}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(locale, "admin.worksTitle")}</h1>
        <button
          onClick={() => setEditing({ work: null })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {t(locale, "admin.addWork")}
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-muted">{t(locale, "admin.loading")}</p>
      ) : works.length === 0 ? (
        <p className="mt-8 text-muted">{t(locale, "admin.noWorksYet")}</p>
      ) : (
        <div className="mt-6 space-y-2">
          {works.map((w) => (
            <div
              key={w.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5"
            >
              <div>
                <div className="font-medium">{localized(w.title, locale)}</div>
                <div className="text-xs text-muted">
                  /{w.slug} · {w.category} ·{" "}
                  {w.published ? t(locale, "admin.published") : t(locale, "admin.draft")}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing({ work: w })}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-black/10 hover:ring-primary/40"
                >
                  {t(locale, "admin.edit")}
                </button>
                <button
                  onClick={() => remove(w.id)}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                >
                  {t(locale, "admin.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

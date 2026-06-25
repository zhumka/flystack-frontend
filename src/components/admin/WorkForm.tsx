"use client";

import { useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { AdminWork, LocalizedText } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const csv = (arr: string[]) => arr.join(", ");
const parseCsv = (s: string) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

// Локализованное значение в форме всегда держим как {ru,en} с дефолтными строками.
const loc = (v: LocalizedText | undefined): { ru: string; en: string } => ({
  ru: v?.ru ?? "",
  en: v?.en ?? "",
});

export function WorkForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: AdminWork | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { locale } = useLocale();
  const [f, setF] = useState({
    slug: initial?.slug ?? "",
    title: loc(initial?.title),
    subtitle: loc(initial?.subtitle),
    category: initial?.category ?? "",
    year: initial?.year != null ? String(initial.year) : "",
    cover_url: initial?.cover_url ?? "",
    tagline: loc(initial?.tagline),
    challenge: loc(initial?.challenge),
    solution: loc(initial?.solution),
    result: loc(initial?.result),
    services: csv(initial?.services ?? []),
    gallery: csv(initial?.gallery ?? []),
    metrics: initial?.metrics ? JSON.stringify(initial.metrics) : "[]",
    sort_order: String(initial?.sort_order ?? 0),
    published: initial?.published ?? false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f, v: string | boolean) =>
    setF((prev) => ({ ...prev, [k]: v }));

  // Обновление одной локали локализованного поля.
  type LocKey = "title" | "subtitle" | "tagline" | "challenge" | "solution" | "result";
  const setLoc = (k: LocKey, lang: "ru" | "en", v: string) =>
    setF((prev) => ({ ...prev, [k]: { ...prev[k], [lang]: v } }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!f.title.ru.trim() && !f.title.en.trim()) {
      setError(t(locale, "wf.errTitle"));
      return;
    }

    let metrics: unknown;
    try {
      metrics = f.metrics.trim() ? JSON.parse(f.metrics) : [];
    } catch {
      setError(t(locale, "wf.errMetrics"));
      return;
    }

    const body = {
      slug: f.slug,
      title: f.title,
      subtitle: f.subtitle,
      category: f.category,
      year: f.year ? Number(f.year) : null,
      cover_url: f.cover_url || null,
      tagline: f.tagline,
      challenge: f.challenge,
      solution: f.solution,
      result: f.result,
      services: parseCsv(f.services),
      gallery: parseCsv(f.gallery),
      metrics,
      sort_order: Number(f.sort_order) || 0,
      published: f.published,
    };

    setSaving(true);
    try {
      if (initial) {
        await apiRequest(`/admin/works/${initial.id}`, {
          method: "PATCH",
          auth: true,
          body,
        });
      } else {
        await apiRequest("/admin/works", { method: "POST", auth: true, body });
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409)
        setError(t(locale, "wf.errSlug"));
      else setError(t(locale, "wf.errSave"));
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <h2 className="text-lg font-bold">
        {initial ? t(locale, "wf.editTitle") : t(locale, "wf.newTitle")}
      </h2>

      {/* Нелокализованные поля */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Slug *">
          <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} required />
        </Field>
        <Field label={t(locale, "wf.category")}>
          <input value={f.category} onChange={(e) => set("category", e.target.value)} className={inputClass} required />
        </Field>
        <Field label={t(locale, "wf.year")}>
          <input type="number" value={f.year} onChange={(e) => set("year", e.target.value)} className={inputClass} />
        </Field>
        <Field label={t(locale, "wf.sort")}>
          <input type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={inputClass} />
        </Field>
        <Field label={t(locale, "wf.cover")}>
          <input value={f.cover_url} onChange={(e) => set("cover_url", e.target.value)} className={inputClass} />
        </Field>
      </div>

      {/* Локализованные строки — пары RU / EN */}
      <LocField label={t(locale, "wf.name")} value={f.title} onRu={(v) => setLoc("title", "ru", v)} onEn={(v) => setLoc("title", "en", v)} />
      <LocField label={t(locale, "wf.subtitle")} value={f.subtitle} onRu={(v) => setLoc("subtitle", "ru", v)} onEn={(v) => setLoc("subtitle", "en", v)} />
      <LocField label={t(locale, "wf.tagline")} value={f.tagline} onRu={(v) => setLoc("tagline", "ru", v)} onEn={(v) => setLoc("tagline", "en", v)} />

      {/* Локализованные блоки — текстовые области RU / EN */}
      <LocField label={t(locale, "wf.challenge")} textarea value={f.challenge} onRu={(v) => setLoc("challenge", "ru", v)} onEn={(v) => setLoc("challenge", "en", v)} />
      <LocField label={t(locale, "wf.solution")} textarea value={f.solution} onRu={(v) => setLoc("solution", "ru", v)} onEn={(v) => setLoc("solution", "en", v)} />
      <LocField label={t(locale, "wf.result")} textarea value={f.result} onRu={(v) => setLoc("result", "ru", v)} onEn={(v) => setLoc("result", "en", v)} />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label={t(locale, "wf.services")}>
          <input value={f.services} onChange={(e) => set("services", e.target.value)} className={inputClass} />
        </Field>
        <Field label={t(locale, "wf.gallery")}>
          <input value={f.gallery} onChange={(e) => set("gallery", e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label={t(locale, "wf.metrics")}>
        <textarea value={f.metrics} onChange={(e) => set("metrics", e.target.value)} rows={2} className={`mt-1 ${inputClass} resize-none font-mono`} />
      </Field>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
        {t(locale, "wf.publishedField")}
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? t(locale, "wf.saving") : t(locale, "wf.save")}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full bg-white px-5 py-2 text-sm font-medium ring-1 ring-black/10 hover:ring-primary/40">
          {t(locale, "wf.cancel")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// LocField рисует пару полей RU / EN для одного локализованного значения.
function LocField({
  label,
  value,
  onRu,
  onEn,
  textarea,
}: {
  label: string;
  value: { ru: string; en: string };
  onRu: (v: string) => void;
  onEn: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="mt-3">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-primary/70">RU</span>
          {textarea ? (
            <textarea value={value.ru} onChange={(e) => onRu(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          ) : (
            <input value={value.ru} onChange={(e) => onRu(e.target.value)} className={inputClass} />
          )}
        </div>
        <div>
          <span className="mb-1 block text-[10px] font-semibold uppercase text-primary/70">EN</span>
          {textarea ? (
            <textarea value={value.en} onChange={(e) => onEn(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          ) : (
            <input value={value.en} onChange={(e) => onEn(e.target.value)} className={inputClass} />
          )}
        </div>
      </div>
    </div>
  );
}

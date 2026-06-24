"use client";

import { useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import type { Work } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const csv = (arr: string[]) => arr.join(", ");
const parseCsv = (s: string) =>
  s.split(",").map((x) => x.trim()).filter(Boolean);

export function WorkForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Work | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    category: initial?.category ?? "",
    year: initial?.year != null ? String(initial.year) : "",
    cover_url: initial?.cover_url ?? "",
    tagline: initial?.tagline ?? "",
    challenge: initial?.challenge ?? "",
    solution: initial?.solution ?? "",
    result: initial?.result ?? "",
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let metrics: unknown;
    try {
      metrics = f.metrics.trim() ? JSON.parse(f.metrics) : [];
    } catch {
      setError("Метрики должны быть валидным JSON.");
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
        setError("Работа с таким slug уже существует.");
      else setError("Не удалось сохранить работу.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <h2 className="text-lg font-bold">
        {initial ? "Редактирование работы" : "Новая работа"}
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Slug *">
          <input value={f.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Название *">
          <input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Подзаголовок">
          <input value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Категория *">
          <input value={f.category} onChange={(e) => set("category", e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Год">
          <input type="number" value={f.year} onChange={(e) => set("year", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Порядок (sort)">
          <input type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={inputClass} />
        </Field>
        <Field label="URL обложки">
          <input value={f.cover_url} onChange={(e) => set("cover_url", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Тэглайн">
          <input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputClass} />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Field label="Задача">
          <textarea value={f.challenge} onChange={(e) => set("challenge", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </Field>
        <Field label="Решение">
          <textarea value={f.solution} onChange={(e) => set("solution", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </Field>
        <Field label="Результат">
          <textarea value={f.result} onChange={(e) => set("result", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Услуги (через запятую)">
          <input value={f.services} onChange={(e) => set("services", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Галерея — URL через запятую">
          <input value={f.gallery} onChange={(e) => set("gallery", e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Метрики (JSON-массив)">
        <textarea value={f.metrics} onChange={(e) => set("metrics", e.target.value)} rows={2} className={`mt-1 ${inputClass} resize-none font-mono`} />
      </Field>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} />
        Опубликовано
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? "Сохраняем…" : "Сохранить"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full bg-white px-5 py-2 text-sm font-medium ring-1 ring-black/10 hover:ring-primary/40">
          Отмена
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

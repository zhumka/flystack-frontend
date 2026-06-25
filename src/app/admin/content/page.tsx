"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { Locale, SiteContent } from "@/lib/types";

// Локаль РЕДАКТИРУЕМОГО контента (не языка интерфейса).
type ContentLocale = "ru" | "en";

// Поле значения контента: имя (k) → текст (v).
type Field = { k: string; v: string };

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

// Плоский объект из строк/чисел/булевых — такой редактируем полями, а не JSON.
function isFlatObject(v: unknown): v is Record<string, string | number | boolean> {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.values(v as Record<string, unknown>).every(
      (x) => typeof x === "string" || typeof x === "number" || typeof x === "boolean",
    )
  );
}

function valueToFields(v: unknown): Field[] {
  if (isFlatObject(v)) {
    return Object.entries(v).map(([k, val]) => ({ k, v: String(val) }));
  }
  return [];
}

// Собирает объект {имя: текст} из полей (пустые имена пропускаем).
function fieldsToObject(fields: Field[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of fields) {
    const key = f.k.trim();
    if (key) o[key] = f.v;
  }
  return o;
}

export default function AdminContentPage() {
  const { locale: ui } = useLocale();
  const [locale, setLocale] = useState<ContentLocale>("ru");
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Поля для новой записи.
  const [newKey, setNewKey] = useState("");
  const [newFields, setNewFields] = useState<Field[]>([{ k: "", v: "" }]);
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiRequest<SiteContent[]>(`/content?locale=${locale}`)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [locale]);

  useEffect(() => {
    load();
  }, [load]);

  // saveValue принимает уже готовое значение (объект или результат JSON.parse).
  async function saveValue(key: string, value: unknown) {
    setMsg("");
    await apiRequest(`/admin/content/${key}`, {
      method: "PUT",
      auth: true,
      body: { locale, value },
    });
    setMsg(`${t(ui, "admin.contentSaved")}: ${key} (${locale}).`);
    load();
  }

  function saveNew() {
    if (!newKey.trim()) return;
    saveValue(newKey.trim(), fieldsToObject(newFields));
    setNewKey("");
    setNewFields([{ k: "", v: "" }]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t(ui, "admin.contentTitle")}</h1>
        <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-black/10">
          {(["ru", "en"] as ContentLocale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded-full px-4 py-1 text-sm font-medium uppercase ${
                locale === l ? "bg-primary text-white" : "text-ink/70"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {msg && <p className="mt-4 text-sm text-primary">{msg}</p>}

      {/* Новая запись */}
      <div className="mt-6 rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="text-sm font-semibold">{t(ui, "admin.contentAdd")}</h2>
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={t(ui, "admin.contentKeyPlaceholder")}
          className={`mt-3 sm:max-w-xs ${inputClass}`}
        />
        <div className="mt-3">
          <FieldsEditor fields={newFields} onChange={setNewFields} locale={ui} />
        </div>
        <button
          onClick={saveNew}
          className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {t(ui, "admin.save")}
        </button>
      </div>

      {/* Существующие записи */}
      {loading ? (
        <p className="mt-8 text-muted">{t(ui, "admin.loading")}</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-muted">
          {t(ui, "admin.contentNone")} ({locale})
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <ContentRow key={item.id} item={item} onSave={saveValue} locale={ui} />
          ))}
        </div>
      )}
    </div>
  );
}

// Редактор полей: список «имя → текст» с добавлением/удалением.
function FieldsEditor({
  fields,
  onChange,
  locale,
}: {
  fields: Field[];
  onChange: (f: Field[]) => void;
  locale: Locale;
}) {
  const setAt = (i: number, patch: Partial<Field>) =>
    onChange(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const removeAt = (i: number) => onChange(fields.filter((_, idx) => idx !== i));
  const add = () => onChange([...fields, { k: "", v: "" }]);

  return (
    <div className="space-y-2">
      {fields.length === 0 && (
        <p className="text-xs text-muted">{t(locale, "admin.contentNoFields")}</p>
      )}
      {fields.map((f, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[200px_1fr_auto] sm:items-start">
          <input
            value={f.k}
            onChange={(e) => setAt(i, { k: e.target.value })}
            placeholder={t(locale, "admin.contentFieldName")}
            className={`${inputClass} font-medium`}
          />
          <textarea
            value={f.v}
            onChange={(e) => setAt(i, { v: e.target.value })}
            placeholder={t(locale, "admin.contentTextPlaceholder")}
            rows={2}
            className={`${inputClass} resize-y`}
          />
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label={t(locale, "admin.contentRemoveField")}
            title={t(locale, "admin.contentRemoveField")}
            className="h-9 w-9 self-start rounded-full bg-white text-lg leading-none text-red-600 ring-1 ring-red-200 hover:bg-red-50"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/30 hover:bg-primary/5"
      >
        {t(locale, "admin.contentAddField")}
      </button>
    </div>
  );
}

function ContentRow({
  item,
  onSave,
  locale,
}: {
  item: SiteContent;
  onSave: (key: string, value: unknown) => void;
  locale: Locale;
}) {
  // Плоский объект редактируем полями; сложное значение — как JSON (запасной путь).
  const flat = isFlatObject(item.value);
  const [fields, setFields] = useState<Field[]>(() => valueToFields(item.value));
  const [raw, setRaw] = useState(() => JSON.stringify(item.value, null, 2));
  const [error, setError] = useState("");

  function handleSave() {
    setError("");
    if (flat) {
      onSave(item.key, fieldsToObject(fields));
      return;
    }
    try {
      onSave(item.key, JSON.parse(raw));
    } catch {
      setError(t(locale, "admin.contentBadJson"));
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <code className="text-sm font-semibold text-primary">{item.key}</code>
        <button
          onClick={handleSave}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium ring-1 ring-black/10 hover:ring-primary/40"
        >
          {t(locale, "admin.save")}
        </button>
      </div>

      <div className="mt-3">
        {flat ? (
          <FieldsEditor fields={fields} onChange={setFields} locale={locale} />
        ) : (
          <>
            <p className="mb-2 text-xs text-muted">{t(locale, "admin.contentRawHint")}</p>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

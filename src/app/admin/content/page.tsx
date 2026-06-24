"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { SiteContent } from "@/lib/types";

type Locale = "ru" | "en";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function AdminContentPage() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Поля для новой записи.
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("{}");
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

  async function save(key: string, value: string) {
    setMsg("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setMsg(`Ключ «${key}»: значение должно быть валидным JSON.`);
      return;
    }
    await apiRequest(`/admin/content/${key}`, {
      method: "PUT",
      auth: true,
      body: { locale, value: parsed },
    });
    setMsg(`Сохранено: ${key} (${locale}).`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Контент сайта</h1>
        <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-black/10">
          {(["ru", "en"] as Locale[]).map((l) => (
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
        <h2 className="text-sm font-semibold">Добавить / перезаписать ключ</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-start">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="ключ (напр. hero)"
            className={inputClass}
          />
          <textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            rows={2}
            className={`${inputClass} resize-none font-mono`}
          />
          <button
            onClick={() => newKey && save(newKey, newValue)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Существующие записи */}
      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-muted">Для локали «{locale}» контента нет.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <ContentRow key={item.id} item={item} onSave={save} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentRow({
  item,
  onSave,
}: {
  item: SiteContent;
  onSave: (key: string, value: string) => void;
}) {
  const [value, setValue] = useState(JSON.stringify(item.value, null, 2));
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <code className="text-sm font-semibold text-primary">{item.key}</code>
        <button
          onClick={() => onSave(item.key, value)}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-medium ring-1 ring-black/10 hover:ring-primary/40"
        >
          Сохранить
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        className="mt-3 w-full rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

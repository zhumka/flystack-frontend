"use client";

import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

// Переключатель языка. Меняет локаль через контекст: клиентская статика
// переводится мгновенно, серверные компоненты тихо обновляются
// (router.refresh) — без полной перезагрузки и мигания текста.
export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-full bg-white p-0.5 text-xs font-semibold ring-1 ring-black/10">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={l === locale}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            l === locale
              ? "bg-primary text-white"
              : "text-ink/60 hover:text-primary"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

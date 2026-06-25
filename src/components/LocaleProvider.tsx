"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/types";
import { DEFAULT_LOCALE, setClientLocale } from "@/lib/i18n";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<LocaleCtx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

// LocaleProvider держит текущую локаль в клиентском состоянии (для мгновенного
// перевода статики без перезагрузки) и синхронизирует серверные компоненты
// через router.refresh() — переключение получается плавным, без мигания.
export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = useCallback(
    (l: Locale) => {
      if (l === locale) return;
      setClientLocale(l); // cookie + localStorage — чтобы сервер отдал тот же язык
      setLocaleState(l); // мгновенно переводим клиентскую статику
      router.refresh(); // тихо обновляем серверные компоненты (данные + их статика)
    },
    [locale, router],
  );

  return <Ctx.Provider value={{ locale, setLocale }}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}

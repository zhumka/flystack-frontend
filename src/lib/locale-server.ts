// Серверное чтение текущей локали из cookie. Только для серверных компонентов
// (импортирует next/headers). Клиентское чтение — getClientLocale в lib/i18n.ts.
import "server-only";

import { cookies } from "next/headers";
import type { Locale } from "./types";
import { LOCALE_COOKIE, normalizeLocale } from "./i18n";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

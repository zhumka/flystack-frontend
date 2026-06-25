import type { Metadata } from "next";
import { apiGetSafe, localePath } from "@/lib/api";
import type { Work } from "@/lib/types";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale-server";
import { WorksGrid } from "@/components/WorksGrid";

// Данные тянутся из API в рантайме, а не на сборке (API недоступен при build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Работы — Flystack",
  description: "Портфолио студии Flystack: сайты, магазины, лендинги, боты.",
};

export default async function WorksPage() {
  const locale = await getServerLocale();
  const works = await apiGetSafe<Work[]>(localePath("/works", locale), []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="inline-block frost">
        <h1 className="text-3xl font-bold sm:text-4xl">{t(locale, "works.title")}</h1>
        <p className="mt-3 max-w-xl text-muted">{t(locale, "works.subtitle")}</p>
      </div>

      {works.length > 0 ? (
        <WorksGrid works={works} locale={locale} />
      ) : (
        <p className="mt-10 text-muted">{t(locale, "works.empty")}</p>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { apiGetSafe, localePath } from "@/lib/api";
import type { ReviewsFeed } from "@/lib/types";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale-server";
import { ReviewsBoard } from "@/components/ReviewsBoard";

// Данные тянутся из API в рантайме, а не на сборке (API недоступен при build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Отзывы — Flystack",
  description: "Реальные модерируемые отзывы клиентов студии Flystack.",
};

export default async function ReviewsPage() {
  const locale = await getServerLocale();
  const feed = await apiGetSafe<ReviewsFeed>(localePath("/reviews", locale), {
    reviews: [],
    summary: { average: 0, count: 0 },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="inline-block frost">
          <h1 className="text-3xl font-bold sm:text-4xl">{t(locale, "reviews.title")}</h1>
          <p className="mt-3 max-w-xl text-muted">{t(locale, "reviews.subtitle")}</p>
        </div>
        <Link
          href="/reviews/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {t(locale, "reviews.leave")}
        </Link>
      </div>

      {/* Сводка */}
      <div className="mt-8 flex flex-wrap gap-4">
        <div className="rounded-[var(--radius-card)] bg-white px-6 py-4 shadow-sm ring-1 ring-black/5">
          <div className="text-3xl font-bold text-primary">
            {feed.summary.average.toFixed(1)}
          </div>
          <div className="text-sm text-muted">{t(locale, "reviews.avg")}</div>
        </div>
        <div className="rounded-[var(--radius-card)] bg-white px-6 py-4 shadow-sm ring-1 ring-black/5">
          <div className="text-3xl font-bold text-primary">
            {feed.summary.count}
          </div>
          <div className="text-sm text-muted">{t(locale, "reviews.count")}</div>
        </div>
        <div className="flex items-center rounded-[var(--radius-card)] bg-accent/15 px-6 py-4 text-sm text-ink/80 ring-1 ring-accent/30">
          {t(locale, "reviews.note")}
        </div>
      </div>

      <ReviewsBoard reviews={feed.reviews} locale={locale} />
    </section>
  );
}

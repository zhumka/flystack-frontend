import Link from "next/link";
import { apiGetSafe, localePath } from "@/lib/api";
import type { ReviewsFeed, Work } from "@/lib/types";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale-server";
import { WorkCard } from "@/components/WorkCard";
import { ReviewCard } from "@/components/ReviewCard";

// Данные тянутся из API в рантайме, а не на сборке (API недоступен при build).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getServerLocale();
  const works = await apiGetSafe<Work[]>(localePath("/works", locale), []);
  const feed = await apiGetSafe<ReviewsFeed>(localePath("/reviews", locale), {
    reviews: [],
    summary: { average: 0, count: 0 },
  });

  const services = [
    { title: t(locale, "svc.landing.title"), desc: t(locale, "svc.landing.desc") },
    { title: t(locale, "svc.shop.title"), desc: t(locale, "svc.shop.desc") },
    { title: t(locale, "svc.promo.title"), desc: t(locale, "svc.promo.desc") },
    { title: t(locale, "svc.corp.title"), desc: t(locale, "svc.corp.desc") },
    { title: t(locale, "svc.bot.title"), desc: t(locale, "svc.bot.desc") },
    { title: t(locale, "svc.auto.title"), desc: t(locale, "svc.auto.desc") },
  ];

  const stats = [
    { value: "50+", label: t(locale, "stats.projects") },
    { value: "4.9", label: t(locale, "stats.rating") },
    { value: t(locale, "stats.termValue"), label: t(locale, "stats.term") },
  ];

  const recentWorks = works.slice(0, 3);
  const recentReviews = feed.reviews.slice(0, 3);

  return (
    <>
      {/* Герой */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
        <div className="frost max-w-3xl p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {t(locale, "home.kicker")}
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
            {t(locale, "home.heroTitle")}{" "}
            <span className="text-primary">
              {t(locale, "home.heroTitleAccent")}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            {t(locale, "home.heroSubtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t(locale, "nav.discuss")}
            </Link>
            <Link
              href="/works"
              className="rounded-full bg-white px-6 py-3 font-semibold text-ink ring-1 ring-black/10 transition-colors hover:ring-primary/40"
            >
              {t(locale, "common.viewWork")}
            </Link>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-bold text-primary">{s.value}</dt>
                <dd className="mt-1 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Услуги */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="inline-block frost text-2xl font-bold sm:text-3xl">
          {t(locale, "home.servicesTitle")}
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Недавние работы */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="inline-block frost text-2xl font-bold sm:text-3xl">
            {t(locale, "home.recentProjects")}
          </h2>
          <Link href="/works" className="text-sm font-medium text-primary hover:underline">
            {t(locale, "home.allWorks")}
          </Link>
        </div>
        {recentWorks.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentWorks.map((w) => (
              <WorkCard key={w.id} work={w} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted">{t(locale, "home.noProjects")}</p>
        )}
      </section>

      {/* Отзывы */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="inline-block frost text-2xl font-bold sm:text-3xl">
            {t(locale, "home.clientsSay")}
          </h2>
          <Link href="/reviews" className="text-sm font-medium text-primary hover:underline">
            {t(locale, "home.allReviews")}
          </Link>
        </div>
        {recentReviews.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted">{t(locale, "home.noReviews")}</p>
        )}
      </section>

      {/* Финальный CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[var(--radius-card)] bg-ink px-8 py-12 text-center text-white sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t(locale, "home.finalTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            {t(locale, "home.finalSubtitle")}
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-block rounded-full bg-accent px-7 py-3 font-semibold text-ink transition-transform hover:scale-105"
          >
            {t(locale, "nav.discuss")}
          </Link>
        </div>
      </section>
    </>
  );
}

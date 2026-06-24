import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import type { ReviewsFeed, Work } from "@/lib/types";
import { WorkCard } from "@/components/WorkCard";
import { ReviewCard } from "@/components/ReviewCard";

const services = [
  { title: "Сайт-визитка", desc: "Презентация бизнеса, которая вызывает доверие." },
  { title: "Интернет-магазин", desc: "Каталог, корзина, оплата и удобная админка." },
  { title: "Лендинг", desc: "Конверсионная страница под продукт или акцию." },
  { title: "Корпоративный сайт", desc: "Многостраничный сайт компании с контентом." },
  { title: "Telegram-бот и Mini App", desc: "Боты и мини-приложения внутри Telegram." },
  { title: "Автоматизация", desc: "Связываем сервисы и убираем рутину." },
];

const stats = [
  { value: "50+", label: "проектов" },
  { value: "4.9", label: "средняя оценка" },
  { value: "от 2 нед.", label: "срок запуска" },
];

export default async function HomePage() {
  const works = await apiGetSafe<Work[]>("/works", []);
  const feed = await apiGetSafe<ReviewsFeed>("/reviews", {
    reviews: [],
    summary: { average: 0, count: 0 },
  });

  const recentWorks = works.slice(0, 3);
  const recentReviews = feed.reviews.slice(0, 3);

  return (
    <>
      {/* Герой */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
        <div className="frost max-w-3xl p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Студия цифровых продуктов
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
            Создаём сайты и сервисы, которые{" "}
            <span className="text-primary">работают на результат</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Сайты-визитки, магазины, лендинги, Telegram-боты и автоматизация —
            под ключ, с понятными сроками и реальными отзывами клиентов.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Обсудить проект
            </Link>
            <Link
              href="/works"
              className="rounded-full bg-white px-6 py-3 font-semibold text-ink ring-1 ring-black/10 transition-colors hover:ring-primary/40"
            >
              Посмотреть работы
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
          Что мы делаем
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
            Недавние проекты
          </h2>
          <Link href="/works" className="text-sm font-medium text-primary hover:underline">
            Все работы →
          </Link>
        </div>
        {recentWorks.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentWorks.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted">Скоро здесь появятся проекты.</p>
        )}
      </section>

      {/* Отзывы */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="inline-block frost text-2xl font-bold sm:text-3xl">
            Что говорят клиенты
          </h2>
          <Link href="/reviews" className="text-sm font-medium text-primary hover:underline">
            Все отзывы →
          </Link>
        </div>
        {recentReviews.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted">
            Пока нет опубликованных отзывов — станьте первым.
          </p>
        )}
      </section>

      {/* Финальный CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-[var(--radius-card)] bg-ink px-8 py-12 text-center text-white sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Есть идея проекта?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            Расскажите задачу — предложим решение и сроки. Без обязательств.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-block rounded-full bg-accent px-7 py-3 font-semibold text-ink transition-transform hover:scale-105"
          >
            Обсудить проект
          </Link>
        </div>
      </section>
    </>
  );
}

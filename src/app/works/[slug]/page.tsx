import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGetSafe } from "@/lib/api";
import type { ReviewsFeed, Work } from "@/lib/types";
import { ReviewCard } from "@/components/ReviewCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Данные тянутся из API в рантайме, а не на сборке (API недоступен при build).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await apiGetSafe<Work | null>(`/works/${slug}`, null);
  if (!work) return { title: "Работа не найдена — Flystack" };
  return {
    title: `${work.title} — Flystack`,
    description: work.tagline || work.subtitle || work.title,
  };
}

interface Metric {
  label?: string;
  value?: string;
}

// Метрики приходят как jsonb произвольной формы — разбираем мягко.
function parseMetrics(raw: unknown): Metric[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): Metric => {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const label = o.label ?? o.k ?? o.name;
        const value = o.value ?? o.v ?? o.metric;
        return {
          label: label != null ? String(label) : undefined,
          value: value != null ? String(value) : undefined,
        };
      }
      return { value: String(item) };
    })
    .filter((m) => m.value);
}

function Block({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
        {title}
      </h3>
      <p className="mt-2 leading-relaxed text-ink/90">{text}</p>
    </div>
  );
}

export default async function WorkCasePage({ params }: PageProps) {
  const { slug } = await params;
  const work = await apiGetSafe<Work | null>(`/works/${slug}`, null);
  if (!work) notFound();

  const feed = await apiGetSafe<ReviewsFeed>("/reviews", {
    reviews: [],
    summary: { average: 0, count: 0 },
  });
  const workReviews = feed.reviews.filter((r) => r.work.id === work.id);
  const metrics = parseMetrics(work.metrics);

  return (
    <article className="mx-auto max-w-5xl px-4 py-16">
      {/* Шапка */}
      <div className="inline-block frost">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Link href="/works" className="hover:text-primary">
            Работы
          </Link>
          <span>/</span>
          <span>{work.category}</span>
          {work.year && <span>· {work.year}</span>}
        </div>

        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{work.title}</h1>
        {work.tagline && (
          <p className="mt-4 max-w-2xl text-lg text-muted">{work.tagline}</p>
        )}
      </div>

      <div className="mt-7 flex flex-wrap gap-4">
        <Link
          href={`/reviews/new?work=${work.id}`}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
        >
          Оставить отзыв
        </Link>
        <Link
          href="/contact"
          className="rounded-full bg-white px-6 py-3 font-semibold text-ink ring-1 ring-black/10 hover:ring-primary/40"
        >
          Хочу похожий проект
        </Link>
      </div>

      {/* Обложка */}
      <div className="mt-10 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-primary/20 to-accent/30">
        {work.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.cover_url}
            alt={work.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Метрики результата */}
      {metrics.length > 0 && (
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-card)] bg-white p-6 text-center shadow-sm ring-1 ring-black/5"
            >
              <div className="text-3xl font-bold text-primary">{m.value}</div>
              {m.label && (
                <div className="mt-1 text-sm text-muted">{m.label}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Задача → Решение → Результат */}
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        <Block title="Задача" text={work.challenge} />
        <Block title="Решение" text={work.solution} />
        <Block title="Результат" text={work.result} />
      </div>

      {/* Услуги */}
      {work.services.length > 0 && (
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Услуги
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {work.services.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-black/10"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Галерея */}
      {work.gallery.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {work.gallery.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${work.title} — экран ${i + 1}`}
              className="w-full rounded-[var(--radius-card)] ring-1 ring-black/5"
            />
          ))}
        </div>
      )}

      {/* Отзывы об этой работе */}
      {workReviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold">Отзывы об этой работе</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {workReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-[var(--radius-card)] bg-ink px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-bold">Хотите такой же результат?</h2>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-full bg-accent px-7 py-3 font-semibold text-ink transition-transform hover:scale-105"
        >
          Обсудить проект
        </Link>
      </div>
    </article>
  );
}

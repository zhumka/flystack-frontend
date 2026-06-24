import Link from "next/link";
import type { Work } from "@/lib/types";

export function WorkCard({ work }: { work: Work }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/30">
        {work.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.cover_url}
            alt={work.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-primary/40">
            {work.title}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
            {work.category}
          </span>
          {work.year && <span>{work.year}</span>}
        </div>

        <h3 className="mt-2 text-lg font-semibold">{work.title}</h3>
        {work.subtitle && (
          <p className="mt-1 text-sm text-muted">{work.subtitle}</p>
        )}

        <div className="mt-4 flex gap-3 pt-1">
          <Link
            href={`/works/${work.slug}`}
            className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Подробнее
          </Link>
          <Link
            href={`/reviews/new?work=${work.id}`}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/30 hover:bg-primary/5"
          >
            Отзыв
          </Link>
        </div>
      </div>
    </article>
  );
}

import type { ReviewItem } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-accent" aria-label={`Оценка ${rating} из 5`}>
      {"★".repeat(rating)}
      <span className="text-ink/15">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

export function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="flex break-inside-avoid flex-col gap-3 rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Stars rating={review.rating} />
      <p className="text-sm leading-relaxed text-ink/90">{review.text}</p>
      <div className="mt-auto pt-2">
        <div className="font-semibold">{review.author_name}</div>
        {review.role_text && (
          <div className="text-sm text-muted">{review.role_text}</div>
        )}
        <div className="mt-1 text-xs text-primary">{review.work.title}</div>
      </div>
    </article>
  );
}

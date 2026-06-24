"use client";

import { useMemo, useState } from "react";
import type { ReviewItem } from "@/lib/types";
import { ReviewCard } from "./ReviewCard";

export function ReviewsBoard({ reviews }: { reviews: ReviewItem[] }) {
  const categories = useMemo(() => {
    const set = new Set(reviews.map((r) => r.work.category));
    return ["Все", ...Array.from(set)];
  }, [reviews]);

  const [active, setActive] = useState("Все");
  const filtered =
    active === "Все"
      ? reviews
      : reviews.filter((r) => r.work.category === active);

  if (reviews.length === 0) {
    return (
      <p className="mt-10 text-muted">
        Пока нет опубликованных отзывов — станьте первым.
      </p>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-primary text-white"
                : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-primary/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {filtered.map((r) => (
          <ReviewCard key={r.id} review={r} />
        ))}
      </div>
    </>
  );
}

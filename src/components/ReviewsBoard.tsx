"use client";

import { useMemo, useState } from "react";
import type { Locale, ReviewItem } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ReviewCard } from "./ReviewCard";

export function ReviewsBoard({
  reviews,
  locale,
}: {
  reviews: ReviewItem[];
  locale: Locale;
}) {
  // "" — «все категории»; ярлык из словаря, чтобы фильтр не зависел от языка.
  const categories = useMemo(() => {
    const set = new Set(reviews.map((r) => r.work.category));
    return ["", ...Array.from(set)];
  }, [reviews]);

  const [active, setActive] = useState("");
  const filtered =
    active === ""
      ? reviews
      : reviews.filter((r) => r.work.category === active);

  if (reviews.length === 0) {
    return <p className="mt-10 text-muted">{t(locale, "reviews.empty")}</p>;
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat || "__all"}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-primary text-white"
                : "bg-white text-ink/70 ring-1 ring-black/10 hover:ring-primary/40"
            }`}
          >
            {cat || t(locale, "common.all")}
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

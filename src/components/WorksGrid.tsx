"use client";

import { useMemo, useState } from "react";
import type { Work } from "@/lib/types";
import { WorkCard } from "./WorkCard";

export function WorksGrid({ works }: { works: Work[] }) {
  const categories = useMemo(() => {
    const set = new Set(works.map((w) => w.category));
    return ["Все", ...Array.from(set)];
  }, [works]);

  const [active, setActive] = useState("Все");

  const filtered =
    active === "Все" ? works : works.filter((w) => w.category === active);

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

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-muted">В этой категории пока нет работ.</p>
      )}
    </>
  );
}

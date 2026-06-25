"use client";

import { useMemo, useState } from "react";
import type { Locale, Work } from "@/lib/types";
import { t } from "@/lib/i18n";
import { WorkCard } from "./WorkCard";

export function WorksGrid({
  works,
  locale,
}: {
  works: Work[];
  locale: Locale;
}) {
  // "" — «все категории»; сам ярлык берём из словаря, чтобы фильтр не зависел от языка.
  const categories = useMemo(() => {
    const set = new Set(works.map((w) => w.category));
    return ["", ...Array.from(set)];
  }, [works]);

  const [active, setActive] = useState("");

  const filtered =
    active === "" ? works : works.filter((w) => w.category === active);

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

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkCard key={w.id} work={w} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-muted">{t(locale, "works.emptyCategory")}</p>
      )}
    </>
  );
}

import type { Metadata } from "next";
import { apiGetSafe } from "@/lib/api";
import type { Work } from "@/lib/types";
import { WorksGrid } from "@/components/WorksGrid";

export const metadata: Metadata = {
  title: "Работы — Flystack",
  description: "Портфолио студии Flystack: сайты, магазины, лендинги, боты.",
};

export default async function WorksPage() {
  const works = await apiGetSafe<Work[]>("/works", []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="inline-block frost">
        <h1 className="text-3xl font-bold sm:text-4xl">Работы</h1>
        <p className="mt-3 max-w-xl text-muted">
          Проекты, которые мы спроектировали, собрали и запустили. Выберите
          категорию, чтобы отфильтровать.
        </p>
      </div>

      {works.length > 0 ? (
        <WorksGrid works={works} />
      ) : (
        <p className="mt-10 text-muted">Скоро здесь появятся проекты.</p>
      )}
    </section>
  );
}

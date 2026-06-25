import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale-server";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Обсудить проект — Flystack",
  description:
    "Расскажите о задаче — предложим решение и сроки. Заявка без регистрации.",
};

export default async function ContactPage() {
  const locale = await getServerLocale();
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="inline-block frost">
        <h1 className="text-3xl font-bold sm:text-4xl">{t(locale, "contact.title")}</h1>
        <p className="mt-3 max-w-xl text-muted">{t(locale, "contact.subtitle")}</p>
      </div>

      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
  );
}

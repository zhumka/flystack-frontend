import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Обсудить проект — Flystack",
  description:
    "Расскажите о задаче — предложим решение и сроки. Заявка без регистрации.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="inline-block frost">
        <h1 className="text-3xl font-bold sm:text-4xl">Обсудить проект</h1>
        <p className="mt-3 max-w-xl text-muted">
          Заполните короткую форму — обсудим задачу, предложим решение и сроки.
          Регистрация не нужна, обязателен только контакт для связи.
        </p>
      </div>

      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
  );
}

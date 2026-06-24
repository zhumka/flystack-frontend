"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { Select } from "@/components/Select";

const serviceOptions = [
  "Сайт-визитка",
  "Интернет-магазин",
  "Лендинг",
  "Корпоративный сайт",
  "Telegram-бот и Mini App",
  "Автоматизация",
  "Другое",
];

const budgetOptions = [
  "до 100 000 ₽",
  "100–300 000 ₽",
  "300–700 000 ₽",
  "более 700 000 ₽",
  "Пока не знаю",
];

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState(serviceOptions[0]);
  const [budget, setBudget] = useState(budgetOptions[0]);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!contact.trim()) {
      setError("Укажите контакт для связи.");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest<Lead>("/leads", {
        method: "POST",
        body: { name, contact, service, budget, message },
      });
      setDone(true);
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <div className="text-4xl">✅</div>
        <h2 className="mt-4 text-2xl font-bold">Заявка отправлена</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Мы свяжемся с вами по указанному контакту в ближайшее время.
          Спасибо за интерес к Flystack!
        </p>
        <button
          onClick={() => {
            setDone(false);
            setName("");
            setContact("");
            setMessage("");
          }}
          className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-medium ring-1 ring-black/10 hover:ring-primary/40"
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="block">
          <span className="text-sm font-medium">Услуга</span>
          <div className="mt-1.5">
            <Select
              value={service}
              onChange={setService}
              options={serviceOptions}
            />
          </div>
        </div>

        <div className="block">
          <span className="text-sm font-medium">Бюджет</span>
          <div className="mt-1.5">
            <Select
              value={budget}
              onChange={setBudget}
              options={budgetOptions}
            />
          </div>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium">Опишите задачу</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Коротко о проекте, целях и сроках"
          className={`mt-1.5 ${inputClass} resize-none`}
        />
      </label>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Имя</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            Контакт <span className="text-accent">*</span>
          </span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Telegram, телефон или email"
            className={`mt-1.5 ${inputClass}`}
            required
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}

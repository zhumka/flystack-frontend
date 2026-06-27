"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import { Select } from "@/components/Select";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ContactForm() {
  const { locale } = useLocale();
  const serviceOptions = [
    t(locale, "svcOpt.landing"),
    t(locale, "svcOpt.shop"),
    t(locale, "svcOpt.promo"),
    t(locale, "svcOpt.corp"),
    t(locale, "svcOpt.bot"),
    t(locale, "svcOpt.auto"),
    t(locale, "svcOpt.other"),
  ];
  const currencyOptions = ["USD", "KGS", "RUB"];

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState(serviceOptions[0]);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [currency, setCurrency] = useState(currencyOptions[0]);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!contact.trim()) {
      setError(t(locale, "lead.errContact"));
      return;
    }

    // Бюджет — свободная строка на бэке: собираем «сумма + валюта» (пустая, если суммы нет).
    const budget = budgetAmount.trim() ? `${budgetAmount.trim()} ${currency}` : "";

    setSubmitting(true);
    try {
      await apiRequest<Lead>("/leads", {
        method: "POST",
        body: { name, contact, service, budget, message },
      });
      setDone(true);
    } catch {
      setError(t(locale, "lead.errSend"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <div className="text-4xl">✅</div>
        <h2 className="mt-4 text-2xl font-bold">{t(locale, "lead.doneTitle")}</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">{t(locale, "lead.doneText")}</p>
        <button
          onClick={() => {
            setDone(false);
            setName("");
            setContact("");
            setMessage("");
          }}
          className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-medium ring-1 ring-black/10 hover:ring-primary/40"
        >
          {t(locale, "lead.sendAnother")}
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
          <span className="text-sm font-medium">{t(locale, "lead.service")}</span>
          <div className="mt-1.5">
            <Select
              value={service}
              onChange={setService}
              options={serviceOptions}
              placeholder={t(locale, "select.placeholder")}
            />
          </div>
        </div>

        <div className="block">
          <span className="text-sm font-medium">{t(locale, "lead.budget")}</span>
          <div className="mt-1.5 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder={t(locale, "budget.amountPlaceholder")}
              className={`${inputClass} flex-1`}
            />
            <div className="w-28 shrink-0">
              <Select
                value={currency}
                onChange={setCurrency}
                options={currencyOptions}
                placeholder={t(locale, "budget.currency")}
              />
            </div>
          </div>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium">{t(locale, "lead.describe")}</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={t(locale, "lead.describePlaceholder")}
          className={`mt-1.5 ${inputClass} resize-none`}
        />
      </label>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t(locale, "lead.name")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(locale, "lead.namePlaceholder")}
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            {t(locale, "lead.contact")} <span className="text-accent">*</span>
          </span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t(locale, "lead.contactPlaceholder")}
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
        {submitting ? t(locale, "lead.sending") : t(locale, "lead.send")}
      </button>
    </form>
  );
}

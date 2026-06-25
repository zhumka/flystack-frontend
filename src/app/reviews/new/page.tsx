"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, apiGetSafe, apiRequest, localePath } from "@/lib/api";
import { clearAuth, getAccessToken, getStoredUser } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import type { User, Work } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function NewReviewPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [ready, setReady] = useState(false);

  const [workId, setWorkId] = useState("");
  const [rating, setRating] = useState(0);
  const [roleText, setRoleText] = useState("");
  const [text, setText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());

    (async () => {
      const list = await apiGetSafe<Work[]>(localePath("/works", locale), []);
      setWorks(list);
      const preset = new URLSearchParams(window.location.search).get("work");
      if (preset && list.some((w) => w.id === preset)) setWorkId(preset);
      setReady(true);
    })();
  }, [router, locale]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!workId) return setError(t(locale, "new.errWork"));
    if (rating < 1) return setError(t(locale, "new.errRating"));
    if (text.trim().length < 10) return setError(t(locale, "new.errText"));

    setSubmitting(true);
    try {
      await apiRequest("/reviews", {
        method: "POST",
        auth: true,
        body: { work_id: workId, rating, role_text: roleText, text },
      });
      router.push("/me");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          clearAuth();
          router.replace("/login");
          return;
        }
        if (err.status === 403) setError(t(locale, "new.err403"));
        else if (err.status === 404) setError(t(locale, "new.err404"));
        else setError(t(locale, "new.errGeneric"));
      } else {
        setError(t(locale, "new.errGeneric"));
      }
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center text-muted">
        {t(locale, "new.loading")}
      </section>
    );
  }

  // Гейт по подтверждению почты (дублирует серверную проверку).
  if (user && !user.email_verified) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{t(locale, "new.verifyTitle")}</h1>
        <p className="mt-3 text-muted">{t(locale, "new.verifyText")}</p>
        <Link
          href="/me"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark"
        >
          {t(locale, "new.toCabinet")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">{t(locale, "new.title")}</h1>
      <p className="mt-3 text-muted">{t(locale, "new.subtitle")}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-[var(--radius-card)] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8"
      >
        {/* Работа */}
        <label className="block">
          <span className="text-sm font-medium">{t(locale, "new.work")}</span>
          <select
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            className={`mt-1.5 ${inputClass} select-styled`}
          >
            <option value="">{t(locale, "new.selectWork")}</option>
            {works.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        </label>

        {/* Оценка */}
        <div>
          <span className="text-sm font-medium">{t(locale, "new.rating")}</span>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} из 5`}
                className={`text-3xl transition-colors ${
                  n <= rating ? "text-accent" : "text-ink/15"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Кто автор */}
        <label className="block">
          <span className="text-sm font-medium">{t(locale, "new.role")}</span>
          <input
            value={roleText}
            onChange={(e) => setRoleText(e.target.value)}
            placeholder={t(locale, "new.rolePlaceholder")}
            className={`mt-1.5 ${inputClass}`}
          />
        </label>

        {/* Текст */}
        <label className="block">
          <span className="text-sm font-medium">{t(locale, "new.text")}</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={t(locale, "new.textPlaceholder")}
            className={`mt-1.5 ${inputClass} resize-none`}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
        >
          {submitting ? t(locale, "new.submitting") : t(locale, "new.submit")}
        </button>
      </form>
    </section>
  );
}

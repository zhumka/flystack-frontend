import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale-server";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Вход и регистрация — Flystack",
};

export default async function LoginPage() {
  const locale = await getServerLocale();
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold">{t(locale, "login.welcome")}</h1>
      <p className="mt-2 text-center text-muted">{t(locale, "login.subtitle")}</p>
      <div className="mt-8">
        <AuthForm />
      </div>
    </section>
  );
}

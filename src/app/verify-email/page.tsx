import type { Metadata } from "next";
import { Suspense } from "react";
import { t } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale-server";
import { VerifyEmail } from "./VerifyEmail";

export const metadata: Metadata = {
  title: "Подтверждение почты — Flystack",
};

// useSearchParams в клиентском компоненте требует Suspense-границы,
// иначе прод-сборка падает (Missing Suspense boundary with useSearchParams).
export default async function VerifyEmailPage() {
  const locale = await getServerLocale();
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-md px-4 py-24 text-center text-muted">
          {t(locale, "ve.verifying")}
        </section>
      }
    >
      <VerifyEmail />
    </Suspense>
  );
}

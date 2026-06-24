import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "./VerifyEmail";

export const metadata: Metadata = {
  title: "Подтверждение почты — Flystack",
};

// useSearchParams в клиентском компоненте требует Suspense-границы,
// иначе прод-сборка падает (Missing Suspense boundary with useSearchParams).
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-md px-4 py-24 text-center text-muted">
          Подтверждаем почту…
        </section>
      }
    >
      <VerifyEmail />
    </Suspense>
  );
}

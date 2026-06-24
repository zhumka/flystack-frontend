import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Вход и регистрация — Flystack",
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-bold">Добро пожаловать</h1>
      <p className="mt-2 text-center text-muted">
        Войдите, чтобы оставлять отзывы о работах студии.
      </p>
      <div className="mt-8">
        <AuthForm />
      </div>
    </section>
  );
}

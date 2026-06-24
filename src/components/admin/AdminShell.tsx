"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken, getStoredUser } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/reviews", label: "Модерация отзывов" },
  { href: "/admin/works", label: "Работы" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/content", label: "Контент" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!getAccessToken() || !user || user.role !== "admin") {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (authorized === null) {
    return (
      <div className="px-4 py-24 text-center text-muted">Проверка доступа…</div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
      <aside className="md:w-56 md:shrink-0">
        <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Админ-панель
        </div>
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-ink/70 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_EVENT, clearAuth, getStoredUser } from "@/lib/auth";
import type { User } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function Navbar() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: t(locale, "nav.home") },
    { href: "/works", label: t(locale, "nav.works") },
    { href: "/reviews", label: t(locale, "nav.reviews") },
  ];

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    setReady(true);
    // Обновляемся при входе/выходе в этой вкладке (AUTH_EVENT) и в других (storage).
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function logout() {
    clearAuth();
    setUser(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Fly<span className="text-primary">stack</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-ink/80"
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {ready && user ? (
            <>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden text-sm font-medium text-primary hover:text-primary-dark sm:block"
                >
                  {t(locale, "nav.admin")}
                </Link>
              )}
              <Link
                href="/me"
                className="hidden text-sm font-medium text-ink/80 hover:text-primary sm:block"
              >
                {user.name || t(locale, "nav.account")}
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted hover:text-ink"
              >
                {t(locale, "nav.logout")}
              </button>
            </>
          ) : (
            ready && (
              <Link
                href="/login"
                className="text-sm font-medium text-ink/80 hover:text-primary"
              >
                {t(locale, "nav.login")}
              </Link>
            )
          )}
          <Link
            href="/contact"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {t(locale, "nav.discuss")}
          </Link>
        </div>
      </div>
    </header>
  );
}

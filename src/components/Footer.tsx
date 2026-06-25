"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

export function Footer() {
  const { locale } = useLocale();
  return (
    <footer className="relative z-10 border-t border-black/5 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-bold">
            Fly<span className="text-primary">stack</span>
          </div>
          <p className="mt-1 text-sm text-muted">{t(locale, "footer.tagline")}</p>
        </div>
        <nav className="flex gap-6 text-sm text-ink/70">
          <Link href="/works" className="hover:text-primary">
            {t(locale, "nav.works")}
          </Link>
          <Link href="/reviews" className="hover:text-primary">
            {t(locale, "nav.reviews")}
          </Link>
          <Link href="/contact" className="hover:text-primary">
            {t(locale, "nav.discuss")}
          </Link>
        </nav>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Flystack
        </p>
      </div>
    </footer>
  );
}

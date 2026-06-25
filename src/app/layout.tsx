import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundShapes } from "@/components/BackgroundShapes";
import { PageTransition } from "@/components/PageTransition";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getServerLocale } from "@/lib/locale-server";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Flystack — студия цифровых продуктов",
  description:
    "Сайты-визитки, интернет-магазины, лендинги, Telegram-боты и автоматизация. Реальные модерируемые отзывы клиентов.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} className={`${onest.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LocaleProvider initial={locale}>
          <BackgroundShapes />
          <Navbar />
          <main className="relative z-10 flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}

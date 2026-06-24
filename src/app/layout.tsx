import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundShapes } from "@/components/BackgroundShapes";
import { PageTransition } from "@/components/PageTransition";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Flystack — студия цифровых продуктов",
  description:
    "Сайты-визитки, интернет-магазины, лендинги, Telegram-боты и автоматизация. Реальные модерируемые отзывы клиентов.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${onest.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <BackgroundShapes />
        <Navbar />
        <main className="relative z-10 flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}

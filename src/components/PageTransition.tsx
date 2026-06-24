"use client";

import { usePathname } from "next/navigation";

// Перемонтируем обёртку по смене пути (key) — каждая навигация заново
// проигрывает анимацию появления, давая плавный переход между страницами.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}

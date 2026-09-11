'use client';

import { usePathname } from 'next/navigation';

/**
 * بيخفي هيدر وفوتر الموقع على المسارات اللي بتشتغل كتطبيق بشاشة كاملة.
 *
 * لوحة الأوفرلي ليها شريط جانبي وشريط علوي خاصين بيها، فهيدر الموقع فوقها
 * بيزنق المساحة ويبقى فيه شريطين فوق بعض. باقي الموقع مابيتأثرش.
 */
const FULLSCREEN = ['/overlay'];

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const bare = FULLSCREEN.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (bare) return null;
  return <>{children}</>;
}

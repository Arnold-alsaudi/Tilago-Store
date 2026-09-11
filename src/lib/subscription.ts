import { randomBytes } from 'crypto';

/* ============================================================
   حساب مدة الاشتراك

   الحسبة دي بتتعمل مرة واحدة في النظام مش في كل مكان، عشان
   ماتختلفش من مكان للتاني. وأي غلطة هنا معناها عميل دافع
   واشتراكه واقف، أو عميل شغّال ببلاش شهور.
   ============================================================ */

export const PLANS = {
  m1: { months: 1,  label: 'شهري',   price: 299 },
  m3: { months: 3,  label: '3 شهور', price: 749 },
  y:  { months: 12, label: 'سنوي',   price: 2399 },
} as const;

export type PlanKey = keyof typeof PLANS;

export const isPlan = (v: unknown): v is PlanKey =>
  typeof v === 'string' && v in PLANS;

/**
 * إضافة شهور لتاريخ.
 *
 * `setMonth` لوحدها بتغلط في آخر الشهر: 31 يناير + شهر بتطلع 3 مارس
 * لأن فبراير مافيهوش 31. العميل اللي اشترك يوم 31 كان هياخد يومين
 * زيادة كل مرة. هنا بنثبّت على آخر يوم في الشهر المقصود.
 */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

/**
 * تاريخ نهاية الاشتراك بعد التفعيل أو التجديد.
 *
 * العميل اللي بيجدّد وهو لسه عنده أيام فاضلة **مابيخسرهاش** — المدة
 * الجديدة بتتضاف على اللي باقي، مش على النهاردة. لو اشتراكه خلص
 * خلاص، بنبدأ من النهاردة.
 */
export function computeEnd(plan: PlanKey, currentEnd: Date | null, now = new Date()): Date {
  const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
  return addMonths(base, PLANS[plan].months);
}

/** الأيام الفاضلة، أو null لو مفيش تاريخ نهاية */
export function daysLeft(endsAt: Date | null, now = new Date()): number | null {
  if (!endsAt) return null;
  return Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000);
}

/** الاشتراك شغّال دلوقتي؟ */
export function isActive(
  status: string,
  endsAt: Date | null,
  now = new Date(),
): boolean {
  if (status !== 'active') return false;
  return endsAt === null || endsAt.getTime() > now.getTime();
}

/**
 * مفتاح الرابط.
 *
 * ده كل الحماية اللي على الرابط، فلازم يكون عشوائي بجد ومستحيل
 * يتخمّن. 24 بايت عشوائية بترميز URL-safe.
 */
export function newToken(): string {
  return randomBytes(24).toString('base64url');
}

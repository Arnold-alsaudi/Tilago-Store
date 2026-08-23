import { NextResponse } from 'next/server';

// سعر صرف الدولار مقابل الجنيه — بيتجاب حيّ من مصدر مجاني ويتخزّن مؤقتاً ساعة.
// القيمة الاحتياطية تُستخدم لو المصدر فشل (يمكن ضبطها من متغيّر البيئة).
const FALLBACK_EGP_PER_USD = Number(process.env.EGP_PER_USD_FALLBACK) || 50;

export async function GET() {
  try {
    // open.er-api.com — مجاني وبدون مفتاح، ويشمل الجنيه المصري (EGP)
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 }, // كاش ساعة
    });
    const data = await res.json().catch(() => null);
    const egp = data?.rates?.EGP;
    if (typeof egp === 'number' && egp > 0) {
      return NextResponse.json({
        egpPerUsd: egp,
        source: 'open.er-api.com',
        updatedAt: data?.time_last_update_utc ?? null,
      });
    }
  } catch {
    // نسقط للقيمة الاحتياطية تحت
  }
  return NextResponse.json({ egpPerUsd: FALLBACK_EGP_PER_USD, source: 'fallback', updatedAt: null });
}

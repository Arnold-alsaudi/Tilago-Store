import { NextRequest } from 'next/server';

// الـ IP الحقيقي للعميل — لمنع تخطّي الـ rate limit.
//
// خطر: العميل يقدر يبعت هيدر `x-forwarded-for` بأي قيمة، فلو اعتمدنا على أول
// عنصر فيه (أو عليه كله) يقدر يزوّره ويحصل على عداد جديد كل طلب ويتخطى الحد.
//
// الحل: نعتمد على `x-real-ip` — Vercel (والبروكسيهات الموثوقة) بتحطه بالـ IP
// الحقيقي للاتصال وبتكتب فوق أي قيمة جاية من العميل، فمينفعش يتزوّر.
// كاحتياطي بس ناخد *آخر* عنصر في `x-forwarded-for` (اللي بيضيفه أقرب بروكسي
// موثوق) مش أول عنصر (اللي العميل بيدّعيه).
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }

  return 'unknown';
}

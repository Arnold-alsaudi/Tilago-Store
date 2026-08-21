import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { prisma } from '@/lib/prisma';

// طلب "lead" لتدفق PayPal.me اليدوي — مجرد تسجيل نيّة دفع *غير مؤكدة* عشان الأدمن
// يتابع ويتواصل. المسار مفتوح للزوّار (بدون تسجيل دخول)، فلازم نتحقق من المدخلات
// بصرامة ونحدّد سقف للمبلغ عشان محدش يلوّث جدول المدفوعات بقيم عبثية أو ضخمة،
// ولا يزوّر سجلات تبان حقيقية. السجل بيتحفظ دايماً status=pending — ممنوع التسليم
// إلا بعد ما الأدمن يتأكد إن الفلوس وصلت فعلاً على PayPal.
const leadSchema = z.object({
  name:   z.string().trim().min(1).max(120),
  amount: z.number().positive().max(100_000),
  phone:  z.string().trim().min(8).max(20),
  method: z.enum(['PayPal', 'InstaPay', 'Vodafone Cash', 'Fawry']).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 5, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { name, amount, phone, method } = parsed.data;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }

  try {
    await prisma.payment.create({
      data: {
        userEmail: 'paypal@tilago.io',
        userName: 'عميل PayPal (غير مؤكد)',
        userPhone: digits,
        productName: name.slice(0, 120),
        amount,
        currency: 'EGP',
        method: method ?? 'PayPal',
        status: 'pending',        // غير مؤكد — لا يُسلَّم إلا بعد تأكيد وصول الفلوس
        deliveryStatus: 'pending',
      },
    });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

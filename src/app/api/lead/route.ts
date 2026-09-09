import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { prisma } from '@/lib/prisma';
import { buildOrderLabel } from '@/lib/orderLabel';
import { notifyPendingPayment } from '@/lib/notify';

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
  // أسطر الطلب — منها بنجيب الاسم والكود من الداتابيز بدل ما نثق في نص العميل
  items:  z.array(z.object({
    productId: z.string().min(1).max(200),
    quantity:  z.number().int().positive().max(99).optional(),
  })).max(50).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 5, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { name, amount, phone, method, items } = parsed.data;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }

  // إيميل العميل من الجلسة لو مسجّل دخول — عشان الطلب يظهر له في "طلباتي".
  // الزائر غير المسجّل بيفضل على الإيميل الوهمي (مفيش طريقة نعرفه بيها).
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email ?? null;
  const sessionName = session?.user?.name ?? null;

  // وصف الطلب بالكود من الداتابيز — "[480O4] Give Me Eye ×1"
  const productName = (await buildOrderLabel(
    items?.map(i => ({ productId: i.productId, quantity: i.quantity ?? 1 })),
    name,
  )).slice(0, 200);

  try {
    await prisma.payment.create({
      data: {
        userEmail: sessionEmail ?? 'paypal@tilago.io',
        userName: sessionName ?? 'عميل PayPal (غير مؤكد)',
        userPhone: digits,
        productName,
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

  // نعلمك على تليجرام إن فيه حد بيدفع — من غير ده كان الطلب بيتسجّل في الداتابيز
  // بس ومفيش أي إشعار، فمكنتش تعرف إلا لو فتحت لوحة الطلبات
  await notifyPendingPayment({
    productName,
    amount,
    currency: 'EGP',
    customerName: sessionName ?? 'زائر',
    customerEmail: sessionEmail ?? 'غير مسجّل',
    customerPhone: digits,
    method: method ?? 'PayPal',
  });

  return NextResponse.json({ success: true });
}

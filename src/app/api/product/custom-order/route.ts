import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { notifyCustomOrder } from '@/lib/notify';

// يستقبل التخصيص (شعار + اسم + وسيلة تواصل) عند الشراء ويبعت إشعار للأدمن.
const schema = z.object({
  productName: z.string().min(1).max(200),
  quantity:    z.number().int().positive().max(99),
  amount:      z.number().min(0).max(1_000_000),
  currency:    z.string().max(10).optional(),
  name:        z.string().max(120).optional(),
  contact:     z.string().min(1).max(200),
  logoUrl:     z.string().max(600).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(ip, 8, 60_000);
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const d = parsed.data;

  // نقبل رابط الشعار فقط لو من Cloudinary (اللي رفعنا عليه) — منعاً لحقن روابط غريبة في الإشعار
  const logoUrl = d.logoUrl && /^https:\/\/res\.cloudinary\.com\//.test(d.logoUrl) ? d.logoUrl : '';

  try {
    await notifyCustomOrder({
      productName: d.productName,
      quantity: d.quantity,
      amount: d.amount,
      currency: d.currency ?? 'EGP',
      name: (d.name ?? '').slice(0, 120),
      contact: d.contact,
      logoUrl,
    });
  } catch {
    // ما نكسرش تجربة العميل لو الإشعار فشل
  }

  return NextResponse.json({ success: true });
}

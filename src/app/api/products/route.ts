import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidateProduct } from '@/lib/revalidateProduct';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const products = await prisma.product.findMany({
    where: { ...(category ? { category: category as any } : {}), active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(products);
}

// الكود بيتخزّن دايماً كابيتال ومن غير مسافات عشان البحث والمقارنة يبقوا متسقين
const codeField = z.string().trim().toUpperCase().max(16).nullable().optional()
  .transform(v => (v ? v : null));

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.enum(['ALERTS', 'STREAM', 'PACKAGE', 'THREE_D', 'VIDEO']),
  subCategory: z.string().optional().nullable(),
  code: codeField,
  colorKey: z.string().trim().toUpperCase().max(2).nullable().optional().transform(v => (v ? v : null)),
  comingSoon: z.boolean().default(false),
  priceLabel: z.string().nullable().optional(),
  imageUrl: z.string().default(''),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  videoUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // safeParse بدل parse — مدخلات غلط (مثلاً سعر فاضي بيتحوّل NaN) كانت بترمي
  // استثناء وترجع 500 مبهم بدل 400 برسالة تقول إيه الغلط بالظبط
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    return NextResponse.json(
      { error: `${issue.path.join('.') || 'body'}: ${issue.message}` },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    // المنتج الجديد لازم يبان في صفحة قسمه فوراً بدل ما يستنى المؤقّت
    revalidateProduct(product);
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    // P2002 = تعارض في حقل مميّز — غالباً كود متكرر. نرد برسالة مفهومة بدل 500
    if ((err as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { error: `الكود "${parsed.data.code}" مستخدم في منتج تاني — اختار كود غيره` },
        { status: 409 },
      );
    }
    throw err;
  }
}

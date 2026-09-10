import { prisma } from '@/lib/prisma';
import ThreeDClient, { TDProduct } from './ThreeDClient';

// الصفحة بتتخزّن على سيرفرات Vercel القريبة من العميل بدل ما تتبني من الأول
// لكل زائر — كانت 'force-dynamic' وكل زيارة بتضرب الداتابيز. الرقم ده شبكة
// أمان بس: لوحة الأدمن بتنادي revalidatePath عند أي تعديل، فالتغيير بيظهر فوراً.
export const revalidate = 300;

export default async function ThreeDPage() {
  let products: TDProduct[] = [];
  try {
    const rows = await prisma.product.findMany({
      where: { category: 'THREE_D', active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    products = rows.map(p => ({
      id: p.id,
      name: p.title,
      desc: p.description,
      cat: p.subCategory ?? 'logo3d',
      badge: p.tags?.[0] || undefined,
      cover: p.imageUrl || (p.images?.[0] ?? ''),
      media: (p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : [])),
    }));
  } catch {}

  return <ThreeDClient products={products} />;
}

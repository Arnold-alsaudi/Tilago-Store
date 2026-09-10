import { prisma } from '@/lib/prisma';
import StreamClient, { StreamPkg } from './StreamClient';

// الصفحة بتتخزّن على سيرفرات Vercel القريبة من العميل بدل ما تتبني من الأول
// لكل زائر — كانت 'force-dynamic' وكل زيارة بتضرب الداتابيز. الرقم ده شبكة
// أمان بس: لوحة الأدمن بتنادي revalidatePath عند أي تعديل، فالتغيير بيظهر فوراً.
export const revalidate = 300;

export default async function StreamPage() {
  let packages: StreamPkg[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { category: 'STREAM', active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    packages = products.map(p => ({
      id:     p.id,
      nameAr: p.title,
      name:   p.description,
      cover:  p.imageUrl || (p.images?.[0] ?? ''),
      images: p.images ?? [],
      video:  p.videoUrl ?? undefined,
      available: !(p.tags ?? []).includes('unavailable'),
    }));
  } catch {}

  return <StreamClient packages={packages} />;
}

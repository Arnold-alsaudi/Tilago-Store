import { prisma } from '@/lib/prisma';
import TdmClient, { TdmPkg } from './TdmClient';

// الصفحة بتتخزّن على سيرفرات Vercel القريبة من العميل بدل ما تتبني من الأول
// لكل زائر — كانت 'force-dynamic' وكل زيارة بتضرب الداتابيز. الرقم ده شبكة
// أمان بس: لوحة الأدمن بتنادي revalidatePath عند أي تعديل، فالتغيير بيظهر فوراً.
export const revalidate = 300;

export default async function TdmPage() {
  let packages: TdmPkg[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { category: 'PACKAGE', subCategory: 'tdm', active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    packages = products.map(p => ({
      id: p.id,
      nameAr: p.title,
      name: p.description,
      cover: p.imageUrl || (p.images?.[0] ?? ''),
      images: p.images ?? [],
      video: p.videoUrl ?? undefined,
    }));
  } catch {}
  return <TdmClient packages={packages} />;
}

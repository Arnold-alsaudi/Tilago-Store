import { revalidatePath } from 'next/cache';

/** الحد الأدنى اللي بنحتاجه عشان نعرف الصفحات اللي المنتج ظاهر فيها */
export type RevalidatableProduct = {
  id: string;
  slug?: string | null;
  code?: string | null;
  category?: string | null;
  subCategory?: string | null;
};

/** صفحة القسم اللي المنتج بيتعرض فيها — null لو القسم بيتحمّل من المتصفح أصلاً */
function listingPath(category?: string | null, subCategory?: string | null): string | null {
  switch (category) {
    case 'STREAM':  return '/stream';
    case 'THREE_D': return '/3d';
    case 'PACKAGE':
      if (subCategory === 'pubg') return '/esports/pubg';
      if (subCategory === 'tdm')  return '/esports/tdm';
      return null;
    // ALERTS و VIDEO صفحاتهم 'use client' وبتجيب الداتا من الـ API في كل فتح،
    // فمفيش نسخة مخزّنة لازم نلغيها
    default: return null;
  }
}

/**
 * إلغاء النسخة المخزّنة للصفحات اللي المنتج ده ظاهر فيها.
 *
 * من غير النداء ده، تعديلات الأدمن (سعر، صورة، قفل منتج) مكانتش هتظهر للعميل
 * إلا بعد ما مؤقّت الـ revalidate يخلص. بننادي عليها بعد كل إنشاء/تعديل/حذف
 * عشان التغيير يبان في نفس اللحظة — وده اللي بيخلينا ناخد سرعة الكاش من غير
 * ما نخسر التحكم الفوري.
 *
 * أي فشل هنا مالوش لازمة يكسر العملية — المنتج اتحفظ خلاص في الداتابيز.
 */
export function revalidateProduct(...products: (RevalidatableProduct | null | undefined)[]) {
  const paths = new Set<string>();

  for (const p of products) {
    if (!p) continue;
    paths.add(`/product/${p.id}`);
    if (p.slug) paths.add(`/product/${p.slug}`);
    if (p.code) paths.add(`/product/${p.code}`);
    const listing = listingPath(p.category, p.subCategory);
    if (listing) paths.add(listing);
  }

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (err) {
      console.error('[revalidate] فشل تحديث', path, err);
    }
  }
}

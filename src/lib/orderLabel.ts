import { prisma } from './prisma';

// ── وصف الطلب اللي بيوصلك في إشعارات البوت والإيميل ─────────
//
// المبدأ: الاسم والكود بيتجابوا من قاعدة البيانات، مش من اللي العميل بعته.
// كده الإشعار بيبقى صادق دايماً حتى لو حد عبث بالطلب من المتصفح،
// والكود بيوصلك في كل طريقة دفع مش في بايموب بس.

export interface OrderLine {
  productId: string;   // ممكن يكون id أو slug أو كود المنتج
  quantity: number;
}

/** يدوّر على المنتجات بالـ id أو الـ slug أو الكود — الاتنين بيتخزنوا في السلة حسب الصفحة */
export async function findProductsByRef(refs: string[]) {
  const ids = refs.map(String).filter(Boolean);
  if (!ids.length) return new Map<string, Awaited<ReturnType<typeof prisma.product.findMany>>[number]>();

  const upper = ids.map(s => s.toUpperCase());
  const products = await prisma.product.findMany({
    where: { OR: [{ id: { in: ids } }, { slug: { in: ids } }, { code: { in: upper } }] },
  });

  const map = new Map<string, (typeof products)[number]>();
  products.forEach(p => {
    map.set(p.id, p);
    if (p.slug) map.set(p.slug, p);
    if (p.code) map.set(p.code, p);
  });
  return map;
}

/** سطر واحد في الإشعار: "[480O4] Give Me Eye ×2" */
export function lineLabel(p: { code: string | null; title: string }, qty: number): string {
  return `${p.code ? `[${p.code}] ` : ''}${p.title} ×${qty}`;
}

/**
 * يبني وصف الطلب كامل من الداتابيز.
 * لو مفيش أسطر صالحة بيرجع `fallback` (الاسم اللي بعته العميل) عشان الإشعار
 * مايوصلش فاضي.
 */
export async function buildOrderLabel(
  lines: OrderLine[] | undefined,
  fallback: string,
): Promise<string> {
  const valid = (lines ?? []).filter(l => l && l.productId);
  if (!valid.length) return fallback;

  const map = await findProductsByRef(valid.map(l => String(l.productId)));
  const parts = valid
    .map(l => {
      const p = map.get(String(l.productId));
      if (!p) return null;
      const qty = Math.max(1, Math.floor(Number(l.quantity) || 1));
      return lineLabel(p, qty);
    })
    .filter((s): s is string => !!s);

  return parts.length ? parts.join('، ') : fallback;
}

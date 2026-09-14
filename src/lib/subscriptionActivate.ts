import { prisma } from '@/lib/prisma';
import { PLANS, computeEnd, newToken, type PlanKey } from '@/lib/subscription';

/* ============================================================
   تفعيل الاشتراك — مكان واحد بس

   بيستعمله زرار التفعيل في الأدمن (بعد PayPal) والويبهوك (بعد الكارت).
   لو كل واحد فيهم حسب التاريخ بطريقته، هييجي يوم ويختلفوا.
   ============================================================ */

/* اسم الطلب بيبدأ بالعلامة دي عشان أي حد يشوف الدفعة — الأدمن أو الويبهوك —
   يعرف إنها اشتراك أوفرلي وأنهي خطة، من غير جدول تاني. */
export const overlayTag = (plan: PlanKey) => `[OVL:${plan}]`;

export function overlayProductName(plan: PlanKey) {
  return `${overlayTag(plan)} اشتراك Tilago Overlay · ${PLANS[plan].label}`;
}

export function planFromProductName(name: string | null | undefined): PlanKey | null {
  const m = /^\[OVL:(m1|m3|y)\]/.exec(name ?? '');
  return m ? (m[1] as PlanKey) : null;
}

/**
 * تفعيل أو تجديد.
 *
 * العميل اللي بيجدّد وهو لسه عنده أيام، المدة بتتضاف عليها. السعر المقفول
 * مابيتغيّرش في التجديد — ده وعد للي اشترك بدري.
 */
export async function activateSubscription(email: string, plan: PlanKey, priceLocked?: number | null) {
  const userEmail = email.trim().toLowerCase();
  const now = new Date();

  const existing = await prisma.subscription.findUnique({
    where: { userEmail },
    select: { endsAt: true, priceLocked: true },
  });

  const endsAt = computeEnd(plan, existing?.endsAt ?? null, now);

  const sub = await prisma.subscription.upsert({
    where: { userEmail },
    update: {
      plan,
      status: 'active',
      endsAt,
      ...(existing?.priceLocked == null && priceLocked != null ? { priceLocked } : {}),
    },
    create: {
      userEmail,
      plan,
      status: 'active',
      startsAt: now,
      endsAt,
      token: newToken(),
      priceLocked: priceLocked ?? PLANS[plan].price,
    },
  });

  return { sub, renewed: Boolean(existing) };
}

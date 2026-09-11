import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { PLANS, computeEnd, newToken, type PlanKey } from '@/lib/subscription';

const activateSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  plan:  z.enum(['m1', 'm3', 'y']),
  // السعر اللي دفعه فعلاً — بيتقفل عليه لو اشترك في الإطلاق
  priceLocked: z.number().min(0).max(100_000).nullable().optional(),
});

export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const rows = await prisma.subscription.findMany({
    orderBy: [{ updatedAt: 'desc' }],
  });
  return NextResponse.json(rows);
}

/**
 * تفعيل أو تجديد.
 *
 * ده اللي بتضغطه لما البوت يقولك إن حد حوّل. النظام هو اللي بيحسب
 * تاريخ النهاية من الخطة — مش انت. ولو العميل لسه عنده أيام فاضلة،
 * المدة الجديدة بتتضاف عليها مش بتلغيها.
 */
export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = activateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    return NextResponse.json(
      { error: `${issue.path.join('.') || 'body'}: ${issue.message}` },
      { status: 400 },
    );
  }

  const { email, plan, priceLocked } = parsed.data;
  const now = new Date();

  const existing = await prisma.subscription.findUnique({
    where: { userEmail: email },
    select: { endsAt: true, token: true, priceLocked: true },
  });

  const endsAt = computeEnd(plan as PlanKey, existing?.endsAt ?? null, now);

  const sub = await prisma.subscription.upsert({
    where: { userEmail: email },
    update: {
      plan,
      status: 'active',
      endsAt,
      // السعر المقفول مابيتغيّرش في التجديد — ده كان وعد للي اشترك بدري
      ...(existing?.priceLocked == null && priceLocked != null ? { priceLocked } : {}),
    },
    create: {
      userEmail: email,
      plan,
      status: 'active',
      startsAt: now,
      endsAt,
      token: newToken(),
      priceLocked: priceLocked ?? PLANS[plan as PlanKey].price,
    },
  });

  return NextResponse.json({
    ...sub,
    renewed: Boolean(existing),
  }, { status: existing ? 200 : 201 });
}

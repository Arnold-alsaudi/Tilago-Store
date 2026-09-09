import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value; });
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { storePaused, pauseMessage, unavailableLabel, lockedAlertCats } = await req.json();

  const updates: { key: string; value: string }[] = [];
  if (typeof storePaused === 'boolean') {
    updates.push({ key: 'storePaused', value: String(storePaused) });
  }
  if (typeof pauseMessage === 'string') {
    updates.push({ key: 'pauseMessage', value: pauseMessage });
  }
  // نص الشارة اللي بتظهر على المنتجات اللي لسه مخلصتش
  if (typeof unavailableLabel === 'string') {
    updates.push({ key: 'unavailableLabel', value: unavailableLabel.trim().slice(0, 60) });
  }
  // أقسام الاليرتات المقفولة يدوياً — بتتخزّن مفصولة بفواصل
  if (Array.isArray(lockedAlertCats)) {
    const clean = lockedAlertCats
      .filter((c): c is string => typeof c === 'string')
      .map(c => c.trim())
      .filter(Boolean)
      .slice(0, 20);
    updates.push({ key: 'lockedAlertCats', value: clean.join(',') });
  }

  for (const { key, value } of updates) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  return NextResponse.json({ success: true });
}

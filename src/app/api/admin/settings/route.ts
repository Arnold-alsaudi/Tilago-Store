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

  const { storePaused, pauseMessage } = await req.json();

  const updates: { key: string; value: string }[] = [];
  if (typeof storePaused === 'boolean') {
    updates.push({ key: 'storePaused', value: String(storePaused) });
  }
  if (typeof pauseMessage === 'string') {
    updates.push({ key: 'pauseMessage', value: pauseMessage });
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

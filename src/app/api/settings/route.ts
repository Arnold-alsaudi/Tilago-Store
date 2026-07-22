import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// إعدادات عامة للموقع — يقرأها أي زائر
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ['storePaused', 'pauseMessage'] } },
    });
    const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
    return NextResponse.json({
      storePaused: map.storePaused === 'true',
      pauseMessage: map.pauseMessage ?? 'نعتذر — الطلبات متوقفة مؤقتاً بسبب الضغط، سنعود قريباً',
    });
  } catch {
    return NextResponse.json({ storePaused: false, pauseMessage: '' });
  }
}

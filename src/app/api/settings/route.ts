import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_UNAVAILABLE_LABEL } from '@/lib/alertCode';

// إعدادات عامة للموقع — يقرأها أي زائر
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ['storePaused', 'pauseMessage', 'unavailableLabel', 'lockedAlertCats'] } },
    });
    const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
    return NextResponse.json({
      storePaused: map.storePaused === 'true',
      pauseMessage: map.pauseMessage ?? 'نعتذر — الطلبات متوقفة مؤقتاً بسبب الضغط، سنعود قريباً',
      // نص الشارة اللي بتظهر على المنتج اللي لسه مخلصش — يتغيّر من لوحة الأدمن
      unavailableLabel: map.unavailableLabel || DEFAULT_UNAVAILABLE_LABEL,
      // أقسام الاليرتات المقفولة يدوياً من الأدمن (غير القفل التلقائي لما القسم يبقى فاضي)
      lockedAlertCats: map.lockedAlertCats ? map.lockedAlertCats.split(',').filter(Boolean) : [],
    });
  } catch {
    return NextResponse.json({
      storePaused: false,
      pauseMessage: '',
      unavailableLabel: DEFAULT_UNAVAILABLE_LABEL,
      lockedAlertCats: [],
    });
  }
}

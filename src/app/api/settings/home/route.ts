import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HOME_CONTENT } from '@/lib/homeContent';

// محتوى الصفحة الرئيسية — يقرأه أي زائر
export async function GET() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'homeContent' } });
    if (!row) return NextResponse.json(DEFAULT_HOME_CONTENT);
    const parsed = JSON.parse(row.value);
    // ندمج مع الافتراضي عشان أي حقل ناقص ما يكسرش الصفحة
    return NextResponse.json({ ...DEFAULT_HOME_CONTENT, ...parsed });
  } catch {
    return NextResponse.json(DEFAULT_HOME_CONTENT);
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_DEVELOPER_CONTENT } from '@/lib/developerContent';

// محتوى صفحة المطوّر — يقرأه أي زائر
export async function GET() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'developerContent' } });
    if (!row) return NextResponse.json(DEFAULT_DEVELOPER_CONTENT);
    const parsed = JSON.parse(row.value);
    return NextResponse.json({ ...DEFAULT_DEVELOPER_CONTENT, ...parsed });
  } catch {
    return NextResponse.json(DEFAULT_DEVELOPER_CONTENT);
  }
}

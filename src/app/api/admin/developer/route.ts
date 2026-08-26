import { NextRequest, NextResponse } from 'next/server';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';
import { DEFAULT_DEVELOPER_CONTENT, type DeveloperContent } from '@/lib/developerContent';

export async function GET(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'developerContent' } });
    const parsed = row ? JSON.parse(row.value) : {};
    return NextResponse.json({ ...DEFAULT_DEVELOPER_CONTENT, ...parsed });
  } catch {
    return NextResponse.json(DEFAULT_DEVELOPER_CONTENT);
  }
}

export async function POST(req: NextRequest) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
  const arr = <T,>(v: unknown, d: T[]) => (Array.isArray(v) ? (v as T[]) : d);

  const content: DeveloperContent = {
    heroImage:        str(body.heroImage, DEFAULT_DEVELOPER_CONTENT.heroImage),
    servicesTitle:    str(body.servicesTitle, DEFAULT_DEVELOPER_CONTENT.servicesTitle),
    servicesSubtitle: str(body.servicesSubtitle, DEFAULT_DEVELOPER_CONTENT.servicesSubtitle),
    categories:       arr(body.categories, DEFAULT_DEVELOPER_CONTENT.categories),
    discordTitle:     str(body.discordTitle, DEFAULT_DEVELOPER_CONTENT.discordTitle),
    discordSubtitle:  str(body.discordSubtitle, DEFAULT_DEVELOPER_CONTENT.discordSubtitle),
    discordServices:  arr(body.discordServices, DEFAULT_DEVELOPER_CONTENT.discordServices),
    featuresTitle:    str(body.featuresTitle, DEFAULT_DEVELOPER_CONTENT.featuresTitle),
    features:         arr(body.features, DEFAULT_DEVELOPER_CONTENT.features),
    ctaTitle:         str(body.ctaTitle, DEFAULT_DEVELOPER_CONTENT.ctaTitle),
    ctaSubtitle:      str(body.ctaSubtitle, DEFAULT_DEVELOPER_CONTENT.ctaSubtitle),
    contacts:         arr(body.contacts, DEFAULT_DEVELOPER_CONTENT.contacts),
    orderWhatsapp:    str(body.orderWhatsapp, DEFAULT_DEVELOPER_CONTENT.orderWhatsapp),
  };

  await prisma.siteSetting.upsert({
    where: { key: 'developerContent' },
    update: { value: JSON.stringify(content) },
    create: { key: 'developerContent', value: JSON.stringify(content) },
  });

  return NextResponse.json({ success: true });
}

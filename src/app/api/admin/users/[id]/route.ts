import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isRequestAdmin } from '@/lib/requireAdmin';
import { prisma } from '@/lib/prisma';

// تغيير دور المستخدم (USER / ADMIN)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { role } = await req.json();
  if (role !== 'USER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // امنع الأدمن من إزالة صلاحيته عن نفسه (يقفل نفسه بره)
  const session = await getServerSession(authOptions);
  const myId = (session?.user as { id?: string } | undefined)?.id;
  if (myId === id && role === 'USER') {
    return NextResponse.json({ error: 'لا يمكنك إزالة صلاحية الأدمن عن نفسك' }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ id: user.id, role: user.role });
}

// حذف مستخدم
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isRequestAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const session = await getServerSession(authOptions);
  const myId = (session?.user as { id?: string } | undefined)?.id;
  if (myId === id) {
    return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    // غالباً عنده طلبات مرتبطة تمنع الحذف
    return NextResponse.json({ error: 'لا يمكن حذف مستخدم له طلبات مرتبطة' }, { status: 409 });
  }
}

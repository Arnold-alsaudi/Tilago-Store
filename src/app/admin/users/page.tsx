import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminUsers } from './AdminUsers';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, image: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    });
  } catch {}

  return (
    <AdminUsers
      users={JSON.parse(JSON.stringify(users))}
      currentUserId={(session.user as any)?.id ?? ''}
    />
  );
}

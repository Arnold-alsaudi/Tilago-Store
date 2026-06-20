import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let stats = {
    totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0,
    revenueByMonth: [] as { month: string; revenue: number }[],
    ordersByCategory: [] as { category: string; count: number }[],
  };

  try {
    const [orders, users, products] = await Promise.all([
      prisma.order.findMany({ where: { status: 'PAID' }, include: { items: { include: { product: true } } } }),
      prisma.user.count(),
      prisma.product.count(),
    ]);

    stats.totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    stats.totalOrders = orders.length;
    stats.totalUsers = users;
    stats.totalProducts = products;

    const monthMap: Record<string, number> = {};
    orders.forEach(o => {
      const m = o.createdAt.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap[m] = (monthMap[m] || 0) + o.total;
    });
    stats.revenueByMonth = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));

    const catMap: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => {
      const c = i.product.category;
      catMap[c] = (catMap[c] || 0) + 1;
    }));
    stats.ordersByCategory = Object.entries(catMap).map(([category, count]) => ({ category, count }));
  } catch {}

  return <AdminDashboard stats={stats} />;
}

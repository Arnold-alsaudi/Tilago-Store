import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';
import { prisma } from '@/lib/prisma';
import type { DashboardStats } from '@/types';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let stats: DashboardStats = {
    totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0,
    pendingDelivery: 0, revenueLast30: 0, revenuePrev30: 0,
    revenueByMonth: [], paymentsByMethod: [], recentOrders: [],
  };

  try {
    // الدفع الحقيقي كله في جدول Payment. جدول Order موجود في الـ schema بس
    // مفيش كود بيكتب فيه، فمابنعتمدش عليه في الأرقام.
    const [payments, users, products, recent] = await Promise.all([
      prisma.payment.findMany({ where: { status: 'success' } }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true, productName: true, userName: true, amount: true,
          currency: true, method: true, deliveryStatus: true, createdAt: true,
        },
      }),
    ]);

    stats.totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    stats.totalOrders = payments.length;
    stats.totalUsers = users;
    stats.totalProducts = products;
    stats.pendingDelivery = payments.filter(p => p.deliveryStatus !== 'delivered').length;

    // اتجاه آخر 30 يوم مقابل الـ30 اللي قبلهم
    const now = Date.now();
    const d30 = 30 * 24 * 60 * 60 * 1000;
    for (const p of payments) {
      const age = now - new Date(p.createdAt).getTime();
      if (age <= d30) stats.revenueLast30 += p.amount;
      else if (age <= d30 * 2) stats.revenuePrev30 += p.amount;
    }

    // الإيراد شهرياً — مرتّب زمنياً. كان بيتبني من كائن، والترتيب كان بترتيب أول
    // ظهور مش بالتاريخ، فمحور الرسم كان ممكن يطلع مبعثر.
    const monthMap = new Map<string, { label: string; revenue: number }>();
    for (const p of payments) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('ar-EG', { month: 'short' });
      const cur = monthMap.get(key) ?? { label, revenue: 0 };
      cur.revenue += p.amount;
      monthMap.set(key, cur);
    }
    stats.revenueByMonth = [...monthMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([, v]) => ({ month: v.label, revenue: Math.round(v.revenue) }));

    const methodMap = new Map<string, number>();
    payments.forEach(p => methodMap.set(p.method, (methodMap.get(p.method) ?? 0) + 1));
    stats.paymentsByMethod = [...methodMap.entries()]
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    stats.recentOrders = recent.map(r => ({
      ...r,
      createdAt: new Date(r.createdAt).toISOString(),
    }));
  } catch {}

  return <AdminDashboard stats={stats} />;
}

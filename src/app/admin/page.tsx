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
    paymentsByMethod: [] as { method: string; count: number }[],
  };

  try {
    // مدفوعات Paymob/Fawry الحقيقية في جدول Payment + طلبات Stripe في جدول Order
    const [payments, orders, users, products] = await Promise.all([
      prisma.payment.findMany({ where: { status: 'success' } }),
      prisma.order.findMany({ where: { status: 'PAID' } }),
      prisma.user.count(),
      prisma.product.count(),
    ]);

    const paymentRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const orderRevenue = orders.reduce((s, o) => s + o.total, 0);

    stats.totalRevenue = paymentRevenue + orderRevenue;
    stats.totalOrders = payments.length + orders.length;
    stats.totalUsers = users;
    stats.totalProducts = products;

    // الإيرادات شهرياً — دمج المصدرين
    const monthMap: Record<string, number> = {};
    const addMonth = (date: Date, amount: number) => {
      const m = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap[m] = (monthMap[m] || 0) + amount;
    };
    payments.forEach(p => addMonth(p.createdAt, p.amount));
    orders.forEach(o => addMonth(o.createdAt, o.total));
    stats.revenueByMonth = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));

    // توزيع المدفوعات حسب طريقة الدفع
    const methodMap: Record<string, number> = {};
    payments.forEach(p => { methodMap[p.method] = (methodMap[p.method] || 0) + 1; });
    if (orders.length) methodMap['stripe'] = (methodMap['stripe'] || 0) + orders.length;
    stats.paymentsByMethod = Object.entries(methodMap).map(([method, count]) => ({ method, count }));
  } catch {}

  return <AdminDashboard stats={stats} />;
}

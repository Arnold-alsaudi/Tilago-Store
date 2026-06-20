import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminProducts } from './AdminProducts';

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/');

  let products: any[] = [];
  try { products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }); } catch {}

  return <AdminProducts products={products} />;
}

// لازم تفضل متطابقة مع enums في prisma/schema.prisma
export type Category = 'ALERTS' | 'STREAM' | 'PACKAGE' | 'THREE_D' | 'VIDEO';
export type OrderStatus = 'PENDING' | 'PAID' | 'IN_PROGRESS' | 'DELIVERED' | 'FAILED' | 'REFUNDED';
export type Role = 'USER' | 'ADMIN';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  videoUrl?: string | null;
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export interface RecentOrder {
  id: string;
  productName: string | null;
  userName: string | null;
  userEmail: string;
  userPhone: string | null;
  amount: number;
  currency: string;
  method: string;
  /** حالة الدفع: success | pending | failed | refunded */
  status: string;
  deliveryStatus: string;
  createdAt: string;
}

export interface DashboardStats {
  /** إيراد مؤكد فقط (status=success) — ده الرقم الحقيقي */
  totalRevenue: number;
  /** مبلغ طلبات لسه محتاجة تأكيد وصول الفلوس (PayPal بالذات) */
  awaitingConfirmAmount: number;
  awaitingConfirmCount: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  /** طلبات مدفوعة ولسه متسلّمتش — بيتطلب تصرّف */
  pendingDelivery: number;
  /** إيراد آخر 30 يوم مقارنة بالـ30 اللي قبلهم — للاتجاه */
  revenueLast30: number;
  revenuePrev30: number;
  revenueByMonth: { month: string; revenue: number }[];
  paymentsByMethod: { method: string; count: number }[];
  recentOrders: RecentOrder[];
}

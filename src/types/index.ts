export type Category = 'ALERTS' | 'STREAM' | 'PACKAGE' | 'THREE_D';
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
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

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueByMonth: { month: string; revenue: number }[];
  paymentsByMethod: { method: string; count: number }[];
}

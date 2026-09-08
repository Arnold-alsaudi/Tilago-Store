'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Product } from '@/types';

export interface Customization {
  logoUrl?: string;
  name?: string;
  contact?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  customization?: Customization;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, customization?: Customization) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tilago-cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {
      localStorage.removeItem('tilago-cart');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tilago-cart', JSON.stringify(items));
  }, [items]);

  // كل الدوال دي لازم تبقى ثابتة الهوية (useCallback).
  // من غير كده أي `useEffect` بيعتمد على واحدة منها بيتنفّذ كل رندر — وده اللي كان
  // بيعمل حلقة رندر لا نهائية في صفحة /orders/success (بتنادي clearCart في effect).
  const addItem = useCallback((product: Product, customization?: Customization) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1, customization: customization ?? i.customization }
            : i
        );
      }
      return [...prev, { product, quantity: 1, customization }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(prev =>
      quantity <= 0
        ? prev.filter(i => i.product.id !== productId)
        : prev.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  // لو السلة فاضية أصلاً نرجّع نفس المصفوفة — عشان مانعملش رندر جديد بلا داعي
  const clearCart = useCallback(() => {
    setItems(prev => (prev.length === 0 ? prev : []));
  }, []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, total, count }),
    [items, addItem, removeItem, updateQuantity, clearCart, total, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

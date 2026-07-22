'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function OrderSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}
        className="glass-card p-12 max-w-lg w-full rounded-3xl text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)', boxShadow: '0 0 40px rgba(84,22,181,0.5)' }}>
          <CheckCircle size={40} className="text-white" />
        </motion.div>

        <h1 className="font-orbitron font-bold text-3xl gradient-text mb-3">Order Confirmed!</h1>
        <p className="text-text-muted mb-8">
          Thank you for your purchase. You&apos;ll receive a confirmation email shortly with your order details.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/orders" className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
            View My Orders <ArrowRight size={18} />
          </Link>
          <Link href="/alerts" className="py-3 rounded-xl font-bold text-text-muted border border-accent-deep/30 hover:border-accent-violet transition-colors">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

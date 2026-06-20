'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleStripeCheckout = async () => {
    if (!session) { router.push('/auth/signin'); return; }
    setCheckingOut(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { alert('Checkout failed. Please try again.'); }
    finally { setCheckingOut(false); }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <ShoppingCart size={64} className="text-text-muted mx-auto mb-4" />
          <h2 className="font-orbitron text-2xl font-bold text-text-primary mb-2">Your cart is empty</h2>
          <p className="text-text-muted mb-8">Add some amazing products to get started</p>
          <Link href="/alerts" className="px-6 py-3 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)' }}>
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-orbitron font-bold text-3xl gradient-text">Your Cart</h1>
          <Link href="/alerts" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <AnimatePresence>
              {items.map(({ product, quantity }) => (
                <motion.div key={product.id} layout exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-4 flex gap-4 rounded-xl">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-accent-deep/20">
                    {product.imageUrl && <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="80px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary truncate">{product.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{product.category.replace('_', ' ')}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded-md bg-accent-deep/20 flex items-center justify-center hover:bg-accent-deep/40 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 rounded-md bg-accent-deep/20 flex items-center justify-center hover:bg-accent-deep/40 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold gradient-text">{formatPrice(product.price * quantity)}</span>
                        <button onClick={() => removeItem(product.id)} className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="glass-card p-6 rounded-xl h-fit sticky top-24">
            <h2 className="font-bold text-text-primary mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-text-muted truncate max-w-[160px]">{product.title} ×{quantity}</span>
                  <span className="text-text-primary">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-accent-deep/30 pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span className="text-text-primary">Total</span>
                <span className="gradient-text text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleStripeCheckout} disabled={checkingOut}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)', boxShadow: '0 0 20px rgba(84,22,181,0.3)' }}>
                <CreditCard size={18} /> {checkingOut ? 'Redirecting...' : 'Pay with Stripe'}
              </motion.button>
              <PayPalButton items={items} total={total} session={session} />
            </div>

            <button onClick={clearCart} className="w-full mt-3 text-xs text-text-muted hover:text-red-400 transition-colors">
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayPalButton({ items, total, session }: any) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayPal = async () => {
    if (!session) { router.push('/auth/signin'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/paypal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      const approveLink = data.links?.find((l: any) => l.rel === 'approve');
      if (approveLink) window.location.href = approveLink.href;
    } catch { alert('PayPal checkout failed.'); }
    finally { setLoading(false); }
  };

  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={handlePayPal} disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all disabled:opacity-60"
      style={{ background: '#FFB703', color: '#003087' }}>
      {loading ? 'Connecting...' : '💳 Pay with PayPal'}
    </motion.button>
  );
}

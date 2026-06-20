'use client';

import { motion } from 'framer-motion';
import { User, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { formatPrice, formatDate } from '@/lib/utils';

export function AccountClient({ user, orders }: { user: any; orders: any[] }) {
  const totalSpent = orders.filter(o => o.status === 'PAID').reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 flex items-center gap-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-accent-deep/20 flex-shrink-0">
            {user.image ? (
              <Image src={user.image} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={32} className="text-text-muted" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-2xl text-text-primary">{user.name || 'User'}</h1>
            <p className="text-text-muted text-sm">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(84,22,181,0.2)', color: '#7F3AA1', border: '1px solid rgba(84,22,181,0.3)' }}>
              {user.role}
            </span>
          </div>
          <div className="ml-auto flex gap-6">
            <div className="text-center">
              <p className="font-orbitron font-bold text-xl gradient-text">{orders.length}</p>
              <p className="text-text-muted text-xs">Orders</p>
            </div>
            <div className="text-center">
              <p className="font-orbitron font-bold text-xl gradient-text">{formatPrice(totalSpent)}</p>
              <p className="text-text-muted text-xs">Spent</p>
            </div>
          </div>
        </motion.div>

        {/* Orders */}
        <h2 className="font-orbitron font-bold text-xl text-text-primary mb-4">Order History</h2>
        {orders.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center text-text-muted">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-mono text-text-muted">#{order.id.slice(0, 12).toUpperCase()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-text-muted" />
                      <span className="text-xs text-text-muted">{formatDate(new Date(order.createdAt))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>{order.status}</span>
                    <span className="font-bold gradient-text">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-text-muted">{item.product.title} ×{item.quantity}</span>
                      <span className="text-text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

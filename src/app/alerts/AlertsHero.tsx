'use client';

import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function AlertsHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Fire particle background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? '#F0830B' : '#ff4500',
              boxShadow: `0 0 ${Math.random() * 15 + 5}px ${i % 2 === 0 ? '#F0830B' : '#ff4500'}`,
              animation: `fire ${Math.random() * 2 + 1}s ease-in-out ${Math.random() * 2}s infinite alternate`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Alert preview animation */}
      <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative">
          {/* Alert notification mockup */}
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="notif-slide glass-card px-5 py-4 rounded-2xl w-72"
            style={{ border: '1px solid rgba(240,131,11,0.4)', boxShadow: '0 0 30px rgba(240,131,11,0.2)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0830B] to-[#ff4500] flex items-center justify-center alert-pulse">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">New Subscriber!</p>
                <p className="text-xs text-text-muted">StreamerXYZ just subscribed</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#F0830B] to-[#ff4500]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </motion.div>

          {/* Donation alert */}
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="glass-card px-5 py-4 rounded-2xl w-64 mt-4 ml-8"
            style={{ border: '1px solid rgba(240,131,11,0.3)', boxShadow: '0 0 20px rgba(240,131,11,0.15)' }}
          >
            <p className="text-xs text-[#F0830B] font-bold mb-1">💰 DONATION</p>
            <p className="text-sm text-text-primary font-semibold">viewer123 donated $10!</p>
            <p className="text-xs text-text-muted mt-1">"Keep up the amazing content!"</p>
          </motion.div>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(240,131,11,0.15)', border: '1px solid rgba(240,131,11,0.3)', color: '#F0830B' }}
        >
          <Zap size={14} fill="#F0830B" /> Professional Stream Alerts
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-orbitron font-black text-5xl md:text-7xl leading-tight mb-6 fire-text"
          style={{ textShadow: '0 0 40px rgba(240,131,11,0.4)' }}
        >
          Stream<br />
          <span style={{ color: '#F0E6FF' }}>Alerts</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Professional animated alerts for your stream — donations, follows, subs, raids. Make every notification an event.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            href="#products"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #F0830B, #ff4500)', boxShadow: '0 0 30px rgba(240,131,11,0.4)' }}
          >
            Browse Alerts <ArrowRight size={18} />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all"
            style={{ background: 'rgba(240,131,11,0.1)', border: '1px solid rgba(240,131,11,0.4)', color: '#F0830B' }}
          >
            Custom Design
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

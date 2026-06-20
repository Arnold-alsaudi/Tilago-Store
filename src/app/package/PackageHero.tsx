'use client';

import { motion } from 'framer-motion';
import { Package, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const features = ['Overlays', 'Alerts', 'Panels', 'Transitions', 'Logo', 'Emotes'];

export function PackageHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Holographic background */}
      <div className="absolute inset-0 pointer-events-none holographic opacity-30" />

      {/* 3D perspective card in hero */}
      <motion.div
        initial={{ opacity: 0, rotateY: -30 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden lg:block tilt-card"
        style={{ perspective: '800px' }}
      >
        <div
          className="w-64 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(84,22,181,0.15)', border: '1px solid rgba(84,22,181,0.4)', boxShadow: '0 0 40px rgba(84,22,181,0.3)', backdropFilter: 'blur(16px)' }}
        >
          {/* Holographic shimmer layer */}
          <div className="absolute inset-0 holographic opacity-20 rounded-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-deep to-accent-violet flex items-center justify-center">
                <Package size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">Pro Package</p>
                <p className="text-xs text-text-muted">Everything included</p>
              </div>
            </div>

            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="flex items-center gap-2 py-1.5 border-b border-accent-deep/20 last:border-0"
              >
                <CheckCircle size={12} className="text-highlight flex-shrink-0" fill="#F0830B" />
                <span className="text-xs text-text-muted">{f}</span>
              </motion.div>
            ))}

            <div className="mt-4 pt-3 border-t border-accent-deep/30 flex items-center justify-between">
              <span className="text-text-muted text-xs">From</span>
              <span className="text-xl font-bold gradient-text">$59.99</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(84,22,181,0.15)', border: '1px solid rgba(84,22,181,0.4)', color: '#7F3AA1' }}
        >
          <Package size={14} /> Complete Bundle Solutions
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-orbitron font-black text-5xl md:text-7xl leading-tight mb-6 gradient-text"
          style={{ filter: 'drop-shadow(0 0 30px rgba(84,22,181,0.5))' }}
        >
          Full<br />Packages
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Everything you need in one bundle — overlays, alerts, panels, and more. Save up to 40% vs buying separately.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link href="#products" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #5416B5, #7F3AA1)', boxShadow: '0 0 30px rgba(84,22,181,0.4)' }}>
            View Packages <ArrowRight size={18} />
          </Link>
          <Link href="/alerts" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(84,22,181,0.1)', border: '1px solid rgba(84,22,181,0.4)', color: '#7F3AA1' }}>
            Browse À La Carte
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

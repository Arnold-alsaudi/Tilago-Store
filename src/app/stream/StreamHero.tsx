'use client';

import { motion } from 'framer-motion';
import { Radio, ArrowRight, Tv } from 'lucide-react';
import Link from 'next/link';

export function StreamHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Animated wave background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="wave-bg absolute bottom-0 left-0 w-[200%] opacity-20"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: '100%' }}
        >
          <path fill="#7F3AA1" d="M0,160L60,170.7C120,181,240,203,360,192C480,181,600,139,720,128C840,117,960,139,1080,160C1200,181,1320,203,1380,213.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"/>
          <path fill="#5416B5" opacity="0.6" d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,218.7C840,224,960,192,1080,181.3C1200,171,1320,181,1380,186.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"/>
        </svg>

        {/* Waveform lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${20 + i * 10}%`,
              background: `rgba(127,58,161,${0.05 + i * 0.03})`,
            }}
            animate={{ scaleX: [1, 1.05, 0.98, 1], opacity: [0.3, 0.7, 0.4, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Floating TV/Monitor mockup */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 hidden lg:block animate-float"
      >
        <div
          className="w-64 h-48 rounded-2xl relative overflow-hidden"
          style={{ background: '#050209', border: '2px solid rgba(127,58,161,0.5)', boxShadow: '0 0 40px rgba(127,58,161,0.3)' }}
        >
          {/* Screen content */}
          <div className="absolute inset-0 p-3">
            <div className="h-full rounded-xl overflow-hidden relative bg-gradient-to-br from-[#0d0520] to-[#1a0a35]">
              {/* Overlay elements */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] text-white font-bold">LIVE</span>
                </div>
                <div className="text-[8px] text-text-muted">1,234 viewers</div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="h-1 rounded-full bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] opacity-60 mb-1" />
                <div className="flex justify-between">
                  <div className="text-[7px] text-text-muted">StreamerName</div>
                  <div className="text-[7px] text-[#7F3AA1]">Following</div>
                </div>
              </div>
              {/* Animated webcam border */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
                style={{ border: '2px solid #7F3AA1' }}
                animate={{ boxShadow: ['0 0 5px #7F3AA1', '0 0 20px #7F3AA1', '0 0 5px #7F3AA1'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
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
          style={{ background: 'rgba(127,58,161,0.15)', border: '1px solid rgba(127,58,161,0.3)', color: '#7F3AA1' }}
        >
          <Radio size={14} /> Live Stream Overlays
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-orbitron font-black text-5xl md:text-7xl leading-tight mb-6"
        >
          <span className="gradient-text">Stream</span>
          <br />
          <span className="text-text-primary">Overlays</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Complete overlay packages for Twitch, YouTube, and Kick streamers. Professional, animated, and fully customizable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link href="#products" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7F3AA1, #5416B5)', boxShadow: '0 0 30px rgba(127,58,161,0.4)' }}>
            Browse Overlays <ArrowRight size={18} />
          </Link>
          <Link href="/package" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(127,58,161,0.1)', border: '1px solid rgba(127,58,161,0.4)', color: '#7F3AA1' }}>
            <Tv size={18} /> Full Packages
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function ThreeDHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 500], [0, -80]);
  const y2 = useTransform(scrollY, [0, 500], [0, -140]);
  const y3 = useTransform(scrollY, [0, 500], [0, -200]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

      {/* Parallax layer 1 — deep stars */}
      <motion.div style={{ y: y1 }} className="absolute inset-0 pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 0.5}px`, height: `${Math.random() * 2 + 0.5}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
            }}
          />
        ))}
      </motion.div>

      {/* Parallax layer 2 — nebula clouds */}
      <motion.div style={{ y: y2 }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #7F3AA1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #F0830B, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(ellipse, #5416B5, transparent)' }} />
      </motion.div>

      {/* Parallax layer 3 — grid */}
      <motion.div style={{ y: y3 }} className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(84,22,181,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(84,22,181,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      {/* Floating 3D shape */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute right-8 md:right-20 top-1/2 -translate-y-1/2 hidden lg:block"
      >
        {/* CSS 3D Cube */}
        <div style={{ perspective: '600px', width: '120px', height: '120px' }}>
          <div className="float-rotate w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
            {[
              { transform: 'translateZ(60px)', bg: 'rgba(84,22,181,0.5)' },
              { transform: 'translateZ(-60px) rotateY(180deg)', bg: 'rgba(127,58,161,0.5)' },
              { transform: 'translateX(60px) rotateY(90deg)', bg: 'rgba(84,22,181,0.3)' },
              { transform: 'translateX(-60px) rotateY(-90deg)', bg: 'rgba(240,131,11,0.3)' },
              { transform: 'translateY(-60px) rotateX(90deg)', bg: 'rgba(127,58,161,0.4)' },
              { transform: 'translateY(60px) rotateX(-90deg)', bg: 'rgba(240,131,11,0.4)' },
            ].map((face, i) => (
              <div key={i} className="absolute inset-0 border"
                style={{
                  transform: face.transform,
                  background: face.bg,
                  borderColor: 'rgba(127,58,161,0.6)',
                  backdropFilter: 'blur(4px)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Orbit ring */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border pointer-events-none"
          style={{ borderColor: 'rgba(127,58,161,0.3)', borderStyle: 'dashed' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F0830B]"
            style={{ boxShadow: '0 0 10px #F0830B' }} />
        </motion.div>
      </motion.div>

      {/* Hero content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(127,58,161,0.15)', border: '1px solid rgba(127,58,161,0.4)', color: '#7F3AA1' }}
        >
          <Sparkles size={14} /> Hyper-Realistic 3D Animations
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-orbitron font-black text-5xl md:text-8xl leading-tight mb-6"
        >
          <span className="text-3d" style={{ color: '#F0E6FF' }}>3D</span>
          <br />
          <span className="gradient-text">Motion</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Hyper-realistic 3D animations and motion graphics for your brand. From logo reveals to full cinematic productions.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-8 mb-10"
        >
          {[['4K', 'Resolution'], ['60fps', 'Smooth'], ['48h', 'Delivery']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-orbitron font-bold text-2xl gradient-text">{val}</p>
              <p className="text-text-muted text-xs uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link href="#products" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7F3AA1, #F0830B)', boxShadow: '0 0 30px rgba(127,58,161,0.5)' }}>
            Explore 3D Work <ArrowRight size={18} />
          </Link>
          <Link href="/contact" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(127,58,161,0.1)', border: '1px solid rgba(127,58,161,0.4)', color: '#7F3AA1' }}>
            <Layers size={18} /> Commission Custom
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

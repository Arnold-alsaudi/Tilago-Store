'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CTABannerProps {
  title: string;
  description: string;
  accentColor?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CTABanner({ title, description, accentColor = '#5416B5', ctaLabel, ctaHref, secondaryLabel, secondaryHref }: CTABannerProps) {
  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto cta-banner rounded-3xl p-12 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(84,22,181,0.15), rgba(${accentColor === '#F0830B' ? '240,131,11' : '127,58,161'},0.15))`,
          border: `1px solid ${accentColor}40`,
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${accentColor}20` }}
        />

        <div className="relative z-10">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl text-text-primary mb-4">{title}</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto mb-8">{description}</p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={ctaHref}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #7F3AA1)`, boxShadow: `0 0 25px ${accentColor}50` }}
            >
              {ctaLabel} <ArrowRight size={18} />
            </Link>
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40`, color: accentColor }}
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

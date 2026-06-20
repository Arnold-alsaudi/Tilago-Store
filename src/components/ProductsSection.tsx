'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  accentColor?: string;
}

export function ProductsSection({ title, subtitle, products, accentColor = '#5416B5' }: ProductsSectionProps) {
  return (
    <section id="products" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="section-title font-orbitron font-bold text-3xl md:text-4xl text-text-primary mb-3">
            {title}
          </h2>
          {subtitle && <p className="text-text-muted text-lg">{subtitle}</p>}
        </motion.div>

        <div className="flex flex-col gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              accentColor={accentColor}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

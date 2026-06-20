'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, ShoppingCart, Star, Eye, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
  accentColor?: string;
}

export function ProductCard({ product, index = 0, accentColor = '#5416B5' }: ProductCardProps) {
  const { addItem } = useCart();
  const [hovering, setHovering] = useState(false);
  const [added, setAdded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setHovering(true);
    if (videoRef.current && product.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 flex flex-col md:flex-row gap-6 max-w-3xl w-full mx-auto cursor-default group"
      style={{ '--accent': accentColor } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* LEFT: Media */}
      <div className="relative w-full md:w-[45%] aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-black/30">
        {product.videoUrl && (
          <video
            ref={videoRef}
            src={product.videoUrl}
            muted
            loop
            playsInline
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              hovering ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              hovering && product.videoUrl ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        )}

        {/* Play button overlay */}
        {product.videoUrl && !hovering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="play-overlay w-12 h-12 rounded-full flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-[#F0830B] to-[#ff6b35] text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <Star size={10} fill="white" /> Featured
          </div>
        )}
      </div>

      {/* RIGHT: Info */}
      <div className="flex flex-col justify-between flex-1 gap-3">
        <div>
          {/* Category chip */}
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}50` }}
          >
            <Tag size={10} />
            {product.category.replace('_', ' ')}
          </span>

          <h3 className="text-lg font-bold text-text-primary mb-2 leading-tight">{product.title}</h3>
          <p className="text-text-muted text-sm leading-relaxed line-clamp-3">{product.description}</p>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {product.tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-accent-deep/20 text-text-muted border border-accent-deep/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-2xl font-bold gradient-text">{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-muted border border-accent-deep/30 hover:bg-accent-deep/10 transition-all"
              title="Preview"
            >
              <Eye size={15} />
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                added
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-white shadow-[0_0_12px_rgba(84,22,181,0.4)] hover:shadow-[0_0_20px_rgba(84,22,181,0.6)]'
              )}
              style={!added ? { background: `linear-gradient(135deg, ${accentColor}, #7F3AA1)` } : {}}
            >
              <ShoppingCart size={15} />
              {added ? 'Added!' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

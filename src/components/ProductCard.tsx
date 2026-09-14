'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Sparkles, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, items } = useCart();
  const activePrice = product.discount_price ?? product.price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discount_price as number)) / product.price) * 100)
    : 0;

  const isInCart = items.some(item => item.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div className="card-stitch group flex flex-col justify-between relative overflow-hidden h-full">
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-2 z-10">
        {hasDiscount ? (
          <span className="bg-secondary text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
            خصم {discountPercent}%
          </span>
        ) : product.is_featured ? (
          <span className="bg-primary/10 text-primary text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-secondary" />
            <span>مميز</span>
          </span>
        ) : (
          <span className="bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {product.concentration || 'Eau De Parfum'}
          </span>
        )}

        <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">
          <Star className="w-3 h-3 text-secondary fill-secondary" />
          <span>{product.rating || 4.9}</span>
        </div>
      </div>

      {/* Bottle Image with Radial Stage */}
      <Link href={`/products/${product.slug}`} className="relative block my-3 flex-1">
        <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-surface-container-high/60 via-surface-container-low to-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-surface-container-high/80 transition-all duration-300">
          {/* Subtle Glow Behind Bottle */}
          <div className="absolute w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 z-10"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="pt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-primary font-bold">
          <span>{product.category_name || product.brand}</span>
          <span className="text-on-surface-variant font-normal text-[11px]">{product.size || '100ml'}</span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-base text-on-surface hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Fragrance Top Notes Pills */}
        {product.fragrance_notes?.top?.length > 0 && (
          <p className="text-[11px] text-on-surface-variant line-clamp-1">
            النوتات: {product.fragrance_notes.top.slice(0, 2).join(' • ')}
          </p>
        )}

        {/* Pricing & Add to Cart Button */}
        <div className="pt-2 border-t border-primary/5 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-primary">
                {activePrice.toLocaleString('ar-DZ')}
              </span>
              <span className="text-xs font-bold text-on-surface-variant">دج</span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-outline line-through -mt-1">
                {product.price.toLocaleString('ar-DZ')} دج
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            aria-label={`أضف ${product.name} إلى السلة`}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
              isInCart
                ? 'bg-secondary text-white hover:bg-secondary-container'
                : 'bg-primary text-white hover:bg-primary-container hover:shadow-primary/30'
            }`}
          >
            {isInCart ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

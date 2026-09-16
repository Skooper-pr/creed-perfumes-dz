'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [isJustAdded, setIsJustAdded] = React.useState(false);
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const activePrice = product.discount_price ?? product.price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discount_price as number)) / product.price) * 100)
    : 0;

  const isInCart = items.some((item) => item.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 700);
  };

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    router.push('/checkout');
  };

  return (
    <div
      className={`group bg-white rounded-2xl border border-[#E5E0D5] p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-luxury hover:border-[#D5CEBF] relative ${
        isOutOfStock ? 'opacity-80' : ''
      }`}
    >
      {/* Top Meta & Badges */}
      <div className="flex items-center justify-between gap-1 mb-2 z-10 min-h-[22px]">
        {isOutOfStock ? (
          <span className="bg-[#151515] text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            نفذت الكمية
          </span>
        ) : hasDiscount ? (
          <span className="bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] text-[10px] font-semibold px-2 py-0.5 rounded-full">
            خصم {discountPercent}%
          </span>
        ) : (
          <span className="text-[10px] tracking-wider text-[#77736B] uppercase font-medium">
            {product.concentration || 'Eau De Parfum'}
          </span>
        )}
        <span className="text-[10px] text-[#77736B]">{product.size || '100ml'}</span>
      </div>

      {/* Visual Hero: Clean Product Stage with subtle scale */}
      <Link href={`/products/${product.slug}`} className="relative block my-1 flex-1">
        <div className="w-full aspect-square rounded-xl bg-[#FAF8F5] flex items-center justify-center p-3 relative overflow-hidden transition-colors group-hover:bg-[#F3EFE6]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 280px"
            className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="bg-white border border-[#E5E0D5] text-[#151515] font-semibold text-[11px] px-3 py-1 rounded-full shadow-sm">
                غير متوفر حالياً
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="pt-2.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-[#77736B]">
          <span className="text-[11px] tracking-wide uppercase font-medium">
            {product.category_name || product.brand}
          </span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-sm sm:text-base text-[#151515] group-hover:text-[#6E603F] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Pricing & Secondary Add to Cart Action */}
        <div className="pt-2 border-t border-[#E5E0D5]/70 flex items-center justify-between gap-2 mt-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-bold text-[#151515] tracking-tight">
                {activePrice.toLocaleString('ar-DZ')}
              </span>
              <span className="text-xs text-[#77736B] font-medium">دج</span>
            </div>
            {hasDiscount && (
              <span className="text-[11px] text-[#B8B2A6] line-through -mt-1">
                {product.price.toLocaleString('ar-DZ')} دج
              </span>
            )}
          </div>

          {isOutOfStock ? (
            <span className="text-[10px] text-[#B8B2A6] font-medium px-2 py-1 rounded-full bg-[#FAF8F5] border border-[#E5E0D5]">
              نفذ
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`إضافة ${product.name} إلى السلة`}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border ${
                isJustAdded
                  ? 'bg-[#151515] border-[#151515] text-white scale-105'
                  : isInCart
                  ? 'bg-[#FAF8F5] border-[#151515] text-[#151515]'
                  : 'border-[#E5E0D5] bg-white text-[#151515] hover:bg-[#151515] hover:text-white hover:border-[#151515]'
              }`}
            >
              {isJustAdded || isInCart ? (
                <Check className="w-4 h-4 stroke-[2]" />
              ) : (
                <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>
          )}
        </div>

        {/* Primary Conversion Action: Direct Buy ("اطلب الآن") */}
        <div className="mt-2.5">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#FAF8F5] text-[#A8A39A] border border-[#E5E0D5] text-xs font-semibold flex items-center justify-center cursor-not-allowed select-none"
              aria-label={`${product.name} غير متوفر`}
            >
              غير متوفر
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDirectBuy}
              aria-label={`اطلب الآن ${product.name}`}
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#151515] text-white border border-[#151515] text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-[#2c2c2c] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#151515] focus:ring-offset-1 select-none shadow-sm cursor-pointer"
            >
              <span>اطلب الآن</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Gift, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { Bundle, Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface BundleCardProps {
  bundle: Bundle;
  products: Product[];
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, products }) => {
  const { addItem } = useCart();
  const [isJustAdded, setIsJustAdded] = useState(false);

  // Identify included child products
  const childProducts = products.filter((p) => bundle.product_ids.includes(p.id));
  const childNames = childProducts.map((p) => p.name);
  
  // Calculate availability (stock of all child items must be > 0)
  const minStock = childProducts.length > 0 
    ? Math.min(...childProducts.map((p) => p.stock ?? 0))
    : 10;
  const isOutOfStock = minStock <= 0;

  const totalRegular = bundle.price;
  const offerPrice = bundle.discount_price;
  const diff = totalRegular - offerPrice;

  const handleAddBundle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const bundleAsProduct: Product = {
      id: bundle.id,
      name: `${bundle.name} (${childNames.join(' + ')})`,
      slug: bundle.slug,
      description: bundle.description,
      price: bundle.price,
      discount_price: bundle.discount_price,
      images: [bundle.image || (childProducts[0]?.images[0] ?? '')],
      category_id: 'cat-bundle',
      category_name: bundle.badge_label || 'مجموعة خاصة',
      brand: 'Creed Collection',
      stock: minStock,
      is_featured: true,
      fragrance_notes: { top: [], heart: [], base: [] },
      concentration: 'طقم هدايا ملكي',
      size: `${childProducts.length} عطور فاخرة`,
      is_bundle: true,
      bundle_product_ids: bundle.product_ids,
      bundle_badge: bundle.badge_label,
      created_at: bundle.created_at,
    };

    addItem(bundleAsProduct, 1);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 800);
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between relative group ${
        isOutOfStock
          ? 'border-[#E5E0D5] opacity-75'
          : 'border-[#E5E0D5] hover:border-[#B89B5E]/60 hover:shadow-luxury'
      }`}
    >
      <div>
        {/* Top Header: Luxury Badge & Savings */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#B89B5E]" />
            <span>{bundle.badge_label || 'مجموعة خاصة'}</span>
          </span>

          {diff > 0 && !isOutOfStock && (
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              توفير {diff.toLocaleString('ar-DZ')} دج
            </span>
          )}
        </div>

        {/* Visual Showcase: Bottle Cluster or Main Image */}
        <div className="w-full aspect-[16/10] rounded-xl bg-[#FAF8F5] p-3 flex items-center justify-center relative overflow-hidden mb-4 group-hover:bg-[#F3EFE6] transition-colors">
          {bundle.image ? (
            <Image
              src={bundle.image}
              alt={bundle.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex items-center justify-center gap-2">
              {childProducts.slice(0, 3).map((cp) => (
                <div key={cp.id} className="w-20 h-20 relative">
                  {cp.images?.[0] && (
                    <Image
                      src={cp.images[0]}
                      alt={cp.name}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-white border border-[#E5E0D5] text-[#151515] font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm">
                نفذت كمية أحد العطور المشمولة
              </span>
            </div>
          )}
        </div>

        {/* Bundle Info */}
        <h3 className="font-bold text-base sm:text-lg text-[#151515] mb-1.5 group-hover:text-[#6E603F] transition-colors">
          {bundle.name}
        </h3>
        <p className="text-xs text-[#77736B] leading-relaxed line-clamp-2 mb-4">
          {bundle.description || 'طقم هدايا استثنائي يجمع بين أبرز إبداعات دار كريد في صندوق واحد فاخر.'}
        </p>

        {/* Included Child Products Chips */}
        <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E5E0D5]/70 mb-4 space-y-1.5">
          <span className="text-[10px] font-semibold text-[#6E603F] tracking-wide uppercase block">
            العطور المتضمنة في هذا الطقم:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {childProducts.map((p) => (
              <span
                key={p.id}
                className="bg-white border border-[#E5E0D5] text-[#151515] text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-2xs"
              >
                ✓ {p.name} ({p.size || '100ml'})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing and Add-To-Cart Action */}
      <div className="pt-3 border-t border-[#E5E0D5]/80 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#77736B]">السعر الإجمالي للطقم:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-[#151515]">
              {offerPrice.toLocaleString('ar-DZ')}
            </span>
            <span className="text-xs font-medium text-[#77736B]">دج</span>
            {diff > 0 && (
              <span className="text-xs text-[#B8B2A6] line-through mr-1.5">
                {totalRegular.toLocaleString('ar-DZ')} دج
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddBundle}
          disabled={isOutOfStock}
          className={`btn-luxury-primary text-xs px-5 py-2.5 flex items-center gap-1.5 shrink-0 ${
            isJustAdded ? '!bg-emerald-700 !border-emerald-700' : ''
          } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isJustAdded ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>تمت الإضافة</span>
            </>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              <span>إضافة المجموعة إلى السلة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

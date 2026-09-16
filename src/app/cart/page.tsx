'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();
  const hasOutOfStockItem = items.some((item) => (item.product.stock ?? 0) <= 0);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white border border-[#E5E0D5] mx-auto flex items-center justify-center text-[#6E603F]">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515]">سلة المشتريات فارغة</h1>
          <p className="text-xs sm:text-sm text-[#77736B] max-w-md mx-auto leading-relaxed">
            لم تقم بإضافة أي عطور إلى سلتك بعد. استكشف تشكيلة دار Creed المختارة واختر العطر الأنسب لذوقك.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/products" className="btn-luxury-primary text-xs sm:text-sm px-8 py-3.5 inline-flex items-center gap-2">
            <span>تصفح تشكيلة العطور</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] flex items-center gap-2">
            <span>سلة المشتريات</span>
            <span className="text-xs font-semibold bg-[#FAF8F5] text-[#151515] border border-[#E5E0D5] px-3 py-1 rounded-full">
              {totalItems} {totalItems === 1 ? 'عطر' : 'عطور'}
            </span>
          </h1>
          <p className="text-xs text-[#77736B] mt-1">
            راجع العطور المختارة قبل المتابعة لتأكيد عنوان التوصيل والدفع نقدًا عند الاستلام
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-[#77736B] hover:text-red-700 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تفريغ السلة</span>
        </button>
      </div>

      {/* Two Column Layout: Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN in RTL: Cart Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {items.map(({ product, quantity }) => {
            const activePrice = product.discount_price ?? product.price;
            const isItemOutOfStock = (product.stock ?? 0) <= 0;
            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border border-[#E5E0D5] p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
                  isItemOutOfStock ? 'border-red-300 bg-red-50/10' : ''
                }`}
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#FAF8F5] p-2 shrink-0 flex items-center justify-center border border-[#E5E0D5] relative overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className={`object-contain p-1 ${isItemOutOfStock ? 'grayscale-[50%]' : ''}`}
                    />
                    {isItemOutOfStock && (
                      <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] font-bold text-red-600">
                        نفذ
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#77736B] uppercase font-medium">
                        {product.brand} • {product.concentration || 'Eau De Parfum'}
                      </span>
                      {isItemOutOfStock && (
                        <span className="text-[9px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          غير متوفر
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-base text-[#151515] hover:text-[#6E603F] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm font-bold text-[#151515]">
                        {activePrice.toLocaleString('ar-DZ')} دج
                      </span>
                      {product.discount_price && (
                        <span className="text-xs text-[#B8B2A6] line-through mr-1">
                          {product.price.toLocaleString('ar-DZ')} دج
                        </span>
                      )}
                    </div>
                    {isItemOutOfStock && (
                      <p className="text-[11px] text-red-600 mt-1">
                        غير متوفر حالياً. يرجى حذفه لإكمال الطلب.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E0D5]/70">
                  <div className="flex items-center bg-[#FAF8F5] rounded-full p-1 border border-[#E5E0D5]">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#151515] hover:bg-[#EFECE4] transition-colors shadow-xs"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#151515] select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= (product.stock ?? 10)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#151515] hover:bg-[#EFECE4] transition-colors shadow-xs disabled:opacity-35 disabled:cursor-not-allowed"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-left min-w-[90px]">
                    <span className="text-sm font-bold text-[#151515] block">
                      {(activePrice * quantity).toLocaleString('ar-DZ')} دج
                    </span>
                    {product.stock && quantity >= product.stock && (
                      <span className="text-[10px] text-[#6E603F] block">
                        الحد الأقصى ({product.stock})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-2 text-[#77736B] hover:text-red-700 transition-colors"
                    aria-label="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* LEFT COLUMN in RTL: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E0D5] p-5 sm:p-6 space-y-5 sticky top-24">
          <h2 className="text-base font-bold text-[#151515] border-b border-[#E5E0D5] pb-3">
            ملخص الطلبية (الدفع عند الاستلام)
          </h2>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-[#77736B]">
              <span>مجموع المنتجات ({totalItems} قطع)</span>
              <span className="font-semibold text-[#151515]">{subtotal.toLocaleString('ar-DZ')} دج</span>
            </div>

            <div className="flex items-center justify-between text-[#77736B]">
              <span>رسوم التوصيل</span>
              <span className="text-xs text-[#6E603F] font-medium">تحسب بدقة حسب الولاية في الخطوة التالية</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] text-xs text-[#151515] flex items-center gap-2 border border-[#E5E0D5]/70">
              <Truck className="w-4 h-4 text-[#6E603F] shrink-0" />
              <span>الدفع نقدًا عند استلام الطرد ومعاينته</span>
            </div>
          </div>

          <div className="border-t border-[#E5E0D5] pt-4 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-[#151515]">المجموع الفرعي</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#151515]">
                {subtotal.toLocaleString('ar-DZ')}
              </span>
              <span className="text-xs text-[#77736B] font-medium">دج</span>
            </div>
          </div>

          {hasOutOfStockItem ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                يوجد منتج نفذت كميته في سلتك. يرجى حذفه للمتابعة.
              </div>
              <button
                disabled
                className="w-full py-3.5 text-xs sm:text-sm font-medium rounded-full bg-neutral-200 text-neutral-400 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>متابعة إتمام الطلب (غير متاح)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/checkout"
              className="btn-luxury-primary w-full py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span>متابعة إتمام الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}

          <div className="space-y-1.5 pt-2 border-t border-[#E5E0D5]/60 text-[11px] text-[#77736B]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6E603F]" />
              <span>طلب مباشر وسريع بدون إنشاء حساب</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6E603F]" />
              <span>اتصال هاتفي مسبق لتأكيد العنوان وموعد التسليم</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

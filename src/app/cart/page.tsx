'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-surface-container mx-auto flex items-center justify-center text-primary shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">سلة المشتريات فارغة</h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            لم تقم بإضافة أي عطور إلى حقيبتك بعد. اكتشف تشكيلتنا الملكية الحصرية واختر العطر الذي يعبر عن فخامتك.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/products" className="btn-pill-primary text-sm shadow-stitch-glow">
            <span>تصفح تشكيلة العطور الملكية</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2">
            <span>سلة المشتريات</span>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
              {totalItems} {totalItems === 1 ? 'عطر' : 'عطور'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            راجع العطور المختارة قبل تأكيد معلومات التوصيل والدفع عند الاستلام
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-outline hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تفريغ السلة</span>
        </button>
      </div>

      {/* Two Column Layout: Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN in RTL: Cart Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ product, quantity }) => {
            const activePrice = product.discount_price ?? product.price;
            return (
              <div
                key={product.id}
                className="card-stitch flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5"
              >
                {/* Thumbnail & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface-container-low p-2 shrink-0 flex items-center justify-center border border-primary/5">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-secondary uppercase">
                      {product.brand} • {product.concentration || 'Eau De Parfum'}
                    </span>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-base text-on-surface hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-black text-primary">
                        {activePrice.toLocaleString('ar-DZ')} دج
                      </span>
                      {product.discount_price && (
                        <span className="text-xs text-outline line-through mr-1">
                          {product.price.toLocaleString('ar-DZ')} دج
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-primary/5">
                  <div className="flex items-center bg-surface-container rounded-full p-1 border border-primary/10">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-on-surface hover:text-primary shadow-sm"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-on-surface">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-on-surface hover:text-primary shadow-sm"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-left min-w-[90px]">
                    <span className="text-sm font-black text-on-surface block">
                      {(activePrice * quantity).toLocaleString('ar-DZ')} دج
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-8 h-8 rounded-full text-outline hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                    aria-label="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* LEFT COLUMN in RTL: Summary Box (4 Cols) */}
        <div className="lg:col-span-4 card-stitch space-y-6 sticky top-24">
          <h2 className="text-lg font-extrabold text-on-surface border-b border-primary/10 pb-3">
            ملخص الطلبية (COD)
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>مجموع المنتجات ({totalItems} قطع)</span>
              <span className="font-bold text-on-surface">{subtotal.toLocaleString('ar-DZ')} دج</span>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant">
              <span>رسوم التوصيل المقدرة</span>
              <span className="font-semibold text-primary">تحدد حسب الولاية (400 - 800 دج)</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container text-xs font-semibold text-primary flex items-center gap-2">
              <Truck className="w-4 h-4 text-secondary shrink-0" />
              <span>الدفع نقداً عند استلام طلبيتك وفحصها</span>
            </div>
          </div>

          <div className="border-t border-primary/10 pt-4 flex items-baseline justify-between">
            <span className="text-base font-extrabold text-on-surface">الإجمالي المؤقت</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-primary">
                {subtotal.toLocaleString('ar-DZ')}
              </span>
              <span className="text-xs font-bold text-on-surface-variant">دج</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="btn-pill-secondary w-full py-4 text-sm font-extrabold shadow-stitch-coral flex items-center justify-center gap-2"
          >
            <span>متابعة إتمام الطلب (الدفع عند الاستلام)</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="space-y-2 pt-2 border-t border-primary/5 text-[11px] text-on-surface-variant">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>لا يتطلب أي بطاقة بنكية أو إنشاء حساب</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>سيتم الاتصال بك هاتفياً لتأكيد العنوان وموعد التسليم</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

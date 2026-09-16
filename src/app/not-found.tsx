'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl border border-[#E5E0D5] max-w-md w-full text-center p-8 sm:p-10 space-y-6 shadow-sm">
        
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FAF8F5] border border-[#E5E0D5] flex items-center justify-center text-[#151515] text-3xl font-bold font-serif">
          404
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
            الصفحة غير متوفرة
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#151515]">
            لم نتمكن من العثور على هذه الصفحة
          </h1>
          <p className="text-xs text-[#77736B] leading-relaxed">
            قد يكون الرابط غير صحيح أو تم تحديث الصفحة. يمكنك العودة لصفحة البوتيك الرئيسية واستكشاف تشكيلة العطور الملكية.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="btn-luxury-primary w-full sm:w-auto text-xs py-3 px-6 flex items-center justify-center gap-2">
            <Home className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </Link>
          <Link href="/products" className="btn-luxury-outline w-full sm:w-auto text-xs py-3 px-6 flex items-center justify-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>تصفح كل العطور</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

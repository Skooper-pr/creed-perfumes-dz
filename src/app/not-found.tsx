'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="card-stitch max-w-lg w-full text-center p-8 sm:p-12 space-y-6 shadow-stitch">
        
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-primary text-4xl font-black font-serif shadow-inner">
            404
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>الصفحة غير موجودة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
            يبدو أنك سلكت مساراً عطرياً خاطئاً!
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            الصفحة التي تبحث عنها قد تم نقلها أو لم تعد متوفرة. يمكنك العودة للصفحة الرئيسية واستكشاف تشكيلة عطور Creed الملكية.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="btn-pill-primary w-full sm:w-auto text-xs py-3 px-6 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
          <Link href="/products" className="btn-pill-outline w-full sm:w-auto text-xs py-3 px-6 flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span>تصفح كل العطور</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

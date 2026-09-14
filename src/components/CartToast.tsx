'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartToast: React.FC = () => {
  const { toastMessage, hideToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 w-[90%] max-w-md">
      <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-primary/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-snug">{toastMessage}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/cart"
            onClick={hideToast}
            className="px-3 py-1.5 rounded-full bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-colors flex items-center gap-1 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>السلة</span>
          </Link>
          <button
            onClick={hideToast}
            className="text-white/60 hover:text-white p-1 rounded-full"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

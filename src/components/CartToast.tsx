'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartToast: React.FC = () => {
  const { toastMessage, hideToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-6 duration-300 w-[92%] max-w-md">
      <div className="bg-inverse-surface/95 text-inverse-on-surface p-4 rounded-2xl shadow-[0_20px_50px_rgba(84,31,145,0.35)] flex items-center justify-between gap-3 border border-primary/30 backdrop-blur-xl relative overflow-hidden">
        
        {/* Animated countdown line showing remaining display time */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-secondary via-secondary-container to-primary animate-countdown" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-secondary to-secondary-container text-white flex items-center justify-center shrink-0 shadow-stitch-coral animate-badge-pop">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold leading-snug">{toastMessage}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Link
            href="/cart"
            onClick={hideToast}
            className="px-3.5 py-1.5 rounded-full bg-secondary text-white text-xs font-bold hover:bg-secondary-container hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-stitch-coral shimmer-container"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>عرض السلة</span>
          </Link>
          <button
            onClick={hideToast}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors active:scale-90"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

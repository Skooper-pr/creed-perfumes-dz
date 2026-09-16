'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartToast: React.FC = () => {
  const { toastMessage, hideToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[92%] max-w-md">
      <div className="bg-[#151515] text-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-[#2E2E2E] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#242424] text-[#B89B5E] flex items-center justify-center shrink-0 border border-[#2E2E2E]">
            <Check className="w-4 h-4 stroke-[2]" />
          </div>
          <p className="text-xs sm:text-sm font-medium leading-snug">{toastMessage}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/cart"
            onClick={hideToast}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#151515] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>السلة</span>
          </Link>
          <button
            onClick={hideToast}
            className="text-[#77736B] hover:text-white p-1.5 rounded-full transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

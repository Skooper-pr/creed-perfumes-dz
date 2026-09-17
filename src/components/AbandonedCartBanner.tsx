'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ArrowLeft, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function AbandonedCartBanner() {
  const pathname = usePathname();
  const { totalItems, subtotal } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hide if no items or already in purchase flow / admin
    if (totalItems <= 0) {
      setVisible(false);
      return;
    }

    if (
      pathname.startsWith('/admin') ||
      pathname === '/checkout' ||
      pathname === '/cart' ||
      pathname === '/order-confirmed'
    ) {
      setVisible(false);
      return;
    }

    const dismissed = sessionStorage.getItem('creed_cart_nudge_dismissed');
    if (dismissed) {
      setVisible(false);
      return;
    }

    // Check last interaction timestamp
    const lastInteraction = localStorage.getItem('creed_cart_last_interaction');
    if (lastInteraction) {
      const elapsedMinutes = (Date.now() - parseInt(lastInteraction, 10)) / (1000 * 60);
      // If user has been idle for >= 15 min or returning to site
      if (elapsedMinutes >= 15) {
        setVisible(true);
      }
    } else {
      // First visit after adding to cart
      const timer = setTimeout(() => {
        setVisible(true);
      }, 20000); // show after 20s if still browsing
      return () => clearTimeout(timer);
    }
  }, [pathname, totalItems]);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('creed_cart_nudge_dismissed', 'true');
  };

  if (!visible || totalItems <= 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#151515] text-[#FAF8F5] p-4 rounded-2xl border border-[#B89B5E]/40 shadow-luxury-gold flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242424] text-[#B89B5E] flex items-center justify-center shrink-0 border border-[#B89B5E]/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>سلتك بانتظار إتمام الطلب</span>
              <span className="text-[10px] text-[#B89B5E] bg-[#242424] px-1.5 py-0.5 rounded font-mono">
                {totalItems} {totalItems === 1 ? 'عطر' : 'عطور'}
              </span>
            </div>
            <p className="text-[11px] text-[#B8B2A6] mt-0.5">
              المجموع: {subtotal.toLocaleString('ar-DZ')} دج • الدفع عند الاستلام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/checkout"
            className="btn-luxury text-xs px-3 py-1.5 flex items-center gap-1 font-bold whitespace-nowrap"
          >
            <span>طلب</span>
            <ArrowLeft className="w-3 h-3" />
          </Link>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg text-[#77736B] hover:text-white flex items-center justify-center transition-colors"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

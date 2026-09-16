'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, ShoppingBag, Package, MessageSquareText } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();

  // Hide on admin screens
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const links = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/products', label: 'العطور', icon: Sparkles },
    { href: '/cart', label: 'السلة', icon: ShoppingBag, badge: totalItems },
    { href: '/track', label: 'تتبع الطلب', icon: Package },
    { href: '/contact', label: 'تواصل', icon: MessageSquareText },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D5] px-2 py-1.5">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
                isActive ? 'text-[#151515]' : 'text-[#77736B] hover:text-[#151515]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2] text-[#151515]' : 'stroke-[1.5]'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] bg-[#151515] text-white text-[9px] font-semibold rounded-full flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#151515]' : 'font-normal'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#6E603F] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

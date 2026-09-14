'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, ShoppingBag, MessageSquareText } from 'lucide-react';
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
    { href: '/contact', label: 'تواصل', icon: MessageSquareText },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-primary/10 px-3 py-2 shadow-stitch-floating">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all min-w-[64px] ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

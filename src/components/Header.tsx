'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hide customer header in admin dashboard
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'جميع العطور' },
    { href: '/track', label: 'تتبع الطلب' },
    { href: '/faq', label: 'التوصيل والضمان' },
    { href: '/contact', label: 'اتصل بنا' },
  ];

  return (
    <>
      {/* Top Announcement Bar: Ultra-thin, minimal, factual */}
      <div className="bg-[#151515] text-[#FAF8F5] text-xs py-1.5 px-4 text-center font-normal tracking-wide flex items-center justify-center gap-3 border-b border-[#242424]">
        <span>الدفع نقدًا عند الاستلام • توصيل سريع وموثوق لكافة الـ 58 ولاية</span>
      </div>

      <header className="sticky top-0 z-40 w-full header-glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo: Refined luxury typographic identity */}
          <Link href="/" className="flex flex-col items-start shrink-0 group py-1" aria-label="Creed Perfumes الجزائر - الرئيسية">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.16em] text-[#151515] group-hover:text-[#6E603F] transition-colors uppercase">
              CREED
            </span>
            <span className="text-[9px] tracking-[0.24em] text-[#77736B] uppercase -mt-0.5 font-medium">
              PARFUMS • ALGER
            </span>
          </Link>

          {/* Desktop Navigation: Editorial & Understated */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="القائمة الرئيسية">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm py-1 transition-colors relative font-medium ${
                    isActive
                      ? 'text-[#151515] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#151515]'
                      : 'text-[#77736B] hover:text-[#151515]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search, Cart, Mobile Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Input (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="بحث عن عطر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-52 bg-[#FAF8F5] text-[#151515] placeholder-[#77736B] text-xs pr-8 pl-3 py-2 rounded-full border border-[#E5E0D5] outline-none focus:border-[#151515] focus:w-60 transition-all duration-300"
              />
              <button
                type="submit"
                aria-label="بحث"
                className="absolute right-2.5 text-[#77736B] hover:text-[#151515] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Cart Button */}
            <Link
              href="/cart"
              aria-label="سلة التسوق"
              className="relative p-2.5 text-[#151515] hover:text-[#6E603F] transition-colors rounded-full hover:bg-[#FAF8F5] flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] rounded-full bg-[#151515] text-white text-[10px] font-semibold flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-[#151515] hover:text-[#6E603F] transition-colors rounded-full hover:bg-[#FAF8F5] flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E0D5] bg-white px-5 py-5 space-y-4 animate-in fade-in duration-200">
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                placeholder="ابحث عن عطر أو نوتة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F5] text-[#151515] placeholder-[#77736B] text-sm pr-9 pl-4 py-2.5 rounded-full border border-[#E5E0D5] outline-none focus:border-[#151515]"
              />
              <button type="submit" className="absolute right-3 text-[#77736B]" aria-label="بحث">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <nav className="flex flex-col divide-y divide-[#E5E0D5]/50">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 text-sm transition-colors flex items-center justify-between ${
                    pathname === link.href
                      ? 'text-[#151515] font-bold'
                      : 'text-[#77736B] hover:text-[#151515]'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

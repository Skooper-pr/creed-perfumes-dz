'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, PhoneCall, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBouncing, setIsBouncing] = useState(false);

  // Trigger bounce effect on cart icon when items change
  React.useEffect(() => {
    if (totalItems > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 450);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

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
    { href: '/track', label: 'تتبع طلبيتك' },
    { href: '/faq', label: 'التوصيل والضمان' },
    { href: '/contact', label: 'اتصل بنا' },
  ];

  return (
    <>
      {/* Top Banner: COD announcement with luxury shimmer sweep */}
      <div className="bg-primary text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shimmer-container shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
        <span>الدفع عند الاستلام متاح لجميع الـ 58 ولاية جزائرية • توصيل سريع وموثوق لباب منزلك</span>
        <span className="hidden sm:inline bg-secondary/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">100% أصلي ومضمون</span>
      </div>

      <header className="sticky top-0 z-40 w-full header-glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo with luxury glow hover */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-105 group-hover:shadow-stitch-glow transition-all duration-300">
              <span className="font-serif font-black text-xl tracking-tighter">CP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-primary group-hover:text-primary-container transition-colors">
                Creed <span className="text-secondary font-sans font-bold text-lg sm:text-xl">Perfumes</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-outline uppercase -mt-1">
                Haute Parfumerie • الجزائر
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full shadow-sm border border-primary/5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-stitch-glow scale-[1.02]'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container hover:scale-105'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search bar & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative group">
              <input
                type="text"
                placeholder="ابحث عن عطر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 lg:w-56 bg-surface-container-low text-on-surface text-sm pr-9 pl-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-primary/30 focus:w-64 focus:bg-white transition-all duration-300 shadow-inner"
              />
              <button type="submit" aria-label="بحث" className="absolute right-3 text-outline group-hover:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Cart Button with Lively Pop */}
            <Link
              href="/cart"
              aria-label="سلة التسوق"
              className={`relative w-11 h-11 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 ${
                isBouncing ? 'ring-2 ring-secondary/50 shadow-stitch-coral' : ''
              }`}
            >
              <ShoppingBag className={`w-5 h-5 transition-transform duration-300 ${isBouncing ? 'scale-110 text-secondary' : ''}`} />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-white text-xs font-black flex items-center justify-center ring-2 ring-white shadow-stitch-coral ${
                    isBouncing ? 'animate-badge-pop' : ''
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:text-primary transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-primary/10 bg-surface px-4 py-4 space-y-3 animate-in slide-in-from-top-2 shadow-xl">
            <form onSubmit={handleSearch} className="flex items-center relative mb-4">
              <input
                type="text"
                placeholder="ابحث عن عطر أو نوتة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container text-on-surface text-sm pr-10 pl-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="submit" className="absolute right-3.5 text-outline">
                <Search className="w-5 h-5" />
              </button>
            </form>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-between ${
                    pathname === link.href
                      ? 'bg-primary text-white'
                      : 'text-on-surface hover:bg-surface-container'
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

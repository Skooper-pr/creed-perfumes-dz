'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (pathname.startsWith('/admin')) return null;

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'التشكيلة' },
    { href: '/track', label: 'تتبع طلبي' },
    { href: '/faq', label: 'التوصيل والدفع' },
    { href: '/contact', label: 'تواصل معنا' },
  ];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <>
      <div className="bg-[#171716] px-4 py-2 text-center text-[11px] font-semibold text-[#e4ca96]">
        <span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> الدفع عند الاستلام · توصيل إلى 58 ولاية جزائرية</span>
      </div>
      <header className="header-glass sticky top-0 z-40">
        <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Creed Perfumes الجزائر">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b89b5e]/50 bg-[#171716] text-[#d4b676] transition-transform duration-300 group-hover:rotate-12"><span className="font-serif text-sm font-bold">C</span></span>
            <span className="hidden sm:block"><strong className="block font-serif text-xl font-bold tracking-[.18em] text-[#171716]">CREED</strong><small className="block text-[9px] font-semibold tracking-[.28em] text-[#817b70]">PARFUMS · ALGER</small></span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="القائمة الرئيسية">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`relative py-2 text-sm font-semibold transition-colors ${pathname === link.href ? 'text-[#171716] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:bg-[#b89b5e]' : 'text-[#817b70] hover:text-[#171716]'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن عطرك..." className="h-10 w-44 rounded-full border border-[#e5e0d5] bg-white/60 pr-10 pl-4 text-xs outline-none transition-all placeholder:text-[#a8a39a] focus:w-56 focus:border-[#b89b5e]" />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#817b70]" />
            </form>
            <Link href="/cart" aria-label="سلة التسوق" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-[#171716] transition-colors hover:border-[#e5e0d5] hover:bg-white">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#171716] px-1 text-[10px] font-bold text-white">{totalItems}</span>}
            </Link>
            <Link href="/products" className="hidden min-h-[42px] items-center gap-2 rounded-full bg-[#171716] px-5 text-xs font-bold text-white transition-colors hover:bg-[#2c2c29] sm:inline-flex">اطلب الآن <ArrowLeft className="h-3.5 w-3.5" /></Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e0d5] text-[#171716] lg:hidden" aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-[#e5e0d5] bg-[#f7f4ee] px-4 pb-5 pt-4 lg:hidden animate-fade-up">
            <form onSubmit={handleSearch} className="relative mb-3"><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن عطرك..." className="h-12 w-full rounded-2xl border border-[#e5e0d5] bg-white px-4 pr-10 text-sm outline-none focus:border-[#b89b5e]" /><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#817b70]" /></form>
            <nav className="grid grid-cols-2 gap-2">{navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#171716]">{link.label}</Link>)}</nav>
          </div>
        )}
      </header>
    </>
  );
};

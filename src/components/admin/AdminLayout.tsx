'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Layers, 
  Store, 
  LogOut, 
  Menu, 
  X,
  Phone,
  ShieldCheck,
  Bell,
  Truck,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminLoggedIn, isLoading, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading screen until session state is determined (prevents UI shell flash)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-on-surface-variant font-bold">جاري التحقق من صلاحيات الإدارة...</span>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!isAdminLoggedIn) {
    if (typeof window !== 'undefined') {
      router.push('/admin/login');
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'طلبيات الولايات', icon: ShoppingBag },
    { href: '/admin/products', label: 'مخزون العطور', icon: Package },
    { href: '/admin/categories', label: 'الفئات والتصنيفات', icon: Layers },
    { href: '/admin/coupons', label: 'كوبونات الخصم', icon: Tag },
    { href: '/admin/delivery', label: 'ربط التوصيل (Yalidine/ZR)', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Desktop Sidebar (Fixed on wide screens) */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-lowest border-l border-primary/10 shadow-sm shrink-0 min-h-screen sticky top-0 p-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-4 border-b border-primary/5">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-stitch-glow">
            CP
          </div>
          <div>
            <span className="font-serif font-black text-lg text-primary block leading-tight">
              Creed Perfumes
            </span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              لوحة الإدارة والمبيعات
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-stitch-glow'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-primary/10 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors font-semibold"
          >
            <Store className="w-4 h-4" />
            <span>معاينة المتجر للزبائن</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header for Admin */}
        <header className="sticky top-0 z-30 h-16 header-glass px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-full bg-surface-container text-on-surface hover:text-primary"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                🇩🇿 متجر الجزائر (COD)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>زيارة المتجر</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-bold bg-surface-container-low px-3 py-1.5 rounded-full border border-primary/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-on-surface-variant">مسؤول المتجر</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer (Hamburger Slide-over) */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-surface p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-primary/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    CP
                  </div>
                  <span className="font-bold text-sm text-primary">لوحة الإدارة</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full text-outline hover:text-on-surface"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-stitch-glow'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-primary/10 space-y-2 text-xs">
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface hover:bg-surface-container font-semibold"
              >
                <Store className="w-4 h-4" />
                <span>العودة للمتجر</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar for Admin (Priority for Phone Users) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-primary/10 px-2 py-1.5 shadow-stitch-floating">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-full transition-all min-w-[56px] ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-1 px-2 rounded-full text-secondary hover:text-secondary-dark min-w-[56px]"
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">المتجر</span>
          </Link>
        </div>
      </div>

    </div>
  );
};

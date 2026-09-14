'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, ShieldCheck, Banknote, Phone, Instagram, Send, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-primary/10 mt-20">
      {/* Top Value Proposition Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-b border-primary/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">توصيل لكافة الـ 58 ولاية</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">توصيل سريع حتى باب منزلك مع ياليدين & ZR</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">الدفع عند الاستلام (COD)</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">ادفع نقداً بالدينار الجزائري بعد استلام طردك</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">ضمان الجودة والأصالة</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">عطور أصلية فاخرة وتركيزات عالية الثبات</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface">خدمة العملاء هاتفياً</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">اتصال مباشر لتأكيد طلبيتك ومتابعتها</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                CP
              </div>
              <span className="font-serif font-black text-xl text-primary">Creed Perfumes</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              دار العطور الملكية الفاخرة لزبائن الجزائر. نقدم لكم أفضل توليفات دار كريد العالمية بثبات وفوحان استثنائي، مع خدمة التوصيل السريع والدفع نقداً عند المعاينة.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-on-surface mb-4">روابط المتجر</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">جميع العطور المتوفرة</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">سياسة التوصيل والاسترجاع</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">اتصل بنا / طلبات الجملة</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Info */}
          <div>
            <h4 className="font-bold text-sm text-on-surface mb-4">التوصيل والشحن</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              الشحن متوفر لجميع الـ 58 ولاية من تمنراست إلى تلمسان ومن الجزائر العاصمة إلى عنابة.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-surface-container text-xs font-semibold text-primary">
              ⚡ مدة التوصيل: 24 - 48 ساعة للشمال، و 3 - 4 أيام لولايات الجنوب.
            </div>
          </div>

          {/* Col 4: Contact & Admin */}
          <div>
            <h4 className="font-bold text-sm text-on-surface mb-4">التواصل والمساعدة</h4>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p className="flex items-center gap-2" dir="ltr">
                <span className="font-semibold">+213 (0) 550 12 34 56</span>
                <Phone className="w-4 h-4 text-primary" />
              </p>
              <p className="text-xs text-on-surface-variant">الجزائر العاصمة - حي سيدي يحيى</p>
              
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://wa.me/213550123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                  aria-label="WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-3">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
                >
                  <span>بوابة صاحب المتجر (Admin)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} Creed Perfumes الجزائر. جميع الحقوق محفوظة. جميع الأسعار بالدينار الجزائري (دج / DZD).</p>
          <div className="flex items-center gap-4">
            <span>دفع عند الاستلام 100%</span>
            <span>•</span>
            <span>بدون دفع إلكتروني</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Send, Instagram, ShieldCheck, Truck, Banknote, Clock } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full bg-[#151515] text-[#FAF8F5] border-t border-[#242424] mt-24">
      {/* Editorial Trust Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-[#242424]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-[#242424] text-[#B89B5E] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">توصيل لكافة الـ 58 ولاية</h4>
              <p className="text-xs text-[#A8A39A] mt-0.5">شحن آمن وسريع لباب منزلك</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-[#242424] text-[#B89B5E] flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">الدفع عند الاستلام</h4>
              <p className="text-xs text-[#A8A39A] mt-0.5">عاين طردك وادفع نقدًا عند الباب</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-[#242424] text-[#B89B5E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">عطور مختارة بعناية</h4>
              <p className="text-xs text-[#A8A39A] mt-0.5">تركيبات عالية التركيز والفوحان</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3">
            <div className="w-10 h-10 rounded-full bg-[#242424] text-[#B89B5E] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">تأكيد ومتابعة مستمرة</h4>
              <p className="text-xs text-[#A8A39A] mt-0.5">اتصال هاتفي لتأكيد العنوان وموعد التسليم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Essence */}
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <span className="font-serif text-2xl font-bold tracking-[0.16em] text-white uppercase">
                CREED
              </span>
              <span className="text-[10px] tracking-[0.24em] text-[#A8A39A] uppercase -mt-0.5">
                PARFUMS • ALGER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A8A39A] leading-relaxed">
              بوتيك العطور النيش الفاخرة المخصص لزبائن الجزائر. نقدم لكم أرقى إبداعات دار كريد العالمية بتجربة تسوق راقية وخدمة توصيل موثوقة حتى باب المنزل.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">روابط البوتيك</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#A8A39A]">
              <li>
                <Link href="/" className="hover:text-[#FAF8F5] transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#FAF8F5] transition-colors">جميع التشكيلات المتوفرة</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#FAF8F5] transition-colors">تتبع حالة طلبيتك</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#FAF8F5] transition-colors">سياسة الشحن والدفع عند الاستلام</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F5] transition-colors">خدمة العملاء والاستفسارات</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">التوصيل لكافة الولايات</h4>
            <p className="text-xs sm:text-sm text-[#A8A39A] leading-relaxed">
              تغطية شاملة لكافة الـ 58 ولاية من الشمال إلى الجنوب عبر شبكة شركاء نقل موثوقين.
            </p>
            <div className="mt-4 p-3.5 rounded-xl bg-[#242424] text-xs text-[#FAF8F5] border border-[#2E2E2E] space-y-1">
              <div>• ولايات الشمال والوسط: {siteConfig.delivery.averageTimeNorth}</div>
              <div>• ولايات الهضاب والجنوب: {siteConfig.delivery.averageTimeSouth}</div>
            </div>
          </div>

          {/* Col 4: Customer Support & Direct Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">خدمة العملاء</h4>
            <div className="space-y-3 text-xs sm:text-sm text-[#A8A39A]">
              <p className="leading-relaxed">
                {siteConfig.contact.workingHours}
              </p>

              {siteConfig.contact.phone ? (
                <p className="flex items-center gap-2 pt-1" dir="ltr">
                  <a
                    href={`tel:${siteConfig.contact.phoneFormatted}`}
                    className="font-mono text-sm text-white hover:text-[#B89B5E] transition-colors"
                  >
                    {siteConfig.contact.phone}
                  </a>
                  <Phone className="w-3.5 h-3.5 text-[#B89B5E]" />
                </p>
              ) : (
                <p className="text-xs text-[#77736B]">
                  الاتصال المباشر يتم تلقائياً بعد تأكيد طلبيتكم لمراجعة العنوان وتوقيت التسليم المناسب.
                </p>
              )}

              {siteConfig.contact.whatsappLink && (
                <div className="pt-2">
                  <a
                    href={siteConfig.contact.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#242424] text-[#FAF8F5] hover:bg-[#2C2C2C] text-xs border border-[#2E2E2E] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>محادثة واتساب المباشرة</span>
                  </a>
                </div>
              )}

              {siteConfig.social.instagram && (
                <div className="pt-1">
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#A8A39A] hover:text-white transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>حساب انستغرام</span>
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77736B]">
          <p>© {new Date().getFullYear()} Creed Perfumes الجزائر. جميع الأسعار بالدينار الجزائري (دج / DZD).</p>
          <div className="flex items-center gap-4 text-[#A8A39A]">
            <span>الدفع نقداً عند المعاينة</span>
            <span>•</span>
            <span>بدون دفع إلكتروني مسبق</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

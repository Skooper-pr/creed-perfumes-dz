'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Truck, Clock, ArrowLeft, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Loader } from '@/components/Loader';
import { siteConfig } from '@/config/site';
import { trackPurchase } from '@/lib/tracking';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'DZ-84921';
  const orderId = searchParams.get('orderId') || orderNumber;
  const total = Number(searchParams.get('total')) || 0;

  useEffect(() => {
    // Subtle luxury gold confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#151515', '#6E603F', '#B89B5E', '#FAF8F5'],
      });
    } catch {
      // ignore
    }

    // Fire purchase conversion pixel
    trackPurchase({
      id: orderId,
      order_number: orderNumber,
      total_price: total,
    });
  }, [orderId, orderNumber, total]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center space-y-8">
      
      {/* Refined Success Badge */}
      <div className="w-16 h-16 mx-auto rounded-full bg-[#151515] text-[#B89B5E] flex items-center justify-center border border-[#242424] shadow-sm">
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>

      {/* Main Announcement */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
          تم تسجيل طلبيتك بنجاح
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#151515]">
          شكراً لثقتكم بدار Creed Perfumes
        </h1>
        <p className="text-xs sm:text-sm text-[#77736B] max-w-md mx-auto leading-relaxed">
          سيتصل بكم فريق خدمة العملاء على رقم هاتفكم لتأكيد تفاصيل العنوان والبلدية قبل خروج الشحنة مع شركة التوصيل.
        </p>
      </div>

      {/* Order Number Card */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 space-y-3 text-center max-w-md mx-auto shadow-sm">
        <span className="text-xs text-[#77736B] uppercase tracking-wider block">
          رقم الطلبية الخاص بك
        </span>
        <div className="text-2xl sm:text-3xl font-bold text-[#151515] font-mono tracking-wider bg-[#FAF8F5] py-2.5 px-4 rounded-xl border border-[#E5E0D5]">
          {orderNumber}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[#77736B] font-medium pt-1">
          <Clock className="w-3.5 h-3.5 text-[#6E603F]" />
          <span>الحالة: <strong className="text-[#151515]">بانتظار التأكيد الهاتفي</strong></span>
        </div>
      </div>

      {/* Fulfillment Steps Timeline */}
      <div className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-6 text-right space-y-3.5 border border-[#E5E0D5]">
        <h3 className="text-xs font-bold text-[#151515] uppercase tracking-wide flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#6E603F]" />
          <span>مراحل معالجة واستلام طلبيتك:</span>
        </h3>

        <div className="space-y-2.5 text-xs text-[#77736B]">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#151515] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <p><strong className="text-[#151515]">مكالمة التأكيد:</strong> يتصل بكم موظف الخدمة لمراجعة تفاصيل العنوان والبلدية وموعد التواجد.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#151515] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <p><strong className="text-[#151515]">التجهيز والشحن:</strong> يتم تغليف العطر بعناية في علبة دار كريد وتسليمه لشركة النقل.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#151515] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <p><strong className="text-[#151515]">المعاينة والدفع:</strong> يصلكم المندوب حتى الباب، تفحصون الطرد وتدفعون المبلغ نقدًا.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href={`/track?query=${encodeURIComponent(orderNumber)}`}
          className="btn-luxury-primary text-xs sm:text-sm py-3 px-6 w-full sm:w-auto"
        >
          <Truck className="w-4 h-4" />
          <span>تتبع مسار طلبيتك</span>
        </Link>

        {siteConfig.contact.whatsappLink && (
          <a
            href={siteConfig.contact.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury-outline text-xs sm:text-sm py-3 px-6 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>واتساب المباشر</span>
          </a>
        )}

        <Link
          href="/"
          className="text-xs text-[#77736B] hover:text-[#151515] py-2 px-3 font-medium transition-colors"
        >
          <span>العودة للمتجر</span>
        </Link>
      </div>

    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center">
          <Loader text="جاري تجهيز بيانات الطلبية..." />
        </div>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  );
}

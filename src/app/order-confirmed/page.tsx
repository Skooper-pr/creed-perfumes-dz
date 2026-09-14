'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, PhoneCall, Sparkles, Truck, Clock, ArrowLeft, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'DZ-84921';

  useEffect(() => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#541f91', '#6c3baa', '#f47a60', '#fe8267', '#ffd700']
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center space-y-8">
      
      {/* Animated Success Badge */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-secondary/20 animate-ping" />
        <div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center shadow-stitch-coral z-10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
      </div>

      {/* Main Announcement */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>تم تسجيل طلبيتك بنجاح</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
          شكراً لاختيارك دار Creed Perfumes
        </h1>
        
        <p className="text-base sm:text-lg text-primary font-bold">
          سيتم الاتصال بك لتأكيد الطلب قريباً عبر الهاتف
        </p>

        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          فريق خدمة العملاء سيتصل بك على رقمك لتأكيد معلومات التوصيل والعنوان قبل إرسال الشحنة مع شركة النقل.
        </p>
      </div>

      {/* Order Number Card */}
      <div className="card-stitch max-w-md mx-auto p-6 space-y-4 text-center">
        <span className="text-xs font-semibold text-outline uppercase tracking-wider block">
          رقم الطلب الخاص بك
        </span>
        <div className="text-3xl sm:text-4xl font-black text-primary font-mono tracking-wider bg-surface-container-low py-3 px-6 rounded-2xl border border-primary/10">
          {orderNumber}
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant font-medium">
          <Clock className="w-4 h-4 text-secondary" />
          <span>حالة الطلب: <strong className="text-secondary font-bold">بانتظار التأكيد الهاتفي</strong></span>
        </div>
      </div>

      {/* What happens next steps */}
      <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 max-w-xl mx-auto text-right space-y-4 border border-primary/5">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          <span>ماذا يحدث بعد ذلك؟</span>
        </h3>

        <div className="space-y-3 text-xs text-on-surface-variant">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <p><strong>مكالمة التأكيد:</strong> سيتصل بك فريقنا لتأكيد طلبيتك والبلدية وموعد تواجدك.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <p><strong>التجهيز والشحن:</strong> يتم تغليف عطرك بعناية وتسليمه لمندوب التوصيل.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <p><strong>الاستلام والدفع:</strong> يصلك الطرد لباب منزلك، تفحص العطر وتدفع للمندوب نقداً.</p>
          </div>
        </div>
      </div>

      {/* Direct Contact & Home actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <a
          href="https://wa.me/213550123456"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-primary text-xs sm:text-sm py-3.5 px-6 flex items-center gap-2 w-full sm:w-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>تواصل معنا عبر واتساب للمتابعة</span>
        </a>

        <Link
          href="/"
          className="btn-pill-outline text-xs sm:text-sm py-3.5 px-6 flex items-center gap-2 w-full sm:w-auto"
        >
          <span>العودة للمتجر الرئيسي</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-on-surface-variant">جاري تأكيد طلبيتك...</p>
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}

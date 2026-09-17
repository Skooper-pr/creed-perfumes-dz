'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  FileText, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Banknote, 
  ArrowLeft,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/data/wilayas';
import { createOrder, validateCoupon } from '@/lib/store';
import { OrderItem, Coupon } from '@/types';
import { trackInitiateCheckout } from '@/lib/tracking';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  // Default wilaya is empty so user actively chooses their Algerian wilaya
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentWilaya = selectedWilayaCode ? getWilayaByCode(selectedWilayaCode) : undefined;
  const deliveryFee = currentWilaya ? currentWilaya.delivery_fee : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const finalTotal = discountedSubtotal + deliveryFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discount);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(res.error || 'رمز الكوبون غير صالح');
      }
    } catch {
      setCouponError('تعذر التحقق من الكوبون حالياً');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponError(null);
  };

  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(finalTotal, items.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('سلة المشتريات فارغة. يرجى اختيار عطر أولاً.');
      return;
    }

    // Honeypot anti-spam: bots fill hidden fields, real users don't
    if (honeypot) {
      // Silently pretend success to not reveal the trap
      router.push('/order-confirmed?orderNumber=DZ-00000');
      return;
    }

    const outOfStockItem = items.find((item) => (item.product.stock ?? 0) <= 0);
    if (outOfStockItem) {
      setErrorMsg(`عذراً، العطر "${outOfStockItem.product.name}" نفذت كميته من المخزون حالياً. يرجى حذفه لإكمال الطلب.`);
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('يرجى إدخال الاسم واللقب.');
      return;
    }

    // Algerian phone format check (05, 06, 07 + 8 digits)
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف جزائري صحيح مكون من 10 أرقام (يبدأ بـ 05، 06، أو 07).');
      return;
    }

    if (!selectedWilayaCode || !currentWilaya) {
      setErrorMsg('يرجى اختيار الولاية لحساب تكلفة الشحن ومتابعة الطلب.');
      return;
    }

    if (!commune.trim()) {
      setErrorMsg('يرجى إدخال اسم البلدية.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('يرجى إدخال العنوان بالتفصيل (الحي، الشارع، أو رقم العمارة).');
      return;
    }

    // Client-side phone throttle: block duplicate phone within 2 minutes
    const cleanPhoneForThrottle = cleanPhone;
    const throttleKey = `creed_order_throttle_${cleanPhoneForThrottle}`;
    const lastOrderTime = localStorage.getItem(throttleKey);
    if (lastOrderTime) {
      const elapsed = Date.now() - parseInt(lastOrderTime, 10);
      if (elapsed < 2 * 60 * 1000) {
        setErrorMsg('تم تسجيل طلبية من هذا الرقم منذ أقل من دقيقتين. يرجى الانتظار قليلاً قبل تقديم طلب جديد.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map((item) => ({
        product_id: item.product.id,
        name: `${item.product.name} (${item.product.size || '100ml'})`,
        price: item.product.discount_price ?? item.product.price,
        qty: item.quantity,
        image: item.product.images[0],
      }));

      const newOrder = await createOrder({
        customer_name: customerName.trim(),
        phone: cleanPhone,
        phone_secondary: phoneSecondary.trim() || undefined,
        wilaya: currentWilaya.name_ar,
        wilaya_code: currentWilaya.code,
        commune: commune.trim(),
        address: address.trim(),
        notes: notes.trim() || undefined,
        items: orderItems,
        total_price: finalTotal,
        delivery_fee: deliveryFee,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        discount_amount: discountAmount,
      });

      // Clear the cart
      clearCart();

      // Record throttle timestamp for this phone
      localStorage.setItem(`creed_order_throttle_${cleanPhone}`, String(Date.now()));

      // Redirect to Order Confirmed page
      router.push(`/order-confirmed?orderId=${newOrder.id}&orderNumber=${newOrder.order_number}&total=${newOrder.total_price}`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل طلبيتك، يرجى المحاولة مرة أخرى.';
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white border border-[#E5E0D5] mx-auto flex items-center justify-center text-[#6E603F]">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="text-xl font-bold text-[#151515]">سلة المشتريات فارغة</h2>
        <p className="text-xs text-[#77736B]">يرجى اختيار عطر أولاً للتوجه لصفحة تأكيد الطلب.</p>
        <Link href="/products" className="btn-luxury-primary text-xs inline-flex items-center gap-2">
          <span>تصفح العطور الآن</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Visual Step Indicator Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6E603F] uppercase tracking-wide">
            <span>الخطوة 1: بيانات الزبون</span>
            <span>←</span>
            <span>الخطوة 2: العنوان والشحن</span>
            <span>←</span>
            <span className="text-[#151515]">الخطوة 3: تأكيد الطلب</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight mt-1">
            إتمام طلب الشراء (الدفع عند الاستلام)
          </h1>
          <p className="text-xs text-[#77736B] mt-1">
            املأ بيانات التوصيل بدقة ليتصل بك فريقنا لتأكيد طلبك وتجهيز الشحنة.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FAF8F5] text-[#151515] border border-[#E5E0D5] px-4 py-2 rounded-full text-xs font-semibold shrink-0 self-start sm:self-auto">
          <Banknote className="w-4 h-4 text-[#6E603F]" />
          <span>الدفع نقدًا عند الباب</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Two Column Grid: Form (7 cols) + Order Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN in RTL: Customer Shipping Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E0D5] p-5 sm:p-7 space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Customer Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-2.5">
                <span className="w-6 h-6 rounded-full bg-[#151515] text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-sm font-bold text-[#151515]">بيانات المستلم</h2>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="fullName">
                  الاسم واللقب بالكامل <span className="text-[#6E603F]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="مثال: أمين بلقاسم"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors"
                  />
                  <User className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Phone Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="phone">
                    رقم الهاتف الرئيسي <span className="text-[#6E603F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      dir="ltr"
                      required
                      placeholder="0550 12 34 56"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-right bg-[#FAF8F5] text-[#151515] text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors font-mono"
                    />
                    <Phone className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-[#77736B] mt-1 block">للاتصال بك قبل خروج مندوب التوصيل</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="phoneSecondary">
                    رقم هاتف إضافي <span className="text-[#77736B] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="phoneSecondary"
                      type="tel"
                      dir="ltr"
                      placeholder="0661 00 00 00"
                      value={phoneSecondary}
                      onChange={(e) => setPhoneSecondary(e.target.value)}
                      className="w-full text-right bg-[#FAF8F5] text-[#151515] text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors font-mono"
                    />
                    <Phone className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-[#77736B] mt-1 block">في حال تعذر الوصول للرقم الأول</span>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping & Address */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-2.5">
                <span className="w-6 h-6 rounded-full bg-[#151515] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-sm font-bold text-[#151515]">العنوان والولاية</h2>
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="wilaya">
                    الولاية (58 ولاية) <span className="text-[#6E603F]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="wilaya"
                      required
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(e.target.value)}
                      className="w-full appearance-none bg-[#FAF8F5] text-[#151515] text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors cursor-pointer font-medium"
                    >
                      <option value="">-- اختر ولايتك من القائمة --</option>
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name_ar} ({w.delivery_fee} دج)
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {currentWilaya ? (
                    <span className="text-[10px] text-[#6E603F] font-medium mt-1 block">
                      مدة الشحن المقدرة: {currentWilaya.delivery_time} • تكلفة التوصيل: {currentWilaya.delivery_fee} دج
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#77736B] mt-1 block">
                      يرجى اختيار ولايتك لاحتساب رسوم التوصيل تلقائياً
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="commune">
                    البلدية <span className="text-[#6E603F]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="commune"
                      type="text"
                      required
                      placeholder="مثال: حيدرة، سيدي يحيى، بئر مراد رايس"
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full bg-[#FAF8F5] text-[#151515] text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors"
                    />
                    <Building2 className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="address">
                  العنوان بالتفصيل <span className="text-[#6E603F]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="address"
                    type="text"
                    required
                    placeholder="الحي، اسم الشارع، رقم العمارة أو الفيلا"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors"
                  />
                  <MapPin className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#151515] mb-1.5" htmlFor="notes">
                  ملاحظات لمندوب التوصيل <span className="text-[#77736B] font-normal">(اختياري)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="أي إرشادات إضافية أو أوقات مفضلة للاتصال بك..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-sm pr-10 pl-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors resize-none"
                  />
                  <FileText className="w-4 h-4 text-[#77736B] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Honeypot anti-spam field — hidden from real users, traps bots */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <label htmlFor="website_url">Leave empty</label>
              <input
                id="website_url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Step 3: Confirmation CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury-primary w-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري تأكيد طلبيتك...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الطلب الآن (المبلغ: {finalTotal.toLocaleString('ar-DZ')} دج عند الاستلام)</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-[#77736B] mt-2">
                الدفع نقدًا عند استلام الطرد وفحصه • بدون أي دفع إلكتروني مسبق
              </p>
            </div>

          </form>
        </div>

        {/* LEFT COLUMN in RTL: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white rounded-2xl border border-[#E5E0D5] p-5 sm:p-6 space-y-5">
            <h3 className="text-base font-bold text-[#151515] border-b border-[#E5E0D5] pb-3">
              العطور في طلبيتك ({totalItems})
            </h3>

            {/* Items list preview */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => {
                const activePrice = product.discount_price ?? product.price;
                return (
                  <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] p-1 shrink-0 flex items-center justify-center border border-[#E5E0D5] relative overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-[#151515] block line-clamp-1">{product.name}</span>
                        <span className="text-[#77736B] text-[11px]">{product.size || '100ml'} • الكمية: {quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#151515] shrink-0">
                      {(activePrice * quantity).toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Section */}
            <div className="border-t border-[#E5E0D5] pt-3.5">
              {appliedCoupon ? (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#B89B5E]/40 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-[#151515]">
                      <Tag className="w-3.5 h-3.5 text-[#6E603F]" />
                      <span className="font-mono">{appliedCoupon.code}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">تم الخصم</span>
                    </div>
                    <span className="text-[11px] text-[#6E603F]">
                      وفّرت {discountAmount.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-red-600 hover:underline font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="رمز الكوبون (مثال: CREED10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-[#FAF8F5] text-[#151515] text-xs px-3 py-2 rounded-xl border border-[#E5E0D5] outline-none font-mono uppercase"
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="btn-luxury text-xs px-3.5 py-2 shrink-0 disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'تطبيق'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600 text-right">{couponError}</p>
                  )}
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-[#E5E0D5] pt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#77736B]">
                <span>المجموع الفرعي للعطور</span>
                <span className="font-semibold text-[#151515]">{subtotal.toLocaleString('ar-DZ')} دج</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>خصم الكوبون ({appliedCoupon?.code})</span>
                  <span>-{discountAmount.toLocaleString('ar-DZ')} دج</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#77736B]">
                <span>رسوم التوصيل {currentWilaya ? `(${currentWilaya.name_ar})` : ''}</span>
                {currentWilaya ? (
                  <span className="font-semibold text-[#151515]">{deliveryFee.toLocaleString('ar-DZ')} دج</span>
                ) : (
                  <span className="text-[#6E603F] font-medium text-[11px]">يرجى اختيار الولاية</span>
                )}
              </div>

              <div className="border-t border-[#E5E0D5] pt-3 flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#151515]">المبلغ الإجمالي المستحق:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#151515]">
                    {finalTotal.toLocaleString('ar-DZ')}
                  </span>
                  <span className="text-xs font-medium text-[#77736B]">دج</span>
                </div>
              </div>
            </div>

            {/* COD Guarantees */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl space-y-2 text-xs text-[#77736B] border border-[#E5E0D5]/70">
              <div className="flex items-center gap-2 text-[#151515] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#6E603F] shrink-0" />
                <span>ضمان المعاينة والدفع عند الاستلام</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                الموزع سيسلمك الطرد إلى عنوانك، يمكنك معاينة الزجاجة والعلبة الخارجية قبل تسليم المبلغ نقدًا.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

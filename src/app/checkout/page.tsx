'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  CheckCircle2
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ALGERIA_WILAYAS, getWilayaByCode } from '@/data/wilayas';
import { createOrder } from '@/lib/store';
import { OrderItem } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // Default to Alger
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentWilaya = getWilayaByCode(selectedWilayaCode) || ALGERIA_WILAYAS[15]; // Alger fallback
  const deliveryFee = items.length > 0 ? currentWilaya.delivery_fee : 0;
  const finalTotal = subtotal + deliveryFee;

  // Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg('سلة المشتريات فارغة. يرجى اختيار عطر أولاً.');
      return;
    }

    const outOfStockItem = items.find(item => (item.product.stock ?? 0) <= 0);
    if (outOfStockItem) {
      setErrorMsg(`عذراً، العطر "${outOfStockItem.product.name}" نفذت كميته من المخزون وغير متوفر حالياً. يرجى حذفه من السلة لإكمال الطلب.`);
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('يرجى إدخال الاسم واللقب.');
      return;
    }

    // Algerian phone format check
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(05|06|07)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف جزائري صحيح مكون من 10 أرقام (يبدأ بـ 05، 06، أو 07).');
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

    setIsSubmitting(true);

    try {
      const orderItems: OrderItem[] = items.map(item => ({
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
      });

      // Clear the cart
      clearCart();

      // Redirect to Order Confirmed page
      router.push(`/order-confirmed?orderId=${newOrder.id}&orderNumber=${newOrder.order_number}`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ الطلبية، يرجى المحاولة مرة أخرى.';
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-primary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">سلتك فارغة</h2>
        <p className="text-xs text-on-surface-variant">اختر عطراً من المتجر قبل التوجه لنموذج الشراء.</p>
        <Link href="/products" className="btn-pill-primary text-xs inline-flex items-center gap-2">
          <span>تصفح العطور الآن</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            الدفع نقداً عند الاستلام • التوصيل لـ 58 ولاية
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-1">
            إتمام طلب الشراء المباشر (COD)
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            املأ بيانات التوصيل بدقة لضمان تواصل مندوب التوصيل معك وتسليم طلبيتك في أسرع وقت.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-secondary/15 text-secondary px-4 py-2 rounded-full font-bold text-xs shrink-0 self-start sm:self-auto">
          <Banknote className="w-4 h-4" />
          <span>الدفع نقداً بالدينار (دج) فقط</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs sm:text-sm font-semibold border border-red-200 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* Two Column Grid: Form (7 cols) + Order Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN in RTL: Customer Shipping Form (7 Cols) */}
        <div className="lg:col-span-7 card-stitch space-y-6">
          <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">بيانات المستلم والتوصيل</h2>
              <p className="text-xs text-on-surface-variant">دون الحاجة لتسجيل حساب أو بطاقة بنكية</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="fullName">
                الاسم واللقب بالكامل <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="مثال: أمين بلقاسم"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Phone Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="phone">
                  رقم الهاتف الرئيسي <span className="text-secondary">*</span>
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
                    className="w-full text-right bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-mono"
                  />
                  <Phone className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-outline mt-1 block">سيتصل بك الموزع لتأكيد الوصول</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="phoneSecondary">
                  رقم هاتف إضافي <span className="text-outline font-normal">(اختياري)</span>
                </label>
                <div className="relative">
                  <input
                    id="phoneSecondary"
                    type="tel"
                    dir="ltr"
                    placeholder="0661 00 00 00"
                    value={phoneSecondary}
                    onChange={(e) => setPhoneSecondary(e.target.value)}
                    className="w-full text-right bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-mono"
                  />
                  <Phone className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-outline mt-1 block">في حال تعذر الوصول للرقم الأول</span>
              </div>
            </div>

            {/* Wilaya (58 Wilayas dropdown) and Commune */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="wilaya">
                  الولاية (58 ولاية) <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="wilaya"
                    value={selectedWilayaCode}
                    onChange={(e) => setSelectedWilayaCode(e.target.value)}
                    className="w-full appearance-none bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all cursor-pointer font-semibold"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name_ar} ({w.name_en}) — {w.delivery_fee} دج
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-primary font-semibold mt-1 block">
                  مدة التوصيل: {currentWilaya.delivery_time}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="commune">
                  البلدية <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="commune"
                    type="text"
                    required
                    placeholder="مثال: حيدرة، سيدي يحيى"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  />
                  <Building2 className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="address">
                العنوان بالتفصيل <span className="text-secondary">*</span>
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  required
                  placeholder="مثال: حي 500 مسكن، عمارة 12، الطابق الثاني، شقة 5"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <MapPin className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5" htmlFor="notes">
                ملاحظات خاصة بالتوصيل <span className="text-outline font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="أوقات التواجد المفضلة، أو أي إرشادات لمندوب التوصيل..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm pr-11 pl-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                />
                <FileText className="w-4 h-4 text-outline absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button (Mobile view button) */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pill-secondary w-full py-4 text-base font-black shadow-stitch-coral flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري إرسال الطلبية...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تأكيد الطلبية الآن (الدفع {finalTotal.toLocaleString('ar-DZ')} دج عند الاستلام)</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* LEFT COLUMN in RTL: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-stitch space-y-4">
            <h3 className="text-base font-extrabold text-on-surface border-b border-primary/10 pb-3">
              العطور في طلبيتك ({totalItems})
            </h3>

            {/* Items list preview */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => {
                const activePrice = product.discount_price ?? product.price;
                return (
                  <div key={product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-low p-1 shrink-0 flex items-center justify-center">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="font-bold text-on-surface block line-clamp-1">{product.name}</span>
                        <span className="text-outline">{product.size || '100ml'} • الكمية: {quantity}</span>
                      </div>
                    </div>
                    <span className="font-black text-primary shrink-0">
                      {(activePrice * quantity).toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="border-t border-primary/10 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>المجموع الفرعي للعطور</span>
                <span className="font-bold text-on-surface">{subtotal.toLocaleString('ar-DZ')} دج</span>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant">
                <span>تكلفة التوصيل ({currentWilaya.name_ar})</span>
                <span className="font-bold text-primary">{deliveryFee.toLocaleString('ar-DZ')} دج</span>
              </div>

              <div className="border-t border-primary/10 pt-3 flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-on-surface">المبلغ الإجمالي المستحق:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary">
                    {finalTotal.toLocaleString('ar-DZ')}
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant">دج</span>
                </div>
              </div>
            </div>

            {/* COD Guarantees */}
            <div className="bg-surface-container-low p-4 rounded-2xl space-y-2.5 text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-2 text-on-surface font-semibold">
                <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
                <span>شراء مضمون 100% بدون أي مخاطرة</span>
              </div>
              <p className="leading-relaxed">
                لا تدفع أي دينار الآن. الموزع سيصلك إلى عنوانك في <strong>{currentWilaya.name_ar}</strong>، يمكنك معاينة العطر ثم دفع المبلغ نقداً.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

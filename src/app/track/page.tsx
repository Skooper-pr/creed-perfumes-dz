'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  MapPin, 
  MessageSquare, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  XCircle,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { getOrdersByPhone } from '@/lib/store';
import { Order, OrderStatus } from '@/types';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const results = await getOrdersByPhone(query.trim());
      setOrders(results);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار الاتصال الهاتفي لتأكيد الطلب</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التأكيد • جاري التجهيز والتغليف</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
            <Truck className="w-3.5 h-3.5" />
            <span>في الطريق إليك مع مندوب التوصيل</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم الاستلام والدفع عند الاستلام بنجاح</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>طلب ملغى</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>طرد راجع / مسترجع</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-full text-primary font-bold text-xs">
          <Truck className="w-4 h-4 text-secondary" />
          <span>توصيل سريع لـ 58 ولاية جزائرية 🇩🇿</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          تتبع حالة طلبيتك لحظة بلحظة
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          أدخل رقم هاتفك المسجل في الطلب (أو كود الطلبية DZ-XXXXX) لمعرفة مكان وحالة طردك فوراً.
        </p>
      </div>

      {/* Search Box */}
      <div className="card-stitch p-6 sm:p-8 shadow-stitch bg-surface-container-low max-w-2xl mx-auto border border-primary/10">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="trackQuery" className="block text-xs font-bold text-on-surface mb-2">
              رقم الهاتف المسجل أو كود الطلب:
            </label>
            <div className="relative">
              <input
                id="trackQuery"
                type="text"
                dir="ltr"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: 0555123456 أو DZ-84921"
                className="w-full bg-white text-on-surface text-base pr-12 pl-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm border border-primary/10 font-mono text-right"
              />
              <Search className="w-5 h-5 text-primary absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pill-primary w-full py-4 text-sm font-bold shadow-stitch-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري البحث عن طلبيتك...</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>تتبع الطلبية الآن</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-on-surface-variant mt-3">
          💡 يتم تحديث حالة التوصيل تلقائياً فور تحرك الطرد مع مندوب الشحن في ولايتك.
        </p>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {orders && orders.length === 0 && (
            <div className="card-stitch p-8 text-center space-y-4 max-w-lg mx-auto bg-surface">
              <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-on-surface">لم يتم العثور على أي طلبيات بهذا الرقم</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                يرجى التأكد من كتابة رقم الهاتف نفسه المستعمل أثناء الطلب (مثل 05 أو 06 أو 07) أو كود الطلب المكتوب في رسالة التأكيد.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/213550000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AD%D8%A7%D9%84%D8%A9%20%D8%B7%D9%84%D8%A8%D9%8A%D8%AA%D9%8A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-secondary text-xs py-2.5 px-6 inline-flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>تواصل معنا عبر واتساب للمساعدة</span>
                </a>
              </div>
            </div>
          )}

          {orders && orders.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-on-surface">
                  الطلبيات المسجلة ({orders.length})
                </h2>
                <span className="text-xs text-on-surface-variant">مرتبة من الأحدث إلى الأقدم</span>
              </div>

              {orders.map((order) => {
                const currentStep = getStepIndex(order.status);
                const isSpecial = order.status === 'cancelled' || order.status === 'returned';

                return (
                  <div key={order.id} className="card-stitch p-6 sm:p-8 space-y-6 shadow-stitch border border-primary/10">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-primary/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-lg text-primary">
                            #{order.order_number}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            • {new Date(order.created_at).toLocaleDateString('ar-DZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-secondary" />
                          <span>ولاية {order.wilaya} ({order.commune})</span>
                        </p>
                      </div>

                      <div className="self-start sm:self-auto">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Timeline Stepper (for normal progressive orders) */}
                    {!isSpecial && (
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2 text-center relative">
                          
                          {/* Step 1 */}
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 1 ? 'bg-primary text-white shadow-stitch-glow' : 'bg-surface-container text-outline'
                            }`}>
                              {currentStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={`text-[11px] font-bold leading-tight ${currentStep >= 1 ? 'text-primary' : 'text-outline'}`}>
                              تم استلام الطلب
                            </span>
                            <span className="text-[10px] text-on-surface-variant hidden sm:inline">
                              قيد المراجعة
                            </span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 2 ? 'bg-primary text-white shadow-stitch-glow' : 'bg-surface-container text-outline'
                            }`}>
                              {currentStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={`text-[11px] font-bold leading-tight ${currentStep >= 2 ? 'text-primary' : 'text-outline'}`}>
                              تم التأكيد
                            </span>
                            <span className="text-[10px] text-on-surface-variant hidden sm:inline">
                              تجهيز وتغليف
                            </span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 3 ? 'bg-blue-600 text-white shadow-md' : 'bg-surface-container text-outline'
                            }`}>
                              {currentStep > 3 ? '✓' : '3'}
                            </div>
                            <span className={`text-[11px] font-bold leading-tight ${currentStep >= 3 ? 'text-blue-700' : 'text-outline'}`}>
                              قيد التوصيل
                            </span>
                            <span className="text-[10px] text-on-surface-variant hidden sm:inline">
                              مع الموزع
                            </span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-surface-container text-outline'
                            }`}>
                              {currentStep >= 4 ? '✓' : '4'}
                            </div>
                            <span className={`text-[11px] font-bold leading-tight ${currentStep >= 4 ? 'text-emerald-700' : 'text-outline'}`}>
                              تم التسليم
                            </span>
                            <span className="text-[10px] text-on-surface-variant hidden sm:inline">
                              دفع عند الباب
                            </span>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Delivery Partner Tracking Card (Yalidine / ZR Express) */}
                    {order.tracking_number && (
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-5 rounded-2xl border border-blue-200/80 space-y-3 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-blue-950">
                                  شركة التوصيل المعتمدة: {order.delivery_provider === 'zr_express' ? 'ZR Express' : 'Yalidine Express'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900 font-bold text-[10px]">
                                  شحنة رسمية
                                </span>
                              </div>
                              <span className="text-xs text-blue-800 block mt-0.5">
                                كود تتبع الطرد: <strong className="font-mono text-sm font-black text-blue-950 tracking-wider" dir="ltr">{order.tracking_number}</strong>
                              </span>
                            </div>
                          </div>

                          {order.delivery_tracking_url && (
                            <a
                              href={order.delivery_tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-pill bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3.5 font-bold flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-sm transition-all"
                            >
                              <span>تتبع لدى {order.delivery_provider === 'zr_express' ? 'ZR' : 'ياليدين'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {order.delivery_status_raw && (
                          <div className="bg-white/90 p-3 rounded-xl border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>
                              الحالة الحية الآن: <strong className="font-bold text-on-surface">{order.delivery_status_raw}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items Ordered */}
                    <div className="bg-surface-container-low p-4 rounded-2xl space-y-3 border border-primary/5">
                      <span className="text-xs font-bold text-on-surface block">العطور المطلوبة:</span>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <div className="w-10 h-10 rounded-xl bg-white p-1 border shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-on-surface block">{item.name}</span>
                                <span className="text-on-surface-variant text-[11px]">الكمية: {item.qty}</span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-primary">
                              {(item.price * item.qty).toLocaleString('ar-DZ')} دج
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Breakdown */}
                      <div className="pt-3 border-t border-primary/10 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                        <div className="text-on-surface-variant">
                          <span>سعر التوصيل لـ {order.wilaya}: </span>
                          <strong className="text-on-surface">{order.delivery_fee.toLocaleString('ar-DZ')} دج</strong>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-on-surface">المبلغ الإجمالي للدفع عند الاستلام:</span>
                          <span className="text-base font-black text-secondary font-mono">
                            {(order.total_price + order.delivery_fee).toLocaleString('ar-DZ')} دج
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Support Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        <span>يحق لك فتح الطرد ومعاينة العطر قبل دفع المبلغ للموزع.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/213550000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B7%D9%84%D8%A8%D9%8A%D8%AA%D9%8A%20%D8%B1%D9%82%D9%85%20${order.order_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-pill-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>استفسار واتساب</span>
                        </a>

                        <a
                          href="tel:0550000000"
                          className="btn-pill-tonal text-xs py-2 px-4 inline-flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-primary" />
                          <span>اتصال بخدمة الزبائن</span>
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      )}

      {/* Back to Home */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للصفحة الرئيسية للمتجر</span>
        </Link>
      </div>

    </div>
  );
}

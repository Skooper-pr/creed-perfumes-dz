'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { DELIVERY_COMPANIES } from '@/lib/delivery/manager';
import { Order, OrderStatus } from '@/types';
import { siteConfig } from '@/config/site';

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] font-semibold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار الاتصال لتأكيد الطلب</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] text-[#151515] border border-[#151515] font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6E603F]" />
            <span>تم التأكيد • جاري التجهيز الفاخر</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-xs">
            <Truck className="w-3.5 h-3.5" />
            <span>في الطريق إليك مع مندوب التوصيل</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم الاستلام والدفع عند الباب بنجاح</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold text-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>طلب ملغى</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>طرد راجع / مسترجع</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
          خدمة تتبع الشحنات • 58 ولاية
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#151515] tracking-tight">
          تتبع حالة طلبيتك لحظة بلحظة
        </h1>
        <p className="text-xs sm:text-sm text-[#77736B] max-w-md mx-auto leading-relaxed">
          أدخل رقم هاتفك المسجل في الطلب أو كود الطلبية (DZ-XXXXX) للاطلاع على حالة طردك فوراً.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E0D5] max-w-2xl mx-auto shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="trackQuery" className="block text-xs font-semibold text-[#151515] mb-2">
              رقم الهاتف الجزائري أو كود الطلب:
            </label>
            <div className="relative">
              <input
                id="trackQuery"
                type="text"
                dir="ltr"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: 0550123456 أو DZ-84921"
                className="w-full bg-[#FAF8F5] text-[#151515] text-sm sm:text-base pr-11 pl-4 py-3 rounded-xl border border-[#E5E0D5] outline-none focus:border-[#151515] font-mono text-right transition-colors"
              />
              <Search className="w-4 h-4 text-[#77736B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-luxury-primary w-full py-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري البحث عن طلبيتك...</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>تتبع الطلبية</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-[#77736B] mt-3">
          يتم تحديث مسار التوصيل فور تسجيله لدى مندوب شركة النقل في ولايتك.
        </p>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {orders && orders.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto border border-[#E5E0D5]">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-semibold text-[#151515]">لم يتم العثور على أي طلبيات مطابقة</h3>
              <p className="text-xs text-[#77736B] leading-relaxed">
                يرجى التأكد من كتابة نفس رقم الهاتف المستعمل أثناء الطلب أو مراجعة كود الطلبية المسجل.
              </p>
              {siteConfig.contact.whatsappLink && (
                <div className="pt-2">
                  <a
                    href={siteConfig.contact.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-luxury-outline text-xs py-2 px-5 inline-flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تواصل معنا عبر واتساب للمساعدة</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {orders && orders.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#151515]">
                  الطلبيات المسجلة ({orders.length})
                </h2>
                <span className="text-xs text-[#77736B]">مرتبة من الأحدث إلى الأقدم</span>
              </div>

              {orders.map((order) => {
                const currentStep = getStepIndex(order.status);
                const isSpecial = order.status === 'cancelled' || order.status === 'returned';

                return (
                  <div key={order.id} className="bg-white rounded-2xl p-5 sm:p-7 space-y-6 border border-[#E5E0D5]">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0D5]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base sm:text-lg text-[#151515]">
                            #{order.order_number}
                          </span>
                          <span className="text-xs text-[#77736B]">
                            • {new Date(order.created_at).toLocaleDateString('ar-DZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#77736B] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#6E603F]" />
                          <span>ولاية {order.wilaya} ({order.commune})</span>
                        </p>
                      </div>

                      <div className="self-start sm:self-auto">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Timeline Stepper */}
                    {!isSpecial && (
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2 text-center relative">
                          
                          {/* Step 1 */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 1 ? 'bg-[#151515] text-white' : 'bg-[#FAF8F5] text-[#B8B2A6] border border-[#E5E0D5]'
                            }`}>
                              {currentStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={`text-[11px] font-semibold ${currentStep >= 1 ? 'text-[#151515]' : 'text-[#77736B]'}`}>
                              استلام الطلب
                            </span>
                            <span className="text-[10px] text-[#77736B] hidden sm:inline">
                              قيد المراجعة
                            </span>
                          </div>

                          {/* Step 2 */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 2 ? 'bg-[#151515] text-white' : 'bg-[#FAF8F5] text-[#B8B2A6] border border-[#E5E0D5]'
                            }`}>
                              {currentStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={`text-[11px] font-semibold ${currentStep >= 2 ? 'text-[#151515]' : 'text-[#77736B]'}`}>
                              تأكيد الطلب
                            </span>
                            <span className="text-[10px] text-[#77736B] hidden sm:inline">
                              تجهيز وتغليف
                            </span>
                          </div>

                          {/* Step 3 */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-[#FAF8F5] text-[#B8B2A6] border border-[#E5E0D5]'
                            }`}>
                              {currentStep > 3 ? '✓' : '3'}
                            </div>
                            <span className={`text-[11px] font-semibold ${currentStep >= 3 ? 'text-blue-700' : 'text-[#77736B]'}`}>
                              قيد الشحن
                            </span>
                            <span className="text-[10px] text-[#77736B] hidden sm:inline">
                              مع الموزع
                            </span>
                          </div>

                          {/* Step 4 */}
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-[#FAF8F5] text-[#B8B2A6] border border-[#E5E0D5]'
                            }`}>
                              {currentStep >= 4 ? '✓' : '4'}
                            </div>
                            <span className={`text-[11px] font-semibold ${currentStep >= 4 ? 'text-emerald-700' : 'text-[#77736B]'}`}>
                              تم التسليم
                            </span>
                            <span className="text-[10px] text-[#77736B] hidden sm:inline">
                              الدفع نقدًا
                            </span>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Delivery Partner Tracking Card */}
                    {order.tracking_number && (() => {
                      const comp = DELIVERY_COMPANIES[order.delivery_provider || 'yalidine'] || DELIVERY_COMPANIES.yalidine;
                      return (
                        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E0D5] space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0"
                                style={{ backgroundColor: comp.themeColor }}
                              >
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#151515] block">
                                  شركة التوصيل: {comp.name_ar} ({comp.name})
                                </span>
                                <span className="text-xs text-[#77736B] block mt-0.5">
                                  رقم التتبع: <strong className="font-mono text-xs font-bold text-[#151515]" dir="ltr">{order.tracking_number}</strong>
                                </span>
                              </div>
                            </div>

                            {order.delivery_tracking_url && (
                              <a
                                href={order.delivery_tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs py-1.5 px-3 rounded-full bg-white border border-[#E5E0D5] hover:border-[#151515] text-[#151515] font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                              >
                                <span>تتبع الشحنة</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {order.delivery_status_raw && (
                            <div className="bg-white p-2.5 rounded-lg border border-[#E5E0D5] text-xs text-[#151515]">
                              الحالة المحدثة: <strong>{order.delivery_status_raw}</strong>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Items Ordered */}
                    <div className="bg-[#FAF8F5] p-4 rounded-xl space-y-3 border border-[#E5E0D5]/70">
                      <span className="text-xs font-semibold text-[#151515] block">العطور في هذه الطلبية:</span>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <div className="w-10 h-10 rounded-lg bg-white p-1 border border-[#E5E0D5] shrink-0 relative overflow-hidden">
                                  <Image src={item.image} alt={item.name} fill sizes="40px" className="object-contain" />
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-[#151515] block">{item.name}</span>
                                <span className="text-[#77736B] text-[11px]">الكمية: {item.qty}</span>
                              </div>
                            </div>
                            <span className="font-bold text-[#151515]">
                              {(item.price * item.qty).toLocaleString('ar-DZ')} دج
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Breakdown */}
                      <div className="pt-3 border-t border-[#E5E0D5] flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                        <div className="text-[#77736B]">
                          <span>سعر التوصيل: </span>
                          <strong className="text-[#151515]">{order.delivery_fee.toLocaleString('ar-DZ')} دج</strong>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[#77736B]">الإجمالي عند الاستلام:</span>
                          <span className="text-base font-bold text-[#151515]">
                            {order.total_price.toLocaleString('ar-DZ')} دج
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reassurance Note */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#77736B]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#6E603F] shrink-0" />
                        <span>يحق لك فتح الطرد ومعاينة العطر قبل تسليم المبلغ للموزع.</span>
                      </div>

                      {siteConfig.contact.whatsappLink && (
                        <a
                          href={siteConfig.contact.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#151515] hover:text-[#6E603F] font-medium flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>استفسار واتساب</span>
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      )}

      {/* Back to Home */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77736B] hover:text-[#151515] transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة لصفحة المتجر الرئيسية</span>
        </Link>
      </div>

    </div>
  );
}

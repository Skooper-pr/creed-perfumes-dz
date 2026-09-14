'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  User, 
  FileText,
  Filter,
  Eye,
  X,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { getOrders, updateOrderStatus, subscribeToStoreChanges } from '@/lib/store';
import { exportOrdersToExcel } from '@/lib/exportOrders';
import { Order, OrderStatus } from '@/types';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const unsubscribe = subscribeToStoreChanges(loadOrders);
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    pending: { label: 'بانتظار التأكيد', bg: 'bg-secondary/15', text: 'text-secondary' },
    confirmed: { label: 'مؤكد وجاري التجهيز', bg: 'bg-primary/10', text: 'text-primary' },
    shipped: { label: 'قيد الشحن (ياليدين/ZR)', bg: 'bg-blue-100', text: 'text-blue-800' },
    delivered: { label: 'تم التسليم واستلام المبلغ', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    cancelled: { label: 'طلب ملغى', bg: 'bg-neutral-100', text: 'text-neutral-600' },
    returned: { label: 'طلب راجع / مسترجع', bg: 'bg-rose-100', text: 'text-rose-800' },
  };

  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (selectedStatus !== 'all' && o.status !== selectedStatus) {
      return false;
    }
    // Wilaya filter
    if (selectedWilaya !== 'all' && o.wilaya_code !== selectedWilaya) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.phone.includes(q);
      if (!matchNumber && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            <span>لوحة الإدارة</span>
            <span>•</span>
            <span className="text-primary font-bold">إدارة طلبيات الـ 58 ولاية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            طلبيات الزبائن (COD)
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            إجمالي {orders.length} طلبية مسجلة عبر الموقع بالدينار الجزائري (دج).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-2xl border border-primary/5">
            <span className="text-xs font-bold text-on-surface-variant">غير المؤكدة:</span>
            <span className="text-sm font-black text-secondary">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          </div>

          {/* Export to Excel Primary Button */}
          <button
            onClick={() => exportOrdersToExcel(filteredOrders, selectedStatus !== 'all' ? selectedStatus : 'filtered')}
            className="btn-pill bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2.5 px-4 font-bold flex items-center gap-2 shadow-sm transition-all"
            title="تصدير الطلبيات المعروضة في الجدول حالياً إلى ملف Excel مع كامل معلومات الزبائن والعنوان"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير Excel ({filteredOrders.length})</span>
          </button>

          {filteredOrders.length !== orders.length && (
            <button
              onClick={() => exportOrdersToExcel(orders, 'All_Orders')}
              className="btn-pill-outline text-xs py-2.5 px-3 font-bold flex items-center gap-1.5 border-emerald-600/30 text-emerald-800 hover:bg-emerald-50"
              title="تصدير جميع طلبيات المتجر بدون أي تصفية"
            >
              <Download className="w-3.5 h-3.5" />
              <span>الكل ({orders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedStatus === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          الكل ({orders.length})
        </button>

        <button
          onClick={() => setSelectedStatus('pending')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'pending'
              ? 'bg-secondary text-white shadow-sm'
              : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
          }`}
        >
          <span>بانتظار التأكيد</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 font-black">
            {orders.filter((o) => o.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('confirmed')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'confirmed'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          <span>مؤكد وتجهيز ({orders.filter((o) => o.status === 'confirmed').length})</span>
        </button>

        <button
          onClick={() => setSelectedStatus('shipped')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'shipped'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          <span>قيد الشحن ({orders.filter((o) => o.status === 'shipped').length})</span>
        </button>

        <button
          onClick={() => setSelectedStatus('delivered')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'delivered'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <span>تم التسليم ({orders.filter((o) => o.status === 'delivered').length})</span>
        </button>

        <button
          onClick={() => setSelectedStatus('cancelled')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedStatus === 'cancelled'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'bg-surface-container text-neutral-600'
          }`}
        >
          <span>ملغى ({orders.filter((o) => o.status === 'cancelled').length})</span>
        </button>

        <button
          onClick={() => setSelectedStatus('returned')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedStatus === 'returned'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          <span>راجعة ({orders.filter((o) => o.status === 'returned').length})</span>
        </button>
      </div>

      {/* Search & Wilaya Filter Bar */}
      <div className="card-stitch p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث برقم الطلبية (DZ-84...)، اسم الزبون، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Wilaya Filter Dropdown */}
        <div className="relative w-full md:w-64">
          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="w-full appearance-none bg-surface-container-low text-on-surface text-xs font-semibold pr-9 pl-4 py-2.5 rounded-full outline-none cursor-pointer focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع الولايات (الـ 58 ولاية)</option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name_ar}
              </option>
            ))}
          </select>
          <MapPin className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

      </div>

      {/* Orders List / Cards (Mobile & Desktop Friendly) */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const conf = statusConfig[order.status] || {
              label: order.status,
              bg: 'bg-surface-container',
              text: 'text-on-surface',
            };
            return (
              <div
                key={order.id}
                className="card-stitch p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/20 transition-all"
              >
                {/* Order info & Customer */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center font-bold font-mono text-xs shrink-0 border border-primary/5">
                    {order.wilaya_code}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-sm text-primary">
                        {order.order_number}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${conf.bg} ${conf.text}`}>
                        {conf.label}
                      </span>
                      <span className="text-[11px] text-outline flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface">
                      <span className="font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-outline" />
                        {order.customer_name}
                      </span>
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-outline" />
                        {order.wilaya} — {order.commune}
                      </span>
                    </div>

                    {/* Items snippet */}
                    <div className="text-[11px] text-on-surface-variant line-clamp-1 pt-0.5">
                      العطور: {order.items.map(i => `${i.name} (${i.qty})`).join('، ')}
                    </div>
                  </div>
                </div>

                {/* Price and Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-primary/5 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant block">المجموع مع التوصيل:</span>
                    <span className="text-base font-black text-primary">
                      {order.total_price.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Direct phone call button (Essential for mobile admin) */}
                    <a
                      href={`tel:${order.phone}`}
                      className="btn-pill bg-emerald-600 text-white hover:bg-emerald-700 py-2 px-3.5 text-xs font-bold shadow-sm flex items-center gap-1.5"
                      title="اتصال مباشر بالزبون لتأكيد الطلب"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">اتصال</span>
                    </a>

                    {/* View Details modal */}
                    <button
                      onClick={() => setActiveOrder(order)}
                      className="btn-pill bg-surface-container text-primary hover:bg-primary hover:text-white py-2 px-3.5 text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>التفاصيل</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card-stitch text-center py-16 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-outline" />
            <h3 className="text-base font-bold text-on-surface">لا توجد طلبيات تطابق هذا التحديد</h3>
            <p className="text-xs text-on-surface-variant">جرب تغيير حالة الطلب أو البحث باسم آخر.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal / Drawer */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative border border-primary/10">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-primary/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-on-surface font-mono">
                    {activeOrder.order_number}
                  </h2>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${statusConfig[activeOrder.status]?.bg} ${statusConfig[activeOrder.status]?.text}`}>
                    {statusConfig[activeOrder.status]?.label}
                  </span>
                </div>
                <span className="text-xs text-outline block mt-1">
                  تاريخ الطلب: {new Date(activeOrder.created_at).toLocaleString('ar-DZ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportOrdersToExcel([activeOrder], activeOrder.order_number)}
                  className="btn-pill-outline text-xs py-1.5 px-3 flex items-center gap-1.5 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 font-bold"
                  title="تصدير بيانات هذه الطلبية إلى ملف Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>تصدير Excel</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="w-8 h-8 rounded-full bg-surface-container text-outline hover:text-on-surface flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-surface-container-low p-4 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface text-sm">{activeOrder.customer_name}</span>
                {/* One touch call button */}
                <a
                  href={`tel:${activeOrder.phone}`}
                  className="btn-pill bg-emerald-600 text-white py-1.5 px-3 text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Phone className="w-3 h-3" />
                  <span>اتصال الآن ({activeOrder.phone})</span>
                </a>
              </div>

              {activeOrder.phone_secondary && (
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>هاتف إضافي:</span>
                  <a href={`tel:${activeOrder.phone_secondary}`} className="text-primary font-bold hover:underline font-mono" dir="ltr">
                    {activeOrder.phone_secondary}
                  </a>
                </div>
              )}

              <div className="border-t border-primary/5 pt-2 space-y-1">
                <div className="flex items-start gap-1 text-on-surface font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                  <span>{activeOrder.wilaya} — بلدية {activeOrder.commune}</span>
                </div>
                <p className="text-on-surface-variant pr-4">
                  العنوان: {activeOrder.address}
                </p>
                {activeOrder.notes && (
                  <div className="p-2.5 rounded-xl bg-surface-container text-on-surface-variant text-[11px] mt-2">
                    <strong>ملاحظات الزبون:</strong> {activeOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-on-surface">العطور المطلوبة ({activeOrder.items.length})</h3>
              <div className="space-y-2">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-primary/5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container p-1 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="font-bold text-on-surface block">{item.name}</span>
                        <span className="text-outline">الكمية: {item.qty} × {item.price.toLocaleString('ar-DZ')} دج</span>
                      </div>
                    </div>
                    <span className="font-black text-primary">
                      {(item.price * item.qty).toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="border-t border-primary/10 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>سعر التوصيل للموزع ({activeOrder.wilaya}):</span>
                  <span className="font-semibold">{activeOrder.delivery_fee} دج</span>
                </div>
                <div className="flex justify-between text-sm font-black text-on-surface pt-1 border-t border-primary/5">
                  <span>المبلغ الإجمالي المستحق عند الاستلام:</span>
                  <span className="text-primary text-base">{activeOrder.total_price.toLocaleString('ar-DZ')} دج</span>
                </div>
              </div>
            </div>

            {/* Status Change Control */}
            <div className="space-y-2 pt-2 border-t border-primary/10">
              <span className="text-xs font-bold text-on-surface block">تحديث حالة الطلبية:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(activeOrder.id, 'confirmed')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeOrder.status === 'confirmed'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-container hover:bg-primary/10 text-primary border-transparent'
                  }`}
                >
                  ✓ تأكيد الطلبية
                </button>

                <button
                  onClick={() => handleStatusChange(activeOrder.id, 'shipped')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeOrder.status === 'shipped'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-transparent'
                  }`}
                >
                  🚚 قيد الشحن
                </button>

                <button
                  onClick={() => handleStatusChange(activeOrder.id, 'delivered')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeOrder.status === 'delivered'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-transparent'
                  }`}
                >
                  💰 تم التسليم والدفع
                </button>

                <button
                  onClick={() => handleStatusChange(activeOrder.id, 'pending')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeOrder.status === 'pending'
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-transparent'
                  }`}
                >
                  ⏳ معلقة (Pending)
                </button>

                <button
                  onClick={() => handleStatusChange(activeOrder.id, 'cancelled')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeOrder.status === 'cancelled'
                      ? 'bg-neutral-800 text-white border-neutral-800'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-transparent'
                  }`}
                >
                  ✕ إلغاء الطلبية
                </button>

                <button
                  onClick={() => handleStatusChange(activeOrder.id, 'returned')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    activeOrder.status === 'returned'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-transparent'
                  }`}
                >
                  🔄 راجعة / مسترجعة
                </button>
              </div>

              {/* Automatic Stock Management Hint */}
              <div className="p-3 rounded-xl bg-surface-container text-[11px] text-on-surface-variant flex items-start gap-2 border border-primary/5 mt-3">
                <span className="text-secondary font-bold shrink-0">⚡ نظام المخزون الآلي:</span>
                <span>
                  عند نقل الطلبية إلى <strong>(مؤكدة، قيد الشحن، تم التسليم)</strong> يتم خصم كمية المنتجات من المخزون تلقائياً. وإذا تم تحويلها إلى <strong>(معلقة، ملغاة، راجعة)</strong> يتم استرجاع المخزون تلقائياً دون أي تدخل منك.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

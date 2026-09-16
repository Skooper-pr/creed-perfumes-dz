'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Clock, 
  Banknote, 
  Package, 
  ArrowLeft, 
  Phone, 
  AlertTriangle, 
  PlusCircle, 
  Eye, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { getOrders, getProducts } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Order, Product } from '@/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [o, p] = await Promise.all([getOrders(), getProducts()]);
        setOrders(o);
        setProducts(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute key KPIs
  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at).toDateString() === today
  );

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const confirmedOrDelivered = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'shipped' || o.status === 'delivered'
  );

  const totalMonthlySales = confirmedOrDelivered.reduce(
    (acc, o) => acc + (Number(o.total_price) || 0),
    0
  );

  const lowStockProducts = products.filter((p) => (p.stock ?? 0) <= 5);
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);

  const recentOrders = orders.slice(0, 6);

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'بانتظار التأكيد', color: 'bg-secondary/15 text-secondary' },
    confirmed: { label: 'مؤكد وجاري التجهيز', color: 'bg-primary/10 text-primary' },
    shipped: { label: 'قيد الشحن', color: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'تم التسليم بنجاح', color: 'bg-emerald-100 text-emerald-800' },
    cancelled: { label: 'ملغى', color: 'bg-neutral-100 text-neutral-600' },
    returned: { label: 'طرد مسترجع', color: 'bg-amber-100 text-amber-800' },
  };

  return (
    <div className="space-y-8">
      
      {/* Offline Database Warning Banner */}
      {!isSupabaseConfigured() && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold text-sm">تنبيه: المتجر يعمل حالياً بالوضع التجريبي المحلي (غير متصل بـ Supabase)</strong>
            <p>
              أي تعديلات على العطور أو الطلبيات سيتم حفظها محلياً فقط في هذا المتصفح. تأكد من ضبط <code>NEXT_PUBLIC_SUPABASE_URL</code> و <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> في إعدادات Netlify للربط الفعلي.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner / Welcome Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            <span>لوحة التحكم الرقمية</span>
            <span>•</span>
            <span className="text-primary">إدارة المبيعات والمخزون</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            نظرة عامة على نشاط المتجر
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            إحصائيات فورية لطلبيات الـ 58 ولاية، وتأكيد المبيعات بالدينار الجزائري (دج).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/orders"
            className="btn-pill-primary text-xs sm:text-sm py-2.5 px-5 shadow-stitch-glow flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>معالجة الطلبيات ({pendingOrders.length})</span>
          </Link>
          <Link
            href="/admin/products"
            className="btn-pill-soft text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة عطر</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric KPI Cards (Google Stitch Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Today's Orders */}
        <div className="card-stitch flex flex-col justify-between p-5">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block mb-1">طلبات اليوم</span>
            <div className="text-2xl sm:text-3xl font-black text-on-surface">
              {todayOrders.length} <span className="text-sm font-semibold text-outline">طلب</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/5 text-xs text-primary font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> مبيعات اليوم
            </span>
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: Pending Orders (Alert) */}
        <div className="card-stitch flex flex-col justify-between p-5 border-secondary/20">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block mb-1">الطلبات المعلقة</span>
            <div className="text-2xl sm:text-3xl font-black text-secondary">
              {pendingOrders.length} <span className="text-sm font-semibold text-outline">طلب</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/5 text-xs text-secondary font-bold">
            <span>تحتاج اتصال هاتفي</span>
            <div className="w-9 h-9 rounded-full bg-secondary/15 text-secondary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="card-stitch flex flex-col justify-between p-5">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block mb-1">إجمالي المبيعات المؤكدة</span>
            <div className="text-xl sm:text-2xl font-black text-primary truncate">
              {totalMonthlySales.toLocaleString('ar-DZ')} <span className="text-xs font-bold">دج</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/5 text-xs text-emerald-600 font-bold">
            <span>مبيعات هذا الشهر</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 4: Inventory / Stock */}
        <div className="card-stitch flex flex-col justify-between p-5">
          <div>
            <span className="text-xs font-bold text-on-surface-variant block mb-1">المخزون الإجمالي المتاح</span>
            <div className="text-2xl sm:text-3xl font-black text-on-surface">
              {totalStockCount} <span className="text-sm font-semibold text-outline">قارورة</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/5 text-xs text-outline font-bold">
            <span>{products.length} تشكيلات عطرية</span>
            <div className="w-9 h-9 rounded-full bg-surface-container text-tertiary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">تنبيه مخزون: هناك {lowStockProducts.length} عطور قاربت على النفاد</h4>
              <p className="text-xs text-amber-800">
                العطور: {lowStockProducts.map(p => `${p.name} (${p.stock})`).join('، ')}
              </p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-amber-900 hover:underline shrink-0"
          >
            تعديل المخزون
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="card-stitch space-y-4">
        <div className="flex items-center justify-between border-b border-primary/10 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              أحدث طلبيات الزبائن (الدفع عند الاستلام)
            </h2>
            <p className="text-xs text-on-surface-variant">
              يمكنك النقر مباشرة على زر الهاتف للاتصال بالزبون وتأكيد الطلبية فوراً
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>عرض كل الطلبات ({orders.length})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-bold">
                  <th className="p-3 rounded-r-xl">رقم الطلب</th>
                  <th className="p-3">الزبون والهاتف</th>
                  <th className="p-3">الولاية</th>
                  <th className="p-3">العطور المطلوبة</th>
                  <th className="p-3">المجموع</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 rounded-l-xl text-center">اتصال مباشر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {recentOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || {
                    label: order.status,
                    color: 'bg-surface-container text-on-surface',
                  };
                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">
                        {order.order_number}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-on-surface">{order.customer_name}</div>
                        <div className="text-[11px] text-outline font-mono" dir="ltr">{order.phone}</div>
                      </td>
                      <td className="p-3 font-semibold text-on-surface-variant">
                        {order.wilaya}
                      </td>
                      <td className="p-3">
                        <span className="line-clamp-1 max-w-[180px]">
                          {order.items.map(i => `${i.name} (x${i.qty})`).join('، ')}
                        </span>
                      </td>
                      <td className="p-3 font-black text-on-surface">
                        {order.total_price.toLocaleString('ar-DZ')} دج
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <a
                          href={`tel:${order.phone}`}
                          title={`اتصل بـ ${order.customer_name}`}
                          className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center mx-auto transition-colors shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-on-surface-variant">
            لا توجد طلبيات مسجلة بعد. عند قيام الزبائن بالطلب ستظهر هنا فوراً.
          </div>
        )}
      </div>

    </div>
  );
}

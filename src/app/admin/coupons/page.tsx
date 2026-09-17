'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, Ticket, Percent, DollarSign } from 'lucide-react';
import { getCoupons, saveCoupon, deleteCoupon, subscribeToStoreChanges } from '@/lib/store';
import { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minOrderAmount, setMinOrderAmount] = useState<number | ''>('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = subscribeToStoreChanges(load);
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxUses('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setSaving(true);
    try {
      await saveCoupon({
        code: code.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: minOrderAmount ? Number(minOrderAmount) : 0,
        max_uses: maxUses ? Number(maxUses) : null,
        is_active: isActive,
      });

      setIsModalOpen(false);
      setNotice(`تم حفظ كوبون الخصم "${code.trim().toUpperCase()}" بنجاح.`);
      setTimeout(() => setNotice(null), 4000);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await saveCoupon({
        ...coupon,
        is_active: !coupon.is_active,
      });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (confirm(`هل أنت متأكد من حذف الكوبون "${couponCode}"؟`)) {
      await deleteCoupon(id);
      setNotice(`تم حذف الكوبون "${couponCode}".`);
      setTimeout(() => setNotice(null), 4000);
      load();
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            <span>لوحة الإدارة</span>
            <span>•</span>
            <span className="text-primary font-bold">كوبونات الخصم</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            إدارة كوبونات وعروض الخصم
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            إنشاء رموز ترويجية وتحديد نسب أو مبالغ الخصم وشروط تفعيلها في سلة الشراء.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="btn-luxury text-xs px-4 py-2.5 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كوبون جديد</span>
        </button>
      </div>

      {/* Notice */}
      {notice && (
        <div className="p-4 rounded-2xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow-stitch-glow animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#B89B5E]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Coupons List */}
      <div className="card-stitch p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#6E603F]" />
            <h2 className="text-sm font-bold text-on-surface">الكوبونات المسجلة في المتجر ({coupons.length})</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-on-surface-variant">جاري تحميل الكوبونات...</div>
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-xs text-on-surface-variant space-y-2">
            <Ticket className="w-8 h-8 text-outline mx-auto stroke-1" />
            <p>لا توجد أي كوبونات خصم حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  c.is_active
                    ? 'bg-white border-[#E5E0D5] hover:border-[#B89B5E]'
                    : 'bg-[#FAF8F5] border-[#E5E0D5]/50 opacity-60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#151515] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E5E0D5] tracking-wider">
                      {c.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.is_active
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {c.is_active ? 'مفعل' : 'معطل'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#6E603F]">
                    {c.discount_type === 'percentage' ? (
                      <span>خصم {c.discount_value}% من قيمة الطلب</span>
                    ) : (
                      <span>خصم ثابت بقيمة {c.discount_value.toLocaleString('ar-DZ')} دج</span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#77736B] space-y-0.5">
                    {c.min_order_amount ? (
                      <p>الحد الأدنى: {c.min_order_amount.toLocaleString('ar-DZ')} دج</p>
                    ) : null}
                    <p>مرات الاستخدام: {c.used_count} {c.max_uses ? `/ ${c.max_uses}` : ''}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => handleToggleActive(c)}
                    className="text-[11px] text-[#6E603F] hover:underline"
                  >
                    {c.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="حذف الكوبون"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-[#E5E0D5]">
            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <h3 className="font-bold text-lg text-[#151515]">إضافة كود خصم جديد</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#77736B] hover:text-[#151515] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#151515] mb-1">رمز الكوبون *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#FAF8F5] text-[#151515] text-sm px-4 py-2.5 rounded-xl border border-[#E5E0D5] outline-none font-mono uppercase"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#151515] mb-1">نوع الخصم</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-xs px-3 py-2.5 rounded-xl border border-[#E5E0D5] outline-none font-semibold"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (دج)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#151515] mb-1">
                    قيمة الخصم {discountType === 'percentage' ? '(%)' : '(دج)'} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={discountType === 'percentage' ? '15' : '2000'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-xs px-3 py-2.5 rounded-xl border border-[#E5E0D5] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#151515] mb-1">الحد الأدنى للطلب (دج)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-xs px-3 py-2.5 rounded-xl border border-[#E5E0D5] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#151515] mb-1">أقصى عدد استخدامات</label>
                  <input
                    type="number"
                    placeholder="غير محدود"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#FAF8F5] text-[#151515] text-xs px-3 py-2.5 rounded-xl border border-[#E5E0D5] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCoupon"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[#E5E0D5] text-[#151515] focus:ring-0"
                />
                <label htmlFor="isActiveCoupon" className="text-xs font-semibold text-[#151515] cursor-pointer">
                  تفعيل الكوبون فوراً في المتجر
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-[#77736B] hover:text-[#151515] px-4 py-2"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-luxury text-xs px-5 py-2.5"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

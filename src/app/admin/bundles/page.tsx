'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  X, 
  Layers, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  getBundles, 
  saveBundle, 
  deleteBundle, 
  getProducts, 
  uploadPerfumeImage, 
  subscribeToStoreChanges 
} from '@/lib/store';
import { Bundle, Product } from '@/types';

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('مجموعة خاصة');
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadData = async () => {
    try {
      const [bundleList, productList] = await Promise.all([
        getBundles(),
        getProducts(),
      ]);
      setBundles(bundleList);
      setProducts(productList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStoreChanges(loadData);
    return () => unsubscribe();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setBadgeLabel('مجموعة خاصة');
    setDescription('');
    setSelectedProductIds([]);
    setPrice('');
    setDiscountPrice('');
    setImage('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (bundle: Bundle) => {
    setEditingId(bundle.id);
    setName(bundle.name);
    setSlug(bundle.slug);
    setBadgeLabel(bundle.badge_label || 'مجموعة خاصة');
    setDescription(bundle.description || '');
    setSelectedProductIds(bundle.product_ids || []);
    setPrice(bundle.price);
    setDiscountPrice(bundle.discount_price);
    setImage(bundle.image || '');
    setIsActive(bundle.is_active);
    setIsModalOpen(true);
  };

  // Toggle selection of child product
  const toggleProductSelection = (productId: string) => {
    let next: string[];
    if (selectedProductIds.includes(productId)) {
      next = selectedProductIds.filter((id) => id !== productId);
    } else {
      next = [...selectedProductIds, productId];
    }
    setSelectedProductIds(next);

    // Auto-calculate sum of regular prices
    const sum = next.reduce((acc, id) => {
      const p = products.find((prod) => prod.id === id);
      const prodPrice = p ? (p.discount_price ?? p.price) : 0;
      return acc + prodPrice;
    }, 0);
    setPrice(sum);

    // Auto set first child's image if no custom image
    if (!image && next.length > 0) {
      const first = products.find((p) => p.id === next[0]);
      if (first?.images?.[0]) {
        setImage(first.images[0]);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadPerfumeImage(file);
      if (url) {
        setImage(url);
      }
    } catch (err: any) {
      alert(`تعذر رفع الصورة: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى كتابة اسم المجموعة');
      return;
    }
    if (selectedProductIds.length < 2) {
      alert('يرجى اختيار عطرين على الأقل لتكوين المجموعة');
      return;
    }
    if (!discountPrice || Number(discountPrice) <= 0) {
      alert('يرجى تحديد سعر بيع المجموعة');
      return;
    }

    setSaving(true);
    try {
      let finalSlug = slug.trim();
      if (!finalSlug) {
        finalSlug = `bundle-${Date.now()}`;
      }

      await saveBundle({
        id: editingId || undefined,
        name: name.trim(),
        slug: finalSlug,
        badge_label: badgeLabel.trim() || 'مجموعة خاصة',
        description: description.trim(),
        product_ids: selectedProductIds,
        price: Number(price) || Number(discountPrice),
        discount_price: Number(discountPrice),
        image: image || '',
        is_active: isActive,
      });

      setIsModalOpen(false);
      setNotice(editingId ? 'تم تحديث تفاصيل المجموعة بنجاح' : 'تم إنشاء المجموعة الخاصة بنجاح');
      setTimeout(() => setNotice(null), 4000);
      loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'فشل في حفظ المجموعة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, bundleName: string) => {
    if (confirm(`هل أنت متأكد من حذف مجموعة "${bundleName}"؟`)) {
      try {
        await deleteBundle(id);
        setNotice(`تم حذف المجموعة "${bundleName}"`);
        setTimeout(() => setNotice(null), 4000);
        loadData();
      } catch (err: any) {
        alert(err.message || 'فشل في حذف المجموعة');
      }
    }
  };

  const handleToggleActive = async (bundle: Bundle) => {
    try {
      await saveBundle({
        ...bundle,
        is_active: !bundle.is_active,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل في تعديل الحالة');
    }
  };

  const savingsAmount = (Number(price) || 0) - (Number(discountPrice) || 0);

  return (
    <div className="max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5 text-[#6E603F]" />
            <h1 className="text-2xl font-bold text-[#151515]">مجموعات وعروض الهدايا (Bundles)</h1>
          </div>
          <p className="text-xs text-[#77736B]">
            قم بدمج عطرين أو أكثر كطقم متكامل مع خصم خاص لرفع معدل الشراء ومتوسط قيمة السلة (AOV).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-luxury-primary text-xs px-5 py-2.5 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء طقم جديد</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="bg-[#FAF8F5] border border-[#B89B5E]/40 text-[#6E603F] px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-[#6E603F] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Bundles List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#77736B]">
          جاري تحميل المجموعات...
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-12 text-center">
          <Gift className="w-12 h-12 text-[#B89B5E] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[#151515] mb-1">لا توجد مجموعات حالياً</h3>
          <p className="text-xs text-[#77736B] mb-6 max-w-md mx-auto">
            قم بإنشاء أول طقم هدايا يجمع بين أكثر عطور كريد مبيعاً مع تخفيض مشجع لتحفيز الزبائن.
          </p>
          <button
            onClick={openCreateModal}
            className="btn-luxury-primary text-xs px-6 py-2.5"
          >
            إنشاء طقم الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bundles.map((bundle) => {
            const childProducts = products.filter((p) => bundle.product_ids.includes(p.id));
            const totalRegular = bundle.price;
            const offerPrice = bundle.discount_price;
            const diff = totalRegular - offerPrice;

            return (
              <div
                key={bundle.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  bundle.is_active ? 'border-[#E5E0D5] hover:border-[#D5CEBF] shadow-sm' : 'border-[#E5E0D5]/50 opacity-60'
                }`}
              >
                <div>
                  {/* Top Bar: Badge & Active toggle */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      {bundle.badge_label || 'مجموعة خاصة'}
                    </span>
                    <button
                      onClick={() => handleToggleActive(bundle)}
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                        bundle.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border border-stone-200'
                      }`}
                    >
                      {bundle.is_active ? 'مفعلة بالمتجر' : 'معطلة'}
                    </button>
                  </div>

                  {/* Image & Title */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-20 h-20 rounded-xl bg-[#FAF8F5] border border-[#E5E0D5] p-2 flex items-center justify-center shrink-0 relative overflow-hidden">
                      {bundle.image ? (
                        <Image
                          src={bundle.image}
                          alt={bundle.name}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <Gift className="w-8 h-8 text-[#B89B5E]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#151515] line-clamp-1">{bundle.name}</h3>
                      <p className="text-[11px] text-[#77736B] line-clamp-2 mt-1 leading-relaxed">
                        {bundle.description || 'طقم هدايا فاخر يجمع بين عطور الدار المختارة.'}
                      </p>
                    </div>
                  </div>

                  {/* Included Products */}
                  <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E5E0D5]/70 mb-4">
                    <div className="text-[10px] font-semibold text-[#6E603F] uppercase tracking-wider mb-2">
                      العطور المشمولة ({childProducts.length}):
                    </div>
                    <div className="space-y-1.5">
                      {childProducts.map((cp) => (
                        <div key={cp.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#151515] font-medium truncate max-w-[200px]">
                            • {cp.name}
                          </span>
                          <span className="text-[10px] text-[#77736B]">
                            (مخزون: {cp.stock})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-[#E5E0D5]/60 mb-4">
                    <div>
                      <span className="text-xs text-[#77736B] block">سعر المجموعة:</span>
                      <span className="text-xl font-bold text-[#151515]">
                        {offerPrice.toLocaleString('ar-DZ')} دج
                      </span>
                      {diff > 0 && (
                        <span className="text-xs text-[#B8B2A6] line-through mr-2">
                          {totalRegular.toLocaleString('ar-DZ')} دج
                        </span>
                      )}
                    </div>
                    {diff > 0 && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        توفير {diff.toLocaleString('ar-DZ')} دج
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E0D5]/60">
                  <button
                    onClick={() => openEditModal(bundle)}
                    className="p-2 rounded-lg text-[#77736B] hover:text-[#151515] hover:bg-[#FAF8F5] transition-colors"
                    title="تعديل الطقم"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bundle.id, bundle.name)}
                    className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="حذف الطقم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create/Edit Bundle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E5E0D5] max-w-2xl w-full p-6 sm:p-8 my-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 text-[#77736B] hover:text-[#151515]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Gift className="w-5 h-5 text-[#6E603F]" />
              <h2 className="text-lg font-bold text-[#151515]">
                {editingId ? 'تعديل طقم الهدايا' : 'إنشاء طقم هدايا جديد'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                    اسم المجموعة / الطقم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: طقم الملوك: أفينتوس + سلفر ماونتن"
                    required
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#6E603F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                    شارة العرض (Badge Label)
                  </label>
                  <input
                    type="text"
                    value={badgeLabel}
                    onChange={(e) => setBadgeLabel(e.target.value)}
                    placeholder="مثال: مجموعة خاصة • توفير 7,400 دج"
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#6E603F]"
                  />
                </div>
              </div>

              {/* Slug & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                    المعرف الرابط (Slug)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="تلقائي إن تُرِك فارغاً"
                    className="w-full bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#6E603F] ltr"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_active_bundle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#151515] rounded cursor-pointer"
                  />
                  <label htmlFor="is_active_bundle" className="text-xs font-semibold text-[#151515] cursor-pointer">
                    تفعيل وظهور الطقم في المتجر
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                  الوصف التسويقي للطقم
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="وصف مختصر لمزايا الطقم وانسجام العطور المشمولة..."
                  className="w-full bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#6E603F]"
                />
              </div>

              {/* Product Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                  اختر العطور المكونة للطقم (عطرين على الأقل) <span className="text-rose-500">*</span>
                </label>
                <div className="border border-[#E5E0D5] rounded-xl p-3 max-h-56 overflow-y-auto space-y-2 bg-[#FAF8F5]/50">
                  {products.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    const prodPrice = p.discount_price ?? p.price;
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelection(p.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-white border-[#B89B5E] shadow-sm'
                            : 'bg-white/60 border-transparent hover:bg-white hover:border-[#E5E0D5]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-[#151515] border-[#151515] text-white'
                                : 'border-[#B8B2A6] bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="w-8 h-8 rounded bg-[#FAF8F5] border border-[#E5E0D5] relative overflow-hidden shrink-0">
                            {p.images?.[0] && (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                className="object-contain p-0.5"
                              />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-[#151515] block">{p.name}</span>
                            <span className="text-[10px] text-[#77736B]">مخزون: {p.stock} قطعة</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-[#151515]">
                          {prodPrice.toLocaleString('ar-DZ')} دج
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E0D5]">
                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                    السعر المرجعي الإجمالي (دج)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="مجموع أسعار العطور الفردية"
                    className="w-full bg-white border border-[#E5E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#151515] focus:outline-none focus:border-[#6E603F]"
                  />
                  <span className="text-[10px] text-[#77736B] mt-1 block">
                    يُحسب تلقائياً عند تحديد العطور (يمكن تعديله)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                    سعر بيع الطقم للزبون (دج) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="السعر النهائي المخفض"
                    required
                    className="w-full bg-white border border-[#B89B5E] rounded-xl px-3.5 py-2.5 text-xs text-[#151515] font-bold focus:outline-none focus:ring-1 focus:ring-[#6E603F]"
                  />
                  {savingsAmount > 0 && (
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                      توفير للزبون: {savingsAmount.toLocaleString('ar-DZ')} دج (
                      {Math.round((savingsAmount / (Number(price) || 1)) * 100)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-[#151515] mb-1.5">
                  صورة الطقم
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#E5E0D5] relative overflow-hidden flex items-center justify-center shrink-0">
                    {image ? (
                      <Image
                        src={image}
                        alt="Bundle image"
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <Gift className="w-6 h-6 text-[#B89B5E]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="bundle_img_upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="bundle_img_upload"
                      className="btn-luxury-outline text-xs px-4 py-2 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'جاري الرفع...' : 'رفع صورة خاصة بالطقم'}</span>
                    </label>
                    <span className="text-[10px] text-[#77736B] block mt-1">
                      (تلقائياً يتم استخدام صورة أول عطر تم اختياره إن لم ترفع صورة خاصة)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs text-[#77736B] hover:text-[#151515] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="btn-luxury-primary text-xs px-7 py-2.5 disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : editingId ? 'تحديث الطقم' : 'حفظ ونشر الطقم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

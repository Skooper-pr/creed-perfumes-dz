'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  Sparkles, 
  X, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { getProducts, getCategories, saveProduct, deleteProduct, uploadPerfumeImage, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('cat-men');
  const [brand, setBrand] = useState('Creed');
  const [concentration, setConcentration] = useState('Eau De Parfum');
  const [size, setSize] = useState('100ml');
  const [stock, setStock] = useState<number | ''>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [topNotes, setTopNotes] = useState('');
  const [heartNotes, setHeartNotes] = useState('');
  const [baseNotes, setBaseNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('صيغة الملف غير مدعومة. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.');
      return;
    }

    // Validate size (max 5 MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      alert('حجم الصورة كبير جداً (أكثر من 5 ميغابايت). يرجى اختيار صورة أصغر حجماً لتسريع تحميل المتجر.');
      return;
    }

    setUploadingImage(true);
    try {
      const publicUrl = await uploadPerfumeImage(file);
      if (publicUrl) {
        setImageUrl(publicUrl);
        setStatusNotice('تم رفع صورة العطر بنجاح!');
        setTimeout(() => setStatusNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatusNotice('فشل رفع الصورة.');
    } finally {
      setUploadingImage(false);
    }
  };

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
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

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setCategoryId(categories[1]?.id || 'cat-men');
    setBrand('Creed');
    setConcentration('Eau De Parfum');
    setSize('100ml');
    setStock(15);
    setImageUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm');
    setIsFeatured(false);
    setTopNotes('برغموت إيطالي، فواكه ملكية');
    setHeartNotes('أخشاب البتولا، ياسمين فاخر');
    setBaseNotes('عنبر الحوت، مسك نقي');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setDiscountPrice(p.discount_price ?? '');
    setCategoryId(p.category_id);
    setBrand(p.brand);
    setConcentration(p.concentration || 'Eau De Parfum');
    setSize(p.size || '100ml');
    setStock(p.stock);
    setImageUrl(p.images[0] || '');
    setIsFeatured(p.is_featured);
    setTopNotes(p.fragrance_notes?.top?.join('، ') || '');
    setHeartNotes(p.fragrance_notes?.heart?.join('، ') || '');
    setBaseNotes(p.fragrance_notes?.base?.join('، ') || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSaving(true);
    const cat = categories.find(c => c.id === categoryId);

    try {
      const saved = await saveProduct({
        id: editingProduct?.id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        category_id: categoryId,
        category_name: cat?.name || 'تشكيلة عامة',
        brand: brand.trim() || 'Creed',
        concentration: concentration.trim(),
        size: size.trim(),
        stock: Number(stock || 0),
        images: [imageUrl.trim() || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'],
        is_featured: isFeatured,
        fragrance_notes: {
          top: topNotes.split(/[,،]+/).map(s => s.trim()).filter(Boolean),
          heart: heartNotes.split(/[,،]+/).map(s => s.trim()).filter(Boolean),
          base: baseNotes.split(/[,،]+/).map(s => s.trim()).filter(Boolean),
        }
      });

      setIsModalOpen(false);
      setStatusNotice(`تم حفظ عطر "${saved.name}" بنجاح!`);
      setTimeout(() => setStatusNotice(null), 4000);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (confirm(`هل أنت متأكد من حذف عطر "${prodName}" من قائمة المنتجات؟`)) {
      await deleteProduct(id);
      setStatusNotice(`تم حذف عطر "${prodName}".`);
      setTimeout(() => setStatusNotice(null), 4000);
      loadData();
    }
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
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
            <span className="text-primary font-bold">إدارة المنتجات والمخزون</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            مخزون عطور Creed
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            إضافة وتعديل العطور، وضبط الأسعار بالدينار الجزائري (دج) والمخزون.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-pill-primary text-xs sm:text-sm py-3 px-6 shadow-stitch-glow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة عطر جديد</span>
        </button>
      </div>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div className="p-4 rounded-2xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow-stitch-glow animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-secondary-fixed" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="card-stitch p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث باسم العطر أو التركيز..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            الكل ({products.length})
          </button>
          {categories.filter(c => c.slug !== 'all').map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const activePrice = p.discount_price ?? p.price;
          return (
            <div key={p.id} className="card-stitch p-4 flex flex-col justify-between space-y-3">
              
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-2xl bg-surface-container-low p-2 shrink-0 flex items-center justify-center border border-primary/5">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider truncate">
                      {p.category_name || p.brand}
                    </span>
                    {p.is_featured && (
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        مميز
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-on-surface truncate">{p.name}</h3>
                  <div className="flex items-baseline gap-1 text-xs">
                    <span className="font-black text-primary">
                      {activePrice.toLocaleString('ar-DZ')} دج
                    </span>
                    {p.discount_price && (
                      <span className="text-[10px] text-outline line-through">
                        {p.price.toLocaleString('ar-DZ')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                    <span>المخزون: <strong className={p.stock < 5 ? 'text-red-600 font-bold' : 'text-on-surface font-bold'}>{p.stock} قطعة</strong></span>
                    <span>•</span>
                    <span>{p.size || '100ml'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-primary/5 pt-3 flex items-center justify-between gap-2">
                <a
                  href={`/products/${p.slug}`}
                  target="_blank"
                  className="text-xs text-outline hover:text-primary font-semibold"
                >
                  معاينة المتجر ↗
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-full bg-surface-container text-primary hover:bg-primary hover:text-white transition-colors"
                    title="تعديل العطر"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    title="حذف العطر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative border border-primary/10">
            
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-on-surface">
                  {editingProduct ? 'تعديل بيانات العطر' : 'إضافة عطر جديد للتشكيلة'}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  أدخل تفاصيل العطر والأسعار بالدينار الجزائري (دج)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container text-outline hover:text-on-surface flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">اسم العطر بالكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Creed Aventus"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">الماركة / الدار</label>
                  <input
                    type="text"
                    placeholder="Creed"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>
              </div>

              {/* Price & Discount Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-on-surface mb-1">السعر العادي (دج) *</label>
                  <input
                    type="number"
                    required
                    placeholder="38500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">سعر الخصم / العرض (دج) (اختياري)</label>
                  <input
                    type="number"
                    placeholder="32900"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-surface-container-low text-on-surface text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Category, Concentration, Size, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">الفئة</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary cursor-pointer font-semibold"
                  >
                    {categories.filter(c => c.slug !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">التركيز</label>
                  <input
                    type="text"
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    placeholder="Eau De Parfum"
                    className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">الحجم</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="100ml"
                    className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">المخزون (قطع)</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                    placeholder="10"
                    className="w-full bg-surface-container-low text-on-surface text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block font-bold text-on-surface mb-1">صورة العطر</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary font-mono text-left"
                      dir="ltr"
                    />
                    {imageUrl && (
                      <div className="w-10 h-10 rounded-xl bg-surface-container-low p-1 shrink-0 border overflow-hidden">
                        <img src={imageUrl} alt="preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="btn-pill-tonal cursor-pointer text-xs py-2 px-4 flex items-center gap-2 inline-flex">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>{uploadingImage ? 'جاري رفع الصورة...' : 'رفع صورة من الجهاز / الهاتف'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-on-surface-variant">يتم حفظها في Supabase Storage</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-on-surface mb-1">الوصف وقصة العطر</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مشوق لجاذبية العطر وفخامته..."
                  className="w-full bg-surface-container-low text-on-surface text-xs px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Fragrance Notes (Pyramid) */}
              <div className="p-4 rounded-2xl bg-surface-container-low space-y-3">
                <span className="font-bold text-primary block">الهرم العطري (مفصولة بفاصلة):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">قمة العطر (Top)</label>
                    <input
                      type="text"
                      value={topNotes}
                      onChange={(e) => setTopNotes(e.target.value)}
                      placeholder="برغموت، أناناس..."
                      className="w-full bg-surface text-on-surface text-xs px-3 py-2 rounded-xl outline-none border border-primary/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">قلب العطر (Heart)</label>
                    <input
                      type="text"
                      value={heartNotes}
                      onChange={(e) => setHeartNotes(e.target.value)}
                      placeholder="أخشاب، ياسمين..."
                      className="w-full bg-surface text-on-surface text-xs px-3 py-2 rounded-xl outline-none border border-primary/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">قاعدة العطر (Base)</label>
                    <input
                      type="text"
                      value={baseNotes}
                      onChange={(e) => setBaseNotes(e.target.value)}
                      placeholder="عنبر، مسك، فانيليا..."
                      className="w-full bg-surface text-on-surface text-xs px-3 py-2 rounded-xl outline-none border border-primary/10"
                    />
                  </div>
                </div>
              </div>

              {/* Is Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isFeatured" className="font-bold text-on-surface cursor-pointer">
                  تمييز العطر في الصفحة الرئيسية (Featured)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-primary/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill-soft py-2.5 px-5 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-pill-primary py-2.5 px-6 text-xs font-bold shadow-stitch-glow"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ بيانات العطر'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

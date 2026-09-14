'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  Truck, 
  Clock, 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus,
  Layers,
  Ban
} from 'lucide-react';
import { getProductBySlug, getProducts, subscribeToStoreChanges } from '@/lib/store';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        if (!slug) return;
        const item = await getProductBySlug(slug);
        setProduct(item);
        if (item) {
          const all = await getProducts();
          setRelatedProducts(all.filter(p => p.id !== item.id).slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const unsubscribe = subscribeToStoreChanges(load);
    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-on-surface-variant">جاري تحميل تفاصيل العطر...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-on-surface">عذراً، لم يتم العثور على هذا العطر</h2>
        <p className="text-sm text-on-surface-variant">قد يكون الرابط غير صحيح أو تم نقل العطر.</p>
        <Link href="/products" className="btn-pill-primary text-sm inline-flex items-center gap-2">
          <span>العودة لجميع العطور</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const activePrice = product.discount_price ?? product.price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discount_price as number)) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
  };

  const handleDirectBuy = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">جميع العطور</Link>
        <span>/</span>
        <span className="text-primary truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* RIGHT COLUMN in RTL: Image Gallery (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="aspect-square rounded-3xl bg-gradient-to-tr from-surface-container-high/60 via-surface-container-low to-surface-container-lowest p-6 sm:p-10 flex items-center justify-center relative overflow-hidden shadow-stitch border border-primary/5">
            <div className="absolute w-64 h-64 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />

            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
              {isOutOfStock ? (
                <span className="bg-red-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5" />
                  <span>نفذت الكمية</span>
                </span>
              ) : hasDiscount ? (
                <span className="bg-secondary text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  وفر {discountPercent}%
                </span>
              ) : null}
              {product.is_featured && !isOutOfStock && (
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  <span>عطر مميز</span>
                </span>
              )}
            </div>

            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl z-10 transition-all duration-300 hover:scale-105"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl p-2 bg-surface-container-low border-2 transition-all flex items-center justify-center shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-primary shadow-sm'
                      : 'border-transparent hover:border-primary/30'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LEFT COLUMN in RTL: Olfactory Details & Sticky Purchase Box (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                {product.brand} • {product.concentration || 'Eau De Parfum'}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-on-surface bg-surface-container px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                <span>{product.rating || 4.9}</span>
                <span className="text-on-surface-variant font-normal">({product.review_count || 120} تقييم)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-outline font-semibold mt-1">
              حجم العبوة: {product.size || '100ml'} • تركيز زيت عطري فاخر
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/5 flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant block mb-0.5">السعر بالدينار الجزائري</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">
                  {activePrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm font-bold text-on-surface-variant">دج</span>
                {hasDiscount && (
                  <span className="text-sm text-outline line-through">
                    {product.price.toLocaleString('ar-DZ')} دج
                  </span>
                )}
              </div>
            </div>

            <div className="text-left">
              {isOutOfStock ? (
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-black border border-red-200 shadow-sm">
                    <Ban className="w-3.5 h-3.5" />
                    <span>نفذت الكمية (غير متوفر)</span>
                  </span>
                  <p className="text-[11px] text-red-600 font-semibold mt-1">الطلب غير متاح حالياً</p>
                </div>
              ) : (
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>متوفر في المخزون</span>
                  </span>
                  <p className="text-[11px] text-on-surface-variant mt-1">الدفع عند الاستلام (COD)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface mb-2">قصة العطر والتركيبة</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="card-stitch space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase">
              <Layers className="w-4 h-4 text-secondary" />
              <span>الهرم العطري والنوتات التكوينية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-primary block mb-1">
                    قمة العطر (Top)
                  </span>
                  <p className="text-xs text-on-surface-variant leading-normal">
                    {product.fragrance_notes?.top?.join('، ') || 'برغموت منعش، فواكه ملكية'}
                  </p>
                </div>
                <span className="text-[10px] text-outline mt-2">الانطباع الأول (15 دقيقة)</span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-secondary block mb-1">
                    قلب العطر (Heart)
                  </span>
                  <p className="text-xs text-on-surface-variant leading-normal">
                    {product.fragrance_notes?.heart?.join('، ') || 'أخشاب البتولا، ياسمين فاخر'}
                  </p>
                </div>
                <span className="text-[10px] text-outline mt-2">جوهر العطر (ساعات)</span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-tertiary block mb-1">
                    قاعدة العطر (Base)
                  </span>
                  <p className="text-xs text-on-surface-variant leading-normal">
                    {product.fragrance_notes?.base?.join('، ') || 'عنبر الحوت، مسك نقي، فانيليا'}
                  </p>
                </div>
                <span className="text-[10px] text-outline mt-2">الثبات المستمر (+24 ساعة)</span>
              </div>
            </div>
          </div>

          {/* Purchase Actions or Out of Stock Alert */}
          {isOutOfStock ? (
            <div className="p-5 rounded-3xl bg-red-50/80 border border-red-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-700 font-black text-base">
                <Ban className="w-5 h-5" />
                <span>عذراً، هذا العطر غير متوفر حالياً في المخزون (نفذت الكمية)</span>
              </div>
              <p className="text-xs text-red-600 leading-relaxed max-w-md mx-auto">
                تم نفاد كامل الكمية المتوفرة من هذا العطر الملكي. يمكنك تصفح باقي العطور الأيقونية المتوفرة للطلب الفوري.
              </p>
              <Link
                href="/products"
                className="btn-pill-primary text-xs py-3 px-8 inline-flex items-center gap-2 shadow-stitch-glow"
              >
                <span>تصفح تشكيلة العطور المتوفرة</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-on-surface">الكمية:</span>
                <div className="flex items-center bg-surface-container rounded-full p-1 border border-primary/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-sm"
                    aria-label="إنقاص الكمية"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-black text-on-surface">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-on-surface hover:text-primary transition-colors shadow-sm"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-on-surface-variant">
                  الإجمالي: {(activePrice * quantity).toLocaleString('ar-DZ')} دج
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDirectBuy}
                  className="btn-pill-secondary flex-1 text-sm py-4 shadow-stitch-coral"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>اطلب الآن مباشرة (الدفع عند الاستلام)</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="btn-pill-primary flex-1 text-sm py-4 shadow-stitch-glow"
                >
                  <span>أضف إلى سلة المشتريات</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-primary/10 text-xs">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>توصيل لـ 58 ولاية (24 - 48 ساعة)</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
              <span>معاينة العطر قبل الدفع للموزع</span>
            </div>
          </div>

        </div>

      </div>

      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              عطور أخرى قد تروق لك من دار Creed
            </h2>
            <Link href="/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>عرض الكل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

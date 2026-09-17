'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
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
import { trackViewContent } from '@/lib/tracking';
import { ProductCard } from '@/components/ProductCard';
import { Loader } from '@/components/Loader';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isJustAdded, setIsJustAdded] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        if (!slug) return;
        const item = await getProductBySlug(slug);
        setProduct(item);
        if (item) {
          // Update document.title client-side so the tab matches the real product
          const activePrice = item.discount_price ?? item.price;
          document.title = `${item.name} (${item.size || '100ml'}) - ${activePrice.toLocaleString('ar-DZ')} دج | Creed Perfumes الجزائر`;
          trackViewContent({
            id: item.id,
            name: item.name,
            price: activePrice,
            category: item.category_name,
          });
          const all = await getProducts();
          setRelatedProducts(all.filter((p) => p.id !== item.id).slice(0, 4));
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
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <Loader
          text="جاري تحميل تفاصيل العطر..."
          subtext="خدمة التوصيل متوفرة لكافة الـ 58 ولاية جزائرية مع الدفع عند الاستلام"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#151515]">عذراً، لم يتم العثور على هذا العطر</h2>
        <p className="text-xs sm:text-sm text-[#77736B]">قد يكون الرابط غير صحيح أو تم تحديث الصفحة.</p>
        <Link href="/products" className="btn-luxury-primary text-xs sm:text-sm inline-flex items-center gap-2">
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
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 800);
  };

  const handleDirectBuy = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#77736B]">
        <Link href="/" className="hover:text-[#151515] transition-colors">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#151515] transition-colors">جميع العطور</Link>
        <span>/</span>
        <span className="text-[#151515] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* RIGHT COLUMN in RTL: Image Gallery (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="aspect-square rounded-3xl bg-[#FAF8F5] p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden border border-[#E5E0D5] group">
            
            {/* Top Badges */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
              {isOutOfStock ? (
                <span className="bg-[#151515] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5" />
                  <span>نفذت الكمية</span>
                </span>
              ) : hasDiscount ? (
                <span className="bg-white text-[#6E603F] border border-[#E5E0D5] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  خصم {discountPercent}%
                </span>
              ) : null}
            </div>

            <div className="w-full h-full relative">
              <Image
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />
            </div>
          </div>

          {/* Multiple Angles Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl p-2 bg-[#FAF8F5] border transition-all flex items-center justify-center shrink-0 relative overflow-hidden ${
                    selectedImageIndex === idx
                      ? 'border-[#151515] shadow-sm'
                      : 'border-[#E5E0D5] hover:border-[#77736B]'
                  }`}
                  aria-label={`عرض الصورة ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LEFT COLUMN in RTL: Details & Purchase Panes (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
                {product.brand} • {product.concentration || 'Eau De Parfum'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#151515] tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs text-[#77736B] font-medium mt-1">
              الحجم: {product.size || '100ml'} • تركيبة زيتية أصلية مركزة
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#77736B] block mb-0.5">السعر بالدينار الجزائري</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#151515]">
                  {activePrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm font-medium text-[#77736B]">دج</span>
                {hasDiscount && (
                  <span className="text-xs text-[#B8B2A6] line-through mr-1">
                    {product.price.toLocaleString('ar-DZ')} دج
                  </span>
                )}
              </div>
            </div>

            <div className="text-left">
              {isOutOfStock ? (
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F5] text-[#151515] text-xs font-semibold border border-[#E5E0D5]">
                    <Ban className="w-3.5 h-3.5" />
                    <span>نفذت الكمية</span>
                  </span>
                  <p className="text-[10px] text-[#77736B] mt-1">الطلب غير متاح حالياً</p>
                </div>
              ) : (
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F5] text-[#6E603F] text-xs font-semibold border border-[#E5E0D5]">
                    <Check className="w-3.5 h-3.5" />
                    <span>متوفر في المخزون</span>
                  </span>
                  <p className="text-[10px] text-[#77736B] mt-1">الدفع عند الاستلام</p>
                </div>
              )}
            </div>
          </div>

          {/* Story & Description */}
          <div>
            <h3 className="text-sm font-semibold text-[#151515] mb-2">عن العطر والتركيبة</h3>
            <p className="text-xs sm:text-sm text-[#77736B] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Olfactory Notes Pyramid (الهرم العطري) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#151515] uppercase tracking-wide">
              <Layers className="w-4 h-4 text-[#6E603F]" />
              <span>الهرم العطري والنوتات التكوينية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl flex flex-col justify-between border border-[#E5E0D5]/60">
                <div>
                  <span className="text-[11px] font-semibold text-[#6E603F] block mb-1">
                    قمة العطر (Top)
                  </span>
                  <p className="text-xs text-[#151515] leading-normal">
                    {product.fragrance_notes?.top?.join('، ') || 'برغموت منعش، فواكه ملكية'}
                  </p>
                </div>
                <span className="text-[10px] text-[#77736B] mt-2">الانطباع الأول المنعش</span>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-xl flex flex-col justify-between border border-[#E5E0D5]/60">
                <div>
                  <span className="text-[11px] font-semibold text-[#6E603F] block mb-1">
                    قلب العطر (Heart)
                  </span>
                  <p className="text-xs text-[#151515] leading-normal">
                    {product.fragrance_notes?.heart?.join('، ') || 'أخشاب البتولا، ياسمين فاخر'}
                  </p>
                </div>
                <span className="text-[10px] text-[#77736B] mt-2">جوهر العطر المتزن</span>
              </div>

              <div className="bg-[#FAF8F5] p-3.5 rounded-xl flex flex-col justify-between border border-[#E5E0D5]/60">
                <div>
                  <span className="text-[11px] font-semibold text-[#6E603F] block mb-1">
                    قاعدة العطر (Base)
                  </span>
                  <p className="text-xs text-[#151515] leading-normal">
                    {product.fragrance_notes?.base?.join('، ') || 'عنبر الحوت، مسك نقي، فانيليا'}
                  </p>
                </div>
                <span className="text-[10px] text-[#77736B] mt-2">عمق التركيز والفوحان</span>
              </div>
            </div>
          </div>

          {/* Purchasing Actions */}
          {isOutOfStock ? (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D5] text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-[#151515] font-semibold text-sm">
                <Ban className="w-4 h-4" />
                <span>عذراً، هذا العطر غير متوفر حالياً في المخزون</span>
              </div>
              <p className="text-xs text-[#77736B] leading-relaxed max-w-md mx-auto">
                تم نفاد كامل الكمية المتوفرة. يمكنك استكشاف باقي التشكيلات المتوفرة للتسليم الفوري.
              </p>
              <Link
                href="/products"
                className="btn-luxury-outline text-xs px-6 py-2.5 inline-flex items-center gap-2"
              >
                <span>تصفح العطور المتوفرة</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#151515]">الكمية:</span>
                <div className="flex items-center bg-[#FAF8F5] rounded-full p-1 border border-[#E5E0D5]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#151515] hover:bg-[#EFECE4] transition-colors shadow-xs"
                    aria-label="إنقاص الكمية"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[#151515] select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock ?? 10, quantity + 1))}
                    disabled={quantity >= (product.stock ?? 10)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#151515] hover:bg-[#EFECE4] transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-[#77736B]">
                  الإجمالي: <strong className="text-[#151515]">{(activePrice * quantity).toLocaleString('ar-DZ')} دج</strong>
                  {product.stock && quantity >= product.stock && (
                    <span className="text-[10px] text-[#6E603F] block mt-0.5">
                      (الحد الأقصى المتوفر: {product.stock} قطع)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDirectBuy}
                  className="btn-luxury-primary flex-1 text-xs sm:text-sm py-3.5 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>اطلب الآن (الدفع عند الاستلام)</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className={`btn-luxury-outline flex-1 text-xs sm:text-sm py-3.5 transition-colors flex items-center justify-center gap-2 ${
                    isJustAdded ? 'bg-[#151515] text-white border-[#151515]' : ''
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة بنجاح!</span>
                    </>
                  ) : (
                    <span>أضف إلى السلة</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Reassurance Strip */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E5E0D5] text-xs text-[#77736B]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6E603F] shrink-0" />
              <span>توصيل لكافة الـ 58 ولاية</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6E603F] shrink-0" />
              <span>معاينة الطرد والدفع نقدًا عند الباب</span>
            </div>
          </div>

        </div>

      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-[#E5E0D5]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#151515]">
              عطور أخرى من دار Creed
            </h2>
            <Link href="/products" className="text-xs font-semibold text-[#151515] hover:text-[#6E603F] flex items-center gap-1">
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

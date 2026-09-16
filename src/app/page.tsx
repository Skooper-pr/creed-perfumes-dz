'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ArrowLeft, ShieldCheck, Truck, Banknote, Clock, Award } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts, getCategories, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';
import { Loader } from '@/components/Loader';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const [prodList, catList] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodList);
        setCategories(catList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    const unsubscribe = subscribeToStoreChanges(load);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader
          text="جاري تحميل أرقى عطور دار Creed الملكية..."
          subtext="خدمة التوصيل السريع متوفرة لكافة الـ 58 ولاية جزائرية"
          size={1}
        />
      </div>
    );
  }

  const featuredProduct = products.find(p => p.slug === 'creed-aventus') || products[0];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      
      {/* SECTION 1: Dual Feature Hero Showcase (Stitch Layout with Floating Luxury Dynamics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Spotlight (8 Columns in RTL) */}
          <div className="lg:col-span-8 bg-surface-container-low rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-stitch border border-primary/5 flex flex-col justify-between min-h-[500px] shimmer-container">
            {/* Ambient decorative glowing orbs with lively pulse */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/15 blur-3xl animate-aura-pulse pointer-events-none" />
            <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-secondary-container/20 blur-3xl animate-float-slow pointer-events-none" />

            {/* Subtle floating fragrance mist sparkles */}
            <div className="mist-particle top-12 left-1/3 w-2.5 h-2.5 rounded-full bg-secondary/40 blur-[1px]" />
            <div className="mist-particle top-1/2 right-12 w-2 h-2 rounded-full bg-primary/35 blur-[1px]" style={{ animationDelay: '1.2s' }} />
            <div className="mist-particle bottom-20 left-16 w-3 h-3 rounded-full bg-secondary/30 blur-[1px]" style={{ animationDelay: '2.4s' }} />

            {/* Header badges */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-surface-container-highest px-3.5 py-1 rounded-full text-primary font-bold text-xs shadow-sm hover:scale-105 transition-transform cursor-default">
                <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
                <span>الإصدار الملكي الأيقوني • Haute Parfumerie</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant bg-surface-container/60 px-3 py-1 rounded-full">
                حصرياً في الجزائر 🇩🇿
              </span>
            </div>

            {/* Content & Bottle Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 my-auto">
              <div className="md:col-span-7 flex flex-col">
                <span className="text-sm font-bold text-secondary mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  <span>مجموعة دار Creed الملكية</span>
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight mb-2">
                  {featuredProduct?.name || 'Creed Aventus'}
                </h1>
                <p className="text-sm sm:text-base font-bold text-primary mb-3">
                  {featuredProduct?.concentration || 'Eau De Parfum'} • أناناس ملكي، أخشاب البتولا والمسك الأبيض
                </p>
                <p className="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed line-clamp-3">
                  {featuredProduct?.description || 'التوليفة الأسطورية التي تجسد السيادة والجاذبية المطلقة. ثبات لا متناهٍ وحضور يأسر الأنفاس في جميع المناسبات الفاخرة.'}
                </p>

                {/* Price & Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-on-surface">
                      {(featuredProduct?.discount_price ?? featuredProduct?.price ?? 32900).toLocaleString('ar-DZ')}
                    </span>
                    <span className="text-sm font-bold text-on-surface-variant">دج</span>
                    {featuredProduct?.discount_price && (
                      <span className="text-sm text-outline line-through mr-1">
                        {featuredProduct.price.toLocaleString('ar-DZ')} دج
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(featuredProduct?.stock ?? 0) <= 0 ? (
                      <span className="px-5 py-3 rounded-full bg-surface-container-high text-red-600 font-black text-sm border border-red-200">
                        نفذت الكمية (غير متوفر حالياً)
                      </span>
                    ) : (
                      <Link
                        href={`/products/${featuredProduct?.slug || 'creed-aventus'}`}
                        className="btn-pill-primary text-sm shadow-stitch-glow group"
                      >
                        <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>اطلب الآن (الدفع عند الاستلام)</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottle Spotlight Visual with Floating Levitation */}
              <div className="md:col-span-5 flex flex-col justify-center items-center relative py-4">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-surface-container-highest via-surface-container to-surface-container-low p-3 shadow-inner flex items-center justify-center relative group">
                  {/* Ambient aura glow pulsating behind bottle */}
                  <div className="absolute inset-4 rounded-full bg-primary/20 blur-2xl animate-aura-pulse pointer-events-none" />

                  <img
                    src={featuredProduct?.images[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'}
                    alt={featuredProduct?.name || 'Creed Aventus'}
                    className="w-full h-full object-contain drop-shadow-2xl animate-float z-10 group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Synchronized dynamic shadow underneath levitating bottle */}
                  <div className="absolute bottom-2 w-32 h-3.5 rounded-full bg-primary/30 blur-md animate-shadow-scale pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Olfactory Accord Bar */}
            <div className="relative z-10 pt-4 mt-6 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-bold text-on-surface">الانطباع العطري:</span>
                <span className="text-on-surface-variant">ملكي • فواح • يدوم لأكثر من 24 ساعة</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
                <span>توصيل 24 إلى 48 ساعة لباب منزلك</span>
              </div>
            </div>
          </div>

          {/* Secondary Spotlight (4 Columns: Coral Accent Card with Floating Dynamics) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-secondary via-secondary-container to-secondary-dark text-white flex flex-col justify-between min-h-[480px] shadow-stitch-coral shimmer-container">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/20 rounded-full blur-2xl animate-aura-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/25 rounded-full blur-2xl animate-float-slow pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-200 animate-pulse" />
                <span>إصدار محدود للعام الجديد</span>
              </span>
              <Award className="w-5 h-5 text-white/90 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>

            <div className="relative z-10 my-auto text-center py-4">
              <div className="w-40 h-40 mx-auto mb-4 relative flex flex-col items-center justify-center group">
                <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-sm p-3 flex items-center justify-center relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiV5aod7u2d7tdYUVPGzPkTbLk6K0WQx8eM9t_rYUU7wQ6acLw58STGJ5MLKZ_u9VfM0Tu0QRN24hJxj4cUZqUvggBm5vJ44WYFLr6QpToH6XE_jaIQaGg6gt_vRIn54kqUhAiNHj42g2nH28uPlqLo_HmZTJw-fhzbh3jM0WCH2dc7NSvdxvNHPahFHAGfVyPg0hElo_gLRKWGyOoDbLW-gYcU7ZYp6U2shg_k8APkvxu-qN-orzn"
                    alt="Creed Wind Flowers"
                    className="w-full h-full object-contain drop-shadow-2xl animate-float-reverse group-hover:scale-110 transition-transform duration-500 z-10"
                  />
                  {/* Dynamic shadow */}
                  <div className="absolute bottom-1 w-24 h-2.5 rounded-full bg-black/25 blur-sm animate-shadow-scale pointer-events-none" />
                </div>
              </div>
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest block mb-1">
                تشكيلة النساء الفاتنة
              </span>
              <h3 className="text-2xl font-black mb-1">Creed Wind Flowers</h3>
              <p className="text-xs text-white/90 max-w-xs mx-auto mb-4">
                توليفة الياسمين التونسي وخشب الصندل مع لمسة البرالين السويسري.
              </p>
              <div className="text-xl font-black mb-4">
                31,500 دج <span className="text-xs font-normal opacity-80">شامل التوصيل</span>
              </div>
              <Link
                href="/products/creed-wind-flowers"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white text-secondary-dark font-bold text-sm shadow-md hover:bg-surface-container-lowest hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <span>اكتشف العطر واطلب الآن</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative z-10 text-center text-xs text-white/80">
              الدفع نقداً بعد فحص العطر عند الاستلام
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Feature Row with Circular Animated Icons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="card-stitch group flex flex-col items-center text-center p-5 rounded-2xl cursor-default hover:border-primary/30">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3 shadow-inner group-hover:scale-115 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">شحن لجميع الـ 58 ولاية</h4>
            <p className="text-xs text-on-surface-variant mt-1">توصيل سريع حتى باب منزلك مع أفضل شركات النقل</p>
          </div>

          <div className="card-stitch group flex flex-col items-center text-center p-5 rounded-2xl cursor-default hover:border-secondary/30">
            <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-3 shadow-inner group-hover:scale-115 group-hover:rotate-6 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
              <Banknote className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-secondary transition-colors">الدفع عند الاستلام (COD)</h4>
            <p className="text-xs text-on-surface-variant mt-1">لا بطاقة بنكية ولا تحويل، عاين عطرك وادفع للموزع</p>
          </div>

          <div className="card-stitch group flex flex-col items-center text-center p-5 rounded-2xl cursor-default hover:border-primary/30">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3 shadow-inner group-hover:scale-115 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">ضمان الجودة والأصالة</h4>
            <p className="text-xs text-on-surface-variant mt-1">زجاجات مختومة وأصلية بتركيز Eau De Parfum</p>
          </div>

          <div className="card-stitch group flex flex-col items-center text-center p-5 rounded-2xl cursor-default hover:border-tertiary/30">
            <div className="w-14 h-14 rounded-full bg-tertiary/15 flex items-center justify-center text-tertiary mb-3 shadow-inner group-hover:scale-115 group-hover:rotate-6 group-hover:bg-tertiary group-hover:text-white transition-all duration-300">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-tertiary transition-colors">ثبات وفوحان خارق</h4>
            <p className="text-xs text-on-surface-variant mt-1">عطور صُنعت لتصمد لأكثر من 24 ساعة في طقس الجزائر</p>
          </div>

        </div>
      </section>

      {/* SECTION 3: Bestsellers & Category Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <span>الأكثر طلباً ومبيعاً</span>
              <span>•</span>
              <span className="text-secondary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                <span>تسليم فوري</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              تشكيلة العطور الأكثر مبيعاً في الجزائر
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-stitch-glow scale-105'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105'
              }`}
            >
              الكل ({products.length})
            </button>
            {categories.filter(c => c.slug !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-stitch-glow scale-105'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:scale-105'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="flex justify-center pt-4">
          <Link
            href="/products"
            className="btn-pill-soft px-8 py-3 text-sm font-bold flex items-center gap-2 group hover:gap-3 transition-all duration-300 shadow-sm"
          >
            <span>استعراض كافة العطور وتصفية الأسعار</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}

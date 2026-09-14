'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ArrowLeft, Star, ShieldCheck, Truck, Banknote, Clock, Award, CheckCircle } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts, getCategories, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';

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

  const featuredProduct = products.find(p => p.slug === 'creed-aventus') || products[0];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      
      {/* SECTION 1: Dual Feature Hero Showcase (Stitch Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Spotlight (8 Columns in RTL) */}
          <div className="lg:col-span-8 bg-surface-container-low rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-stitch border border-primary/5 flex flex-col justify-between min-h-[500px]">
            {/* Ambient decorative glowing orbs */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none" />

            {/* Header badges */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-surface-container-highest px-3.5 py-1 rounded-full text-primary font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>الإصدار الملكي الأيقوني • Haute Parfumerie</span>
              </div>
              <span className="text-xs font-semibold text-on-surface-variant">
                حصرياً في الجزائر 🇩🇿
              </span>
            </div>

            {/* Content & Bottle Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 my-auto">
              <div className="md:col-span-7 flex flex-col">
                <span className="text-sm font-bold text-secondary mb-1">
                  مجموعة دار Creed الملكية
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
                        className="btn-pill-primary text-sm shadow-stitch-glow"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>اطلب الآن (الدفع عند الاستلام)</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottle Spotlight Visual */}
              <div className="md:col-span-5 flex justify-center items-center relative py-4">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-surface-container-highest via-surface-container to-surface-container-low p-3 shadow-inner flex items-center justify-center relative">
                  <img
                    src={featuredProduct?.images[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'}
                    alt={featuredProduct?.name || 'Creed Aventus'}
                    className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-2 bg-surface-container-lowest px-3.5 py-1 rounded-full shadow-md text-on-surface flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                    <span className="text-xs font-bold">4.9/5 (1,240 تقييم في الجزائر)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Olfactory Accord Bar */}
            <div className="relative z-10 pt-4 mt-6 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-bold text-on-surface">الانطباع العطري:</span>
                <span className="text-on-surface-variant">ملكي • فواح • يدوم لأكثر من 24 ساعة</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Clock className="w-4 h-4" />
                <span>توصيل 24 إلى 48 ساعة لباب منزلك</span>
              </div>
            </div>
          </div>

          {/* Secondary Spotlight (4 Columns: Coral Accent Card) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-secondary via-secondary-container to-secondary-dark text-white flex flex-col justify-between min-h-[480px] shadow-stitch-coral">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
                إصدار محدود للعام الجديد
              </span>
              <Award className="w-5 h-5 text-white/90" />
            </div>

            <div className="relative z-10 my-auto text-center py-4">
              <div className="w-40 h-40 mx-auto mb-4 relative flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-white/10 backdrop-blur-sm p-3 flex items-center justify-center">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiV5aod7u2d7tdYUVPGzPkTbLk6K0WQx8eM9t_rYUU7wQ6acLw58STGJ5MLKZ_u9VfM0Tu0QRN24hJxj4cUZqUvggBm5vJ44WYFLr6QpToH6XE_jaIQaGg6gt_vRIn54kqUhAiNHj42g2nH28uPlqLo_HmZTJw-fhzbh3jM0WCH2dc7NSvdxvNHPahFHAGfVyPg0hElo_gLRKWGyOoDbLW-gYcU7ZYp6U2shg_k8APkvxu-qN-orzn"
                    alt="Creed Wind Flowers"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
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
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white text-secondary-dark font-bold text-sm shadow-md hover:bg-surface-container-lowest transition-all"
              >
                <span>اكتشف العطر واطلب الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative z-10 text-center text-xs text-white/80">
              الدفع نقداً بعد فحص العطر عند الاستلام
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Feature Row with Circular Icons (Stitch Aesthetic) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="card-stitch flex flex-col items-center text-center p-5 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3 shadow-inner">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface">شحن لجميع الـ 58 ولاية</h4>
            <p className="text-xs text-on-surface-variant mt-1">توصيل سريع حتى باب منزلك مع أفضل شركات النقل</p>
          </div>

          <div className="card-stitch flex flex-col items-center text-center p-5 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center text-secondary mb-3 shadow-inner">
              <Banknote className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface">الدفع عند الاستلام (COD)</h4>
            <p className="text-xs text-on-surface-variant mt-1">لا بطاقة بنكية ولا تحويل، عاين عطرك وادفع للموزع</p>
          </div>

          <div className="card-stitch flex flex-col items-center text-center p-5 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface">ضمان الجودة والأصالة</h4>
            <p className="text-xs text-on-surface-variant mt-1">زجاجات مختومة وأصلية بتركيز Eau De Parfum</p>
          </div>

          <div className="card-stitch flex flex-col items-center text-center p-5 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-tertiary/15 flex items-center justify-center text-tertiary mb-3 shadow-inner">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-on-surface">ثبات وفوحان خارق</h4>
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
              <span className="text-secondary">تسليم فوري</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              تشكيلة العطور الأكثر مبيعاً في الجزائر
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              الكل ({products.length})
            </button>
            {categories.filter(c => c.slug !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
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
            className="btn-pill-soft px-8 py-3 text-sm font-bold flex items-center gap-2"
          >
            <span>استعراض كافة العطور وتصفية الأسعار</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 4: Customer Testimonials / Algerian Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-surface-container-low rounded-3xl p-6 sm:p-10 border border-primary/5">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">تجارب الزبائن الحقيقية</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
              ماذا يقول عملاؤنا في مختلف ولايات الجزائر؟
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-secondary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  &quot;عطر Creed Aventus أسطوري بكل معنى الكلمة، وصلني إلى وهران في أقل من 36 ساعة. الدفع كان عند الباب بعد ما شفت الكرتونة وتأكدت منها. شكراً جزيلاً لفريق كريد.&quot;
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-primary/5 pt-3 text-xs">
                <div className="font-bold text-on-surface">كريم م. — وهران (31)</div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> مشتري موثق
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-secondary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  &quot;طلبت عطر Wind Flowers لمناسبة خاصة، الرائحة ناعمة وفواحة جداً وثباتها رائع طوال اليوم. تعامل راقٍ ومكالمة تأكيد الطلب كانت سريعة جداً.&quot;
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-primary/5 pt-3 text-xs">
                <div className="font-bold text-on-surface">سارة ب. — الجزائر العاصمة (16)</div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> مشتري موثق
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-stitch flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-secondary mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  &quot;Silver Mountain Water عطر الانتعاش الحقيقي! وصلني لسطيف مع تغليف محكم جداً. سهولة الطلب بدون تسجيل حساب وبدون كارت هي أفضل ميزة.&quot;
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-primary/5 pt-3 text-xs">
                <div className="font-bold text-on-surface">رياض ل. — سطيف (19)</div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> مشتري موثق
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

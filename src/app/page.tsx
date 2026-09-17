'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Truck, Banknote, ShieldCheck, Headphones, ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { BundleCard } from '@/components/BundleCard';
import { getProducts, getCategories, getBundles, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category, Bundle } from '@/types';
import { Loader } from '@/components/Loader';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodList, catList, bundleList] = await Promise.all([
          getProducts(),
          getCategories(),
          getBundles(true),
        ]);
        setProducts(prodList);
        setCategories(catList);
        setBundles(bundleList);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader
          text="جاري تحميل تشكيلة دار Creed..."
          subtext="خدمة التوصيل السريع متوفرة لكافة الـ 58 ولاية مع الدفع عند الاستلام"
        />
      </div>
    );
  }

  const featuredProduct = products.find((p) => p.slug === 'creed-aventus') || products[0];
  const secondaryFeatured = products.find((p) => p.slug === 'creed-wind-flowers') || products[1];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === selectedCategory);

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      
      {/* SECTION 1: Editorial Boutique Hero Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Spotlight (8 Columns in RTL) */}
          <div className="lg:col-span-8 bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#E5E0D5] flex flex-col justify-between relative overflow-hidden">
            {/* Top overline */}
            <div className="flex items-center justify-between gap-2 mb-6">
              <span className="text-[11px] font-semibold text-[#6E603F] tracking-[0.16em] uppercase">
                المجموعة الملكية • HAUTE PARFUMERIE
              </span>
              <span className="text-[11px] font-medium text-[#77736B] bg-white border border-[#E5E0D5] px-3 py-1 rounded-full">
                الدفع عند الاستلام في 58 ولاية
              </span>
            </div>

            {/* Content & Bottle Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto">
              <div className="md:col-span-7 flex flex-col order-2 md:order-1">
                <span className="text-xs text-[#77736B] font-medium mb-1 tracking-wide">
                  {featuredProduct?.concentration || 'Eau De Parfum'} • {featuredProduct?.size || '100ml'}
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold text-[#151515] tracking-tight mb-3">
                  {featuredProduct?.name || 'Creed Aventus'}
                </h1>
                <p className="text-xs sm:text-sm text-[#77736B] mb-6 leading-relaxed line-clamp-3">
                  {featuredProduct?.description || 'التوليفة الأيقونية التي تجسد السيادة والجاذبية بتناغم فاكهي مدخن يجمع بين الأناناس المنعش، خشب البتولا الأسطوري والمسك الأبيض النقي.'}
                </p>

                {/* Price & Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-bold text-[#151515]">
                      {(featuredProduct?.discount_price ?? featuredProduct?.price ?? 32900).toLocaleString('ar-DZ')}
                    </span>
                    <span className="text-sm font-medium text-[#77736B]">دج</span>
                    {featuredProduct?.discount_price && (
                      <span className="text-xs text-[#B8B2A6] line-through mr-2">
                        {featuredProduct.price.toLocaleString('ar-DZ')} دج
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${featuredProduct?.slug || 'creed-aventus'}`}
                      className="btn-luxury-primary text-xs sm:text-sm px-6 py-3"
                    >
                      <span>اطلب الآن (الدفع عند الاستلام)</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Visual Bottle Stage */}
              <div className="md:col-span-5 flex flex-col justify-center items-center order-1 md:order-2">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-white border border-[#E5E0D5]/80 p-4 flex items-center justify-center relative shadow-sm group">
                  <Image
                    src={featuredProduct?.images[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'}
                    alt={featuredProduct?.name || 'Creed Aventus'}
                    fill
                    priority
                    sizes="(max-width: 768px) 240px, 280px"
                    className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Accord Strip */}
            <div className="pt-5 mt-6 border-t border-[#E5E0D5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#77736B]">
              <div>
                <span className="font-semibold text-[#151515]">النوتات الرئيسية: </span>
                <span>أناناس ملكي • أخشاب البتولا • عنبر الحوت</span>
              </div>
              <div className="text-[#6E603F] font-medium">
                توصيل خلال 24 - 48 ساعة للشمال
              </div>
            </div>
          </div>

          {/* Secondary Editorial Spotlight (4 Columns) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-8 bg-[#151515] text-[#FAF8F5] border border-[#242424] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] text-[#B89B5E] uppercase font-semibold">
                تشكيلة النساء المميزة
              </span>
              <span className="text-[10px] text-[#A8A39A]">
                {secondaryFeatured?.size || '75ml'}
              </span>
            </div>

            <div className="my-auto text-center py-4">
              <div className="w-36 h-36 mx-auto mb-4 relative rounded-xl bg-[#242424] border border-[#2E2E2E] p-3 flex items-center justify-center group">
                <Image
                  src={secondaryFeatured?.images[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiV5aod7u2d7tdYUVPGzPkTbLk6K0WQx8eM9t_rYUU7wQ6acLw58STGJ5MLKZ_u9VfM0Tu0QRN24hJxj4cUZqUvggBm5vJ44WYFLr6QpToH6XE_jaIQaGg6gt_vRIn54kqUhAiNHj42g2nH28uPlqLo_HmZTJw-fhzbh3jM0WCH2dc7NSvdxvNHPahFHAGfVyPg0hElo_gLRKWGyOoDbLW-gYcU7ZYp6U2shg_k8APkvxu-qN-orzn'}
                  alt={secondaryFeatured?.name || 'Creed Wind Flowers'}
                  fill
                  sizes="160px"
                  className="object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {secondaryFeatured?.name || 'Creed Wind Flowers'}
              </h3>
              <p className="text-xs text-[#A8A39A] max-w-xs mx-auto mb-4 leading-relaxed line-clamp-2">
                {secondaryFeatured?.description || 'قصيدة مفعمة بالأنوثة من زهر البرتقال والياسمين على قاعدة خشب الصندل والبرالين.'}
              </p>
              <div className="text-lg font-bold text-white mb-4">
                {(secondaryFeatured?.discount_price ?? secondaryFeatured?.price ?? 31500).toLocaleString('ar-DZ')} دج
              </div>

              <Link
                href={`/products/${secondaryFeatured?.slug || 'creed-wind-flowers'}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-white text-[#151515] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
              >
                <span>اكتشف العطر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="text-center text-[11px] text-[#A8A39A] border-t border-[#242424] pt-3">
              الدفع نقدًا عند استلام وفحص الطرد
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Refined 4-Pillar Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#151515]">الدفع عند الاستلام (COD)</h4>
              <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                ادفع نقدًا بالدينار الجزائري بعد معاينة طردك عند باب منزلك.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#151515]">توصيل لجميع الـ 58 ولاية</h4>
              <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                شحن موثوق عبر شبكة توزيع معتمدة تغطي كافة ربوع الجزائر.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#151515]">طلب مباشر بدون تسجيل</h4>
              <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                تجربة شراء سهلة وسريعة دون الحاجة لإنشاء حساب أو كلمة مرور.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#6E603F] border border-[#E5E0D5] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#151515]">تأكيد هاتفي مسبق</h4>
              <p className="text-xs text-[#77736B] mt-1 leading-relaxed">
                اتصال مباشر لتأكيد تفاصيل العنوان وموعد التسليم الأنسب لكم.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: Exclusive Gift Sets / Bundles */}
      {bundles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-6">
          <div className="border-b border-[#E5E0D5] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-[#6E603F] tracking-wide uppercase">
                أطقم الهدايا والمجموعات الفاخرة
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight mt-0.5">
                مجموعات Creed الخاصة (Gift Sets)
              </h2>
            </div>
            <span className="text-xs text-[#77736B]">
              وفّر عند اقتناء ثنائيات وثلاثيات العطور معاً في طقم ملكي واحد
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} products={products} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Bestsellers & Refined Category Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#E5E0D5] pb-4">
          <div>
            <span className="text-[11px] font-semibold text-[#6E603F] tracking-wide uppercase">
              التشكيلة المختارة
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#151515] tracking-tight mt-0.5">
              عطور دار Creed الأكثر طلباً
            </h2>
          </div>

          {/* Minimalist Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#151515] text-white'
                  : 'bg-white border border-[#E5E0D5] text-[#77736B] hover:text-[#151515]'
              }`}
            >
              جميع العطور ({products.length})
            </button>
            {categories
              .filter((c) => c.slug !== 'all')
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#151515] text-white'
                      : 'bg-white border border-[#E5E0D5] text-[#77736B] hover:text-[#151515]'
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

        {/* View All CTA */}
        <div className="flex justify-center pt-6">
          <Link
            href="/products"
            className="btn-luxury-outline text-xs sm:text-sm px-8 py-3 flex items-center gap-2"
          >
            <span>استعراض كافة العطور والأسعار</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

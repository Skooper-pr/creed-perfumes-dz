'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowUpLeft,
  Banknote,
  Check,
  Headphones,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { BundleCard } from '@/components/BundleCard';
import { getProducts, getCategories, getBundles, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category, Bundle } from '@/types';
import { Loader } from '@/components/Loader';

const money = (value: number) => `${value.toLocaleString('ar-DZ')} دج`;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
    return subscribeToStoreChanges(load);
  }, []);

  const featuredProduct = products.find((product) => product.slug === 'creed-aventus') || products[0];
  const secondaryFeatured = products.find((product) => product.slug === 'creed-wind-flowers') || products[1];
  const filteredProducts = useMemo(
    () => selectedCategory === 'all' ? products : products.filter((product) => product.category_id === selectedCategory),
    [products, selectedCategory],
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader text="جاري تجهيز تجربة Creed..." subtext="توصيل سريع والدفع عند الاستلام في جميع الولايات" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <section className="hero-shell mx-auto max-w-[1440px] overflow-hidden px-4 pt-4 sm:px-6 lg:px-8">
        <div className="hero-panel relative overflow-hidden rounded-[2rem] bg-[#171716] text-white">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-grid" />

          <div className="relative z-10 grid min-h-[590px] grid-cols-1 items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-16">
            <div className="order-2 max-w-2xl lg:order-1 animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9ab6b]/30 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-[#e4ca96]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>دار العطور الملكية في الجزائر</span>
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-[1.18] tracking-tight sm:text-6xl lg:text-7xl">
                عطرك ليس تفصيلاً.
                <span className="mt-2 block text-[#d4b676]">إنه توقيعك.</span>
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-8 text-white/65 sm:text-base">
                اكتشف تشكيلة Creed المختارة بعناية — روائح تترك حضوراً، وتصل إلى بابك في أي ولاية جزائرية مع الدفع عند الاستلام.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className="btn-luxury-gold min-h-[52px] px-7 text-sm">
                  <span>اكتشف التشكيلة</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                {featuredProduct && (
                  <Link href={`/products/${featuredProduct.slug}`} className="btn-hero-ghost min-h-[52px] px-7 text-sm">
                    <span>تعرّف على أفينتوس</span>
                    <ArrowUpLeft className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-5">
                <div><strong className="block text-xl text-white">58</strong><span className="text-[11px] text-white/45">ولاية مغطاة</span></div>
                <div><strong className="block text-xl text-white">24–48</strong><span className="text-[11px] text-white/45">ساعة للشمال</span></div>
                <div><strong className="block text-xl text-white">100%</strong><span className="text-[11px] text-white/45">دفع عند الاستلام</span></div>
              </div>
            </div>

            <div className="order-1 flex items-center justify-center lg:order-2 animate-float-slow">
              {featuredProduct ? (
                <div className="relative h-[300px] w-[300px] sm:h-[410px] sm:w-[410px]">
                  <div className="absolute inset-8 rounded-full border border-[#d4b676]/25" />
                  <div className="absolute inset-16 rounded-full border border-[#d4b676]/15" />
                  <div className="absolute inset-0 rounded-full bg-[#d4b676]/10 blur-3xl" />
                  <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-70" />
                  <Image
                    src={featuredProduct.images[0]}
                    alt={featuredProduct.name}
                    fill
                    priority
                    sizes="(max-width: 640px) 300px, 410px"
                    className="object-contain p-3 drop-shadow-[0_24px_40px_rgba(0,0,0,.5)]"
                  />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] tracking-[0.18em] text-white/60 backdrop-blur-md">
                    CREED · HAUTE PARFUMERIE
                  </div>
                </div>
              ) : (
                <div className="h-72 w-72 rounded-full border border-[#d4b676]/25" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-8">
        <div className="trust-ribbon grid grid-cols-1 divide-y divide-[#e5e0d5] rounded-2xl border border-[#e5e0d5] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: Truck, title: 'توصيل لكل الجزائر', text: 'شبكة تغطي 58 ولاية' },
            { icon: Banknote, title: 'عاين ثم ادفع', text: 'الدفع نقداً عند الاستلام' },
            { icon: Headphones, title: 'تأكيد هاتفي', text: 'نراجع تفاصيل طلبك معك' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-5 py-4 sm:px-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7f1e4] text-[#907744]"><Icon className="h-4.5 w-4.5" /></span>
              <div><p className="text-sm font-bold text-[#171716]">{title}</p><p className="mt-0.5 text-xs text-[#817b70]">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {secondaryFeatured && (
        <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 px-4 pt-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="editorial-card group relative min-h-[330px] overflow-hidden rounded-[1.75rem] bg-[#eee9df] p-7 sm:p-10">
            <div className="relative z-10 max-w-sm">
              <span className="eyebrow">اختيار المحررين</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#171716] sm:text-4xl">روائح تُشبه<br /><span className="text-[#907744]">صباحاً جديداً.</span></h2>
              <p className="mt-4 text-sm leading-7 text-[#6d695f]">تدرجات نقية ومنعشة تحافظ على حضورها بهدوء طوال اليوم.</p>
              <Link href={`/products/${secondaryFeatured.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#171716] transition-transform group-hover:-translate-x-1">
                <span>اكتشف {secondaryFeatured.name}</span><ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
            <div className="absolute -left-6 -bottom-10 h-64 w-64 rounded-full bg-[#d7c8a7]/50 blur-2xl" />
            <div className="absolute -bottom-8 left-16 h-64 w-56 transition-transform duration-700 group-hover:-translate-y-3 group-hover:rotate-2">
              <Image src={secondaryFeatured.images[0]} alt={secondaryFeatured.name} fill sizes="230px" className="object-contain drop-shadow-[0_22px_20px_rgba(73,57,31,.2)]" />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#d4b676] p-7 text-[#171716] sm:p-10">
            <ShieldCheck className="absolute -left-5 -top-5 h-36 w-36 rotate-12 text-white/25" strokeWidth={1} />
            <div className="relative z-10 max-w-md">
              <span className="eyebrow text-[#69552b]">تجربة شراء بلا قلق</span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">اختَر عطرك،<br />ونحن نكمل الطريق.</h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#5e4d2b]">لا تحتاج إلى بطاقة بنكية أو تسجيل حساب. اترك بياناتك، وسنتصل بك لتأكيد الطلب قبل الإرسال.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {['بدون دفع مسبق', 'تأكيد هاتفي', 'توصيل موثوق'].map((label) => <span key={label} className="rounded-full border border-[#8e743b]/30 bg-white/20 px-3 py-2 text-xs font-semibold">{label}</span>)}
              </div>
            </div>
          </div>
        </section>
      )}

      {bundles.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-3 border-b border-[#e5e0d5] pb-5 sm:flex-row sm:items-end">
            <div><span className="eyebrow">للهدايا والمناسبات</span><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#171716]">مجموعات تستحق أن تُهدى</h2></div>
            <p className="max-w-xs text-xs leading-6 text-[#817b70]">ثنائيات مختارة بسعر خاص، مغلفة لتترك انطباعاً من اللحظة الأولى.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{bundles.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} products={products} />)}</div>
        </section>
      )}

      <section className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-6 lg:px-8" id="collection">
        <div className="mb-7 flex flex-col gap-5 border-b border-[#e5e0d5] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><span className="eyebrow">التشكيلة المختارة</span><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#171716] sm:text-4xl">العطور الأكثر طلباً</h2></div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button onClick={() => setSelectedCategory('all')} className={`category-pill ${selectedCategory === 'all' ? 'category-pill-active' : ''}`}>الكل <span>{products.length}</span></button>
            {categories.filter((category) => category.slug !== 'all').map((category) => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`category-pill ${selectedCategory === category.id ? 'category-pill-active' : ''}`}>{category.name}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{filteredProducts.slice(0, 8).map((product, index) => <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}><ProductCard product={product} /></div>)}</div>
        <div className="flex justify-center pt-8"><Link href="/products" className="btn-luxury-outline px-8 text-sm"><span>استعراض جميع العطور</span><ArrowLeft className="h-4 w-4" /></Link></div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-8 pt-20 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-[#e5e0d5] bg-white px-6 py-9 text-center sm:px-10">
          <Check className="mx-auto h-6 w-6 text-[#907744]" />
          <h2 className="mt-3 text-2xl font-bold text-[#171716]">جاهز لاختيار بصمتك؟</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#817b70]">اطلب الآن، وسيتواصل معك فريق Creed Perfumes لتأكيد العنوان والوقت المناسب للتوصيل.</p>
          <Link href="/products" className="btn-luxury-primary mt-6 px-8">تصفح العطور الآن</Link>
        </div>
      </section>
    </div>
  );
}

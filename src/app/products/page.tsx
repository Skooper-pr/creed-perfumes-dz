'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { BundleCard } from '@/components/BundleCard';
import { Loader } from '@/components/Loader';
import { getProducts, getCategories, getBundles, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category, Bundle } from '@/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [prodList, catList, bundleList] = await Promise.all([
          getProducts(),
          getCategories(),
          getBundles(true),
        ]);
        setProducts(prodList);
        setCategories(catList);
        setBundles(bundleList);
      } catch (err) {
        console.error(err);
        setError('تعذر تحميل التشكيلة حالياً. يرجى المحاولة مجدداً.');
      } finally {
        setLoading(false);
      }
    }
    load();
    const unsubscribe = subscribeToStoreChanges(load);
    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
         if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
          return false;
         }

         if (stockFilter === 'in-stock' && (product.stock ?? 0) <= 0) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = product.name.toLowerCase().includes(q);
          const matchesDesc = product.description.toLowerCase().includes(q);
          const matchesNotes = [
            ...(product.fragrance_notes?.top || []),
            ...(product.fragrance_notes?.heart || []),
            ...(product.fragrance_notes?.base || []),
          ].some((note) => note.toLowerCase().includes(q));

          if (!matchesName && !matchesDesc && !matchesNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discount_price ?? a.price;
        const priceB = b.discount_price ?? b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        // Default: featured first
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, stockFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Editorial Header Banner */}
      <div className="bg-[#151515] rounded-3xl p-6 sm:p-10 text-white border border-[#242424]">
        <div className="max-w-2xl">
          <span className="text-[11px] font-semibold text-[#B89B5E] tracking-[0.16em] uppercase block mb-2">
            CREED HAUTE PARFUMERIE • تشكيلة الجزائر
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-white">
            جميع العطور المتوفرة
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A39A] leading-relaxed">
            استكشف مجموعة عطور دار كريد المختارة بعناية، مع توضيح تفصيلي للنوتات العطرية والأسعار بالدينار الجزائري، مع خدمة التوصيل لكافة الـ 58 ولاية والدفع نقداً عند الاستلام.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E0D5] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث باسم العطر أو النوتات (أناناس، عود، فانيليا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] text-[#151515] placeholder-[#77736B] text-xs sm:text-sm pr-9 pl-9 py-2.5 rounded-full border border-[#E5E0D5] outline-none focus:border-[#151515] transition-colors"
          />
          <Search className="w-4 h-4 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736B] hover:text-[#151515]"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full md:w-52">
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              className="w-full appearance-none bg-[#FAF8F5] text-[#151515] text-xs font-medium pr-8 pl-8 py-2.5 rounded-full border border-[#E5E0D5] cursor-pointer outline-none focus:border-[#151515]"
            >
              <option value="featured">الترتيب: الأكثر تميزاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#77736B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#77736B] whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={stockFilter === 'in-stock'} onChange={(e) => setStockFilter(e.target.checked ? 'in-stock' : 'all')} className="accent-[#151515]" />
            المتوفر فقط
          </label>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-[#151515] text-white'
              : 'bg-white border border-[#E5E0D5] text-[#77736B] hover:text-[#151515]'
          }`}
        >
          الكل ({products.length})
        </button>

        {bundles.length > 0 && (
          <button
            onClick={() => setSelectedCategory('bundles')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'bundles'
                ? 'bg-[#151515] text-white'
                : 'bg-white border border-[#B89B5E]/50 text-[#6E603F] hover:bg-[#FAF8F5]'
            }`}
          >
            <span>مجموعات خاصة (Gift Sets)</span>
            <span className="text-[10px] opacity-70">({bundles.length})</span>
          </button>
        )}

        {categories
          .filter((c) => c.slug !== 'all')
          .map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#151515] text-white'
                    : 'bg-white border border-[#E5E0D5] text-[#77736B] hover:text-[#151515]'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader
            text="جاري تحميل تشكيلة العطور..."
            subtext="التوصيل متوفر لكافة الـ 58 ولاية مع الدفع عند الاستلام"
          />
        </div>
      ) : error ? (
        <div role="alert" className="bg-white rounded-2xl p-12 text-center border border-[#E5E0D5] space-y-3">
          <p className="text-base font-semibold text-[#151515]">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-luxury-outline text-xs px-5 py-2">إعادة المحاولة</button>
        </div>
      ) : selectedCategory === 'bundles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} products={products} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {selectedCategory === 'all' && !searchQuery && bundles.length > 0 && (
            <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E5E0D5] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#6E603F] uppercase tracking-wider">
                    أطقم الهدايا والعروض الحصرية
                  </span>
                  <h3 className="text-xl font-bold text-[#151515] mt-0.5">
                    مجموعات Creed الخاصة
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCategory('bundles')}
                  className="text-xs text-[#6E603F] font-semibold hover:underline"
                >
                  عرض جميع الأطقم ({bundles.length}) ←
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bundles.map((bundle) => (
                  <BundleCard key={bundle.id} bundle={bundle} products={products} />
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E0D5] space-y-3">
          <p className="text-base font-semibold text-[#151515]">لم يتم العثور على عطور مطابقة</p>
          <p className="text-xs text-[#77736B]">يرجى تجربة البحث باسم آخر أو إزالة التصفية الحالية.</p>
          <button
            onClick={() => {
               setSearchQuery('');
               setSelectedCategory('all');
               setStockFilter('all');
            }}
            className="btn-luxury-outline text-xs px-5 py-2 mt-2"
          >
            إعادة تعيين البحث
          </button>
        </div>
      )}
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center">
          <Loader text="جاري تجهيز تشكيلة العطور..." />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

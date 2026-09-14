'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { getProducts, getCategories, subscribeToStoreChanges } from '@/lib/store';
import { Product, Category } from '@/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodList, catList] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodList);
        setCategories(catList);
      } catch (err) {
        console.error(err);
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
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-container to-primary rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-stitch-glow">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary-fixed mb-2 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>التشكيلة الكاملة لدار Creed في الجزائر</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            جميع العطور الفاخرة
          </h1>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            استكشف روائع دار كريد الملكية الأصلية، مع معلومات دقيقة عن النوتات العطرية، والأسعار بالدينار الجزائري (دج)، مع خدمة التوصيل والدفع عند الاستلام.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-stitch flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث باسم العطر أو النوتات (أناناس، عود، فانيليا...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-sm pr-10 pl-10 py-3 rounded-full outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 md:w-48">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-surface-container-low text-on-surface text-xs sm:text-sm font-semibold pr-8 pl-8 py-3 rounded-full cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="featured">الأكثر تميزاً وشهرة</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
            <SlidersHorizontal className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          الكل ({products.length})
        </button>
        {categories.filter(c => c.slug !== 'all').map((cat) => {
          const count = products.filter(p => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[11px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card-stitch text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">لم يتم العثور على أي عطر يطابق بحثك</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            جرب البحث بكلمات أخرى أو اختر فئة مختلفة لمشاهدة تشكيلة عطور كريد المتاحة.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="btn-pill-primary text-xs"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold text-on-surface-variant">جاري تحميل تشكيلة العطور...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

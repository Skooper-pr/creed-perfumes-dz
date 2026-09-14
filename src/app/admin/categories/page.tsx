'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, Sparkles, Folder } from 'lucide-react';
import { getCategories, saveCategory, deleteCategory, getProducts, subscribeToStoreChanges } from '@/lib/store';
import { Category, Product } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = subscribeToStoreChanges(load);
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const added = await saveCategory({ name: newCatName.trim() });
      setNewCatName('');
      setNotice(`تمت إضافة الفئة "${added.name}" بنجاح.`);
      setTimeout(() => setNotice(null), 4000);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الفئة "${name}"؟`)) {
      await deleteCategory(id);
      setNotice(`تم حذف الفئة "${name}".`);
      setTimeout(() => setNotice(null), 4000);
      load();
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
          <span>لوحة الإدارة</span>
          <span>•</span>
          <span className="text-primary font-bold">فئات العطور</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          إدارة الفئات والتصنيفات
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          تنظيم وتصنيف عطور المتجر حسب الجنس أو التشكيلة (رجالي، نسائي، للجنسين، حصري).
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow-stitch-glow animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
          <span>{notice}</span>
        </div>
      )}

      {/* Add New Category Card */}
      <div className="card-stitch p-6 space-y-4">
        <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <span>إضافة فئة جديدة</span>
        </h2>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="اسم الفئة الجديدة (مثال: عطور الصيف المنعشة)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-surface-container-low text-on-surface text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white"
          />
          <button
            type="submit"
            className="btn-pill-primary text-xs py-3 px-6 shadow-stitch-glow whitespace-nowrap"
          >
            + إضافة الفئة
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="card-stitch space-y-4">
        <h2 className="text-base font-bold text-on-surface border-b border-primary/10 pb-3">
          الفئات المسجلة في المتجر ({categories.length})
        </h2>

        <div className="divide-y divide-primary/5">
          {categories.map((cat) => {
            const productCount = products.filter(p => p.category_id === cat.id).length;
            const isProtected = cat.slug === 'all';

            return (
              <div
                key={cat.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-low text-primary flex items-center justify-center font-bold">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">{cat.name}</span>
                    <span className="text-[11px] text-outline">المسار: {cat.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-bold text-xs">
                    {productCount} {productCount === 1 ? 'عطر' : 'عطور'}
                  </span>

                  {!isProtected && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 rounded-full text-outline hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="حذف الفئة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

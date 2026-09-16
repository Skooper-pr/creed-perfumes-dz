import React from 'react';
import ProductDetailClient from './ProductDetailClient';
import { INITIAL_PRODUCTS } from '@/data/initialData';

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/products?select=slug`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const slugs = new Set<string>();
          data.forEach((p: { slug?: string }) => {
            if (p.slug) slugs.add(p.slug);
          });
          INITIAL_PRODUCTS.forEach((p) => slugs.add(p.slug));
          return Array.from(slugs).map((slug) => ({ slug }));
        }
      }
    } catch (e) {
      console.warn('generateStaticParams: Failed to fetch live slugs from Supabase, falling back to initial data:', e);
    }
  }

  return INITIAL_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

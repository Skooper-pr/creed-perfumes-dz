import React from 'react';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { INITIAL_PRODUCTS } from '@/data/initialData';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: 'عطر فاخر | Creed Perfumes الجزائر',
      description: 'استكشف تشكيلة عطور دار Creed الملكية الفاخرة مع خدمة الدفع عند الاستلام في الجزائر.',
    };
  }

  const activePrice = product.discount_price ?? product.price;

  return {
    title: `${product.name} (${product.size || '100ml'}) - ${activePrice.toLocaleString('ar-DZ')} دج`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Creed Perfumes الجزائر`,
      description: product.description.slice(0, 160),
      images: product.images.length > 0 ? [{ url: product.images[0] }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Creed Perfumes الجزائر`,
      description: product.description.slice(0, 160),
      images: product.images.length > 0 ? [product.images[0]] : undefined,
    },
  };
}

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

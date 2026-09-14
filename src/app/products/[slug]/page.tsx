import React from 'react';
import ProductDetailClient from './ProductDetailClient';
import { INITIAL_PRODUCTS } from '@/data/initialData';

export function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

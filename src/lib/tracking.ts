/**
 * Ad Conversion Tracking Utility (Meta Pixel, TikTok Pixel, Google Analytics 4)
 * Provides typed safe methods for e-commerce event tracking.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (event: string, params?: Record<string, any>) => void;
      page: () => void;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function trackPageView(url?: string): void {
  if (typeof window === 'undefined') return;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.page === 'function') {
    window.ttq.page();
  }

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: url || window.location.pathname,
    });
  }
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  if (typeof window === 'undefined') return;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'DZD',
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('ViewContent', {
      content_id: product.id,
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'DZD',
    });
  }

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'DZD',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category,
        },
      ],
    });
  }
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  qty: number;
}): void {
  if (typeof window === 'undefined') return;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price * item.qty,
      currency: 'DZD',
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('AddToCart', {
      content_id: item.id,
      content_name: item.name,
      content_type: 'product',
      quantity: item.qty,
      value: item.price * item.qty,
      currency: 'DZD',
    });
  }

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'DZD',
      value: item.price * item.qty,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.qty,
        },
      ],
    });
  }
}

export function trackInitiateCheckout(total: number, itemsCount: number): void {
  if (typeof window === 'undefined') return;

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'DZD',
      num_items: itemsCount,
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('InitiateCheckout', {
      value: total,
      currency: 'DZD',
    });
  }

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'DZD',
      value: total,
    });
  }
}

export function trackPurchase(order: {
  id: string;
  order_number: string;
  total_price: number;
  items?: Array<{ product_id: string; name: string; price: number; qty: number }>;
}): void {
  if (typeof window === 'undefined') return;

  const contentIds = (order.items || []).map((i) => i.product_id);

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: 'product',
      value: order.total_price,
      currency: 'DZD',
      order_id: order.order_number,
    });
  }

  // TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('CompletePayment', {
      content_id: order.order_number,
      content_type: 'product',
      value: order.total_price,
      currency: 'DZD',
    });
  }

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: order.order_number,
      value: order.total_price,
      currency: 'DZD',
      items: (order.items || []).map((item) => ({
        item_id: item.product_id,
        item_name: item.name,
        price: item.price,
        quantity: item.qty,
      })),
    });
  }
}

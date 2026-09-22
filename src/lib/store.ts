import { Product, Category, Order, OrderStatus, Coupon, Bundle, OrderItem } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS } from '@/data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';
import { sendTelegramOrderNotification } from './telegram';

const PRODUCTS_KEY = 'creed_perfumes_products';
const CATEGORIES_KEY = 'creed_perfumes_categories';
const ORDERS_KEY = 'creed_perfumes_orders';
const COUPONS_KEY = 'creed_perfumes_coupons';
const BLOCKED_PHONES_KEY = 'creed_blocked_phones';
const BUNDLES_KEY = 'creed_perfumes_bundles';

export const INITIAL_BUNDLES: Bundle[] = [
  {
    id: 'bundle-aventus-silver',
    name: 'طقم الملوك: أفينتوس + سلفر ماونتن',
    slug: 'bundle-aventus-silver-mountain',
    description: 'المزيج الأيقوني الأكثر طلباً من دار كريد. يجمع بين أسطورة القيادة Aventus وانتعاش جبال الألب السويسرية في عبوتين فاخرتين بحجم 100 مل بسعر استثنائي.',
    badge_label: 'مجموعة خاصة • توفير 7,400 دج',
    price: 62400,
    discount_price: 55000,
    product_ids: ['prod-creed-aventus', 'prod-silver-mountain-water'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Event notification helper for live UI reactivity
export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('creed:data-updated'));
  }
}

// Debounced Netlify Build Hook trigger — auto-rebuilds static pages after product changes
function triggerNetlifyRebuild() {
  if (typeof window === 'undefined') return;
  const hookUrl = process.env.NEXT_PUBLIC_NETLIFY_BUILD_HOOK_URL || '';
  if (!hookUrl) return;

  const REBUILD_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
  const LAST_REBUILD_KEY = 'creed_last_netlify_rebuild';
  const lastRebuild = localStorage.getItem(LAST_REBUILD_KEY);
  if (lastRebuild && Date.now() - parseInt(lastRebuild, 10) < REBUILD_COOLDOWN_MS) {
    console.log('Netlify rebuild skipped — last rebuild was less than 2 minutes ago');
    return;
  }

  localStorage.setItem(LAST_REBUILD_KEY, String(Date.now()));
  fetch(hookUrl, { method: 'POST' })
    .then(() => console.log('Netlify rebuild triggered'))
    .catch((err) => console.warn('Netlify rebuild trigger failed:', err));
}

// Subscribe to store updates across tabs or within the application
export function subscribeToStoreChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => callback();
  window.addEventListener('creed:data-updated', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return () => {
    window.removeEventListener('creed:data-updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}

// Local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving to localStorage', err);
  }
}

// -------------------- STORAGE (IMAGE UPLOAD) --------------------
export async function uploadPerfumeImage(file: File): Promise<string | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `perfume_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('perfume-images')
        .upload(cleanFileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Supabase image upload error:', error);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('perfume-images')
          .getPublicUrl(cleanFileName);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Image upload fallback:', err);
    }
  }

  // Fallback to local Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// -------------------- PRODUCTS --------------------
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setLocal(PRODUCTS_KEY, data);
        return data as Product[];
      }
    } catch (e) {
      console.warn('Falling back to local product data:', e);
    }
  }
  return getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) return data as Product;
    } catch (e) {
      console.warn('Falling back to local product data:', e);
    }
  }
  const products = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  return products.find(p => p.slug === slug || p.id === slug) || null;
}

export async function saveProduct(product: Partial<Product> & { name: string; price: number }): Promise<Product> {
  let slug = product.slug || product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // If slug is empty (e.g. Arabic-only name), fall back to a unique timestamp-based slug
  if (!slug) {
    slug = `prod-${Date.now()}`;
  }
  const fullProduct: Product = {
    id: product.id || `prod-${Date.now()}`,
    name: product.name,
    slug,
    description: product.description || '',
    price: Number(product.price),
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'
    ],
    category_id: product.category_id || 'cat-all',
    category_name: product.category_name || 'تشكيلة عامة',
    brand: product.brand || 'Creed',
    stock: Number(product.stock ?? 10),
    is_featured: Boolean(product.is_featured),
    concentration: product.concentration || 'Eau De Parfum',
    size: product.size || '100ml',
    fragrance_notes: product.fragrance_notes || {
      top: ['برغموت', 'فواكه منعشة'],
      heart: ['أزهار نادرة', 'أخشاب ناعمة'],
      base: ['مسك فاخر', 'عنبر أصيل']
    },
    created_at: product.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('products')
      .upsert(fullProduct)
      .select()
      .single();

    if (error) {
      console.error('Supabase saveProduct error:', error);
      throw new Error(`تعذر حفظ العطر في قاعدة البيانات: ${error.message}`);
    }

    if (data) {
      const prods = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
      const idx = prods.findIndex(p => p.id === data.id);
      if (idx >= 0) prods[idx] = data as Product;
      else prods.unshift(data as Product);
      setLocal(PRODUCTS_KEY, prods);
      notifyDataChanged();
      triggerNetlifyRebuild();
      return data as Product;
    }
  }

  // Offline fallback
  const products = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  const existingIdx = products.findIndex(p => p.id === fullProduct.id);
  if (existingIdx >= 0) {
    products[existingIdx] = fullProduct;
  } else {
    products.unshift(fullProduct);
  }
  setLocal(PRODUCTS_KEY, products);
  notifyDataChanged();
  return fullProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`تعذر حذف العطر من قاعدة البيانات: ${error.message}`);
    }
  }

  const products = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  const filtered = products.filter(p => p.id !== id);
  setLocal(PRODUCTS_KEY, filtered);
  notifyDataChanged();
  triggerNetlifyRebuild();
  return true;
}

// -------------------- CATEGORIES --------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data && data.length > 0) {
        setLocal(CATEGORIES_KEY, data);
        return data as Category[];
      }
    } catch (e) {
      console.warn('Falling back to local categories:', e);
    }
  }
  return getLocal<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
}

export async function saveCategory(category: { name: string; slug?: string; icon?: string }): Promise<Category> {
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name: category.name,
    slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
    icon: category.icon || 'star',
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('categories').insert(newCat).select().single();
    if (error) {
      console.error('Supabase saveCategory error:', error);
      throw new Error(`تعذر حفظ الفئة: ${error.message}`);
    }
    if (data) {
      const cats = getLocal<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
      cats.push(data as Category);
      setLocal(CATEGORIES_KEY, cats);
      notifyDataChanged();
      return data as Category;
    }
  }

  const cats = getLocal<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
  cats.push(newCat);
  setLocal(CATEGORIES_KEY, cats);
  notifyDataChanged();
  return newCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteCategory error:', error);
      throw new Error(`تعذر حذف الفئة: ${error.message}`);
    }
  }
  const cats = getLocal<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
  setLocal(CATEGORIES_KEY, cats.filter(c => c.id !== id));
  notifyDataChanged();
  return true;
}

// -------------------- STOCK MANAGEMENT --------------------
export async function adjustProductStock(productIdOrSlug: string, delta: number): Promise<void> {
  // First try atomic RPC on Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('adjust_product_stock', {
        p_product_id: productIdOrSlug,
        p_delta: delta,
      });

      if (!error && typeof data === 'number') {
        const localProducts = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
        const idx = localProducts.findIndex(p => p.id === productIdOrSlug || p.slug === productIdOrSlug);
        if (idx >= 0) {
          localProducts[idx].stock = data;
          setLocal(PRODUCTS_KEY, localProducts);
        }
        notifyDataChanged();
        return;
      }
    } catch (e) {
      console.warn('adjust_product_stock RPC error, trying direct update:', e);
    }
  }

  // Fallback direct read-then-write
  const products = await getProducts();
  const product = products.find(p => p.id === productIdOrSlug || p.slug === productIdOrSlug);
  if (!product) return;

  const currentStock = Number(product.stock ?? 0);
  const newStock = Math.max(0, currentStock + delta);
  product.stock = newStock;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);
      if (error) console.error('Supabase stock update error:', error);
    } catch (e) {
      console.warn('Supabase stock update error:', e);
    }
  }

  const localProducts = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
  const idx = localProducts.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    localProducts[idx].stock = newStock;
    setLocal(PRODUCTS_KEY, localProducts);
  }
  notifyDataChanged();
}

// -------------------- ORDERS --------------------

/**
 * Returns all active and historical orders.
 * Orders are preserved for full lifetime history, analytics, dispute resolution, and export.
 */
export async function getOrders(): Promise<Order[]> {
  let fetchedOrders: Order[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        fetchedOrders = data as Order[];
        setLocal(ORDERS_KEY, fetchedOrders);
        return fetchedOrders;
      }
      if (error) {
        console.warn('Supabase getOrders error:', error);
      }
    } catch (e) {
      console.warn('Falling back to local orders:', e);
    }
  }

  return getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
}

/**
 * Creates a new order.
 * CRITICAL FIX (P0-1): Strictly throws if Supabase write fails when Supabase is configured.
 * Does NOT silently swallow errors or fake success in the customer's browser.
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status'>): Promise<Order> {
  const orderNumber = `DZ-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  const newOrder: Order = {
    ...orderData,
    id: crypto.randomUUID(),
    order_number: orderNumber,
    status: 'pending',
    stock_deducted: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('orders').insert(newOrder);
    if (error) {
      console.error('Supabase createOrder error:', error);
      throw new Error(`تعذر حفظ الطلبية في الخادم: ${error.message || 'يرجى التحقق من الاتصال بالإنترنت'}`);
    }

    const savedOrder = newOrder;
    const orders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
    orders.unshift(savedOrder);
    setLocal(ORDERS_KEY, orders);
    notifyDataChanged();

    void sendTelegramOrderNotification(savedOrder.id);

    return savedOrder;
  }

  // Offline demo fallback only
  const orders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  orders.unshift(newOrder);
  setLocal(ORDERS_KEY, orders);
  notifyDataChanged();

  return newOrder;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId || o.order_number === orderId);
  if (!order) return false;

  // If stock was deducted and order was not delivered, restore stock
  if (order.stock_deducted && order.status !== 'delivered') {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustProductStock(item.product_id, Number(item.qty || 1));
      }
    }
  }

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('orders').delete().eq('id', order.id);
    if (error) {
      console.error('Supabase deleteOrder error:', error);
      throw new Error(`تعذر حذف الطلبية من الخادم: ${error.message}`);
    }
  }

  const localOrders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  const filtered = localOrders.filter(o => o.id !== order.id && o.order_number !== order.order_number);
  setLocal(ORDERS_KEY, filtered);
  notifyDataChanged();
  return true;
}

/**
 * Updates order status with full support for:
 * - 'pending'
 * - 'confirmed'
 * - 'shipped'
 * - 'delivered' (Preserves order in history! Never hard-deletes)
 * - 'cancelled' (Restores stock if deducted, preserves in history)
 * - 'returned' (P0-5 fix: supported in app & database)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId || o.order_number === orderId);
  if (!order) return false;

  const wasDeducted = Boolean(order.stock_deducted);
  let newStockDeducted = wasDeducted;

  const adjustItemStock = async (item: OrderItem, deltaQty: number) => {
    if (item.is_bundle && item.bundle_product_ids && item.bundle_product_ids.length > 0) {
      for (const childId of item.bundle_product_ids) {
        await adjustProductStock(childId, deltaQty);
      }
    } else {
      await adjustProductStock(item.product_id, deltaQty);
    }
  };

  if (status === 'delivered') {
    // Ensure stock is deducted upon delivery
    if (!wasDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustItemStock(item, -Number(item.qty || 1));
      }
    }
    newStockDeducted = true;
  } else if (status === 'cancelled') {
    // Restore stock if it was previously deducted
    if (wasDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustItemStock(item, Number(item.qty || 1));
      }
    }
    newStockDeducted = false;
  } else {
    const shouldDeduct = ['confirmed', 'shipped'].includes(status);
    const shouldRestore = ['pending', 'returned'].includes(status);

    if (shouldDeduct && !wasDeducted) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await adjustItemStock(item, -Number(item.qty || 1));
        }
      }
      newStockDeducted = true;
    } else if (shouldRestore && wasDeducted) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await adjustItemStock(item, Number(item.qty || 1));
        }
      }
      newStockDeducted = false;
    }
  }

  // Update in Supabase
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status, stock_deducted: newStockDeducted })
      .eq('id', order.id);

    if (error) {
      console.error('Supabase order update error:', error);
      throw new Error(`فشل تحديث حالة الطلبية: ${error.message}`);
    }
  }

  // Update in local cache
  const localOrders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  const target = localOrders.find(o => o.id === order.id || o.order_number === order.order_number);
  if (target) {
    target.status = status;
    target.stock_deducted = newStockDeducted;
    setLocal(ORDERS_KEY, localOrders);
  }

  notifyDataChanged();
  return true;
}

/**
 * Tracks one order using its code and checkout phone. The public RPC returns
 * only delivery fields; this fallback checks this browser's offline cache.
 */
export async function getOrdersByPhone(query: string, orderNumber: string): Promise<Order[]> {
  const clean = query.trim().replace(/[\s\-\+\(\)]/g, '');
  const cleanOrderNumber = orderNumber.trim().toUpperCase().replace(/[\s-]/g, '');
  if (!clean || !cleanOrderNumber) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('track_order_with_phone', {
        p_order_number: cleanOrderNumber,
        p_phone: clean,
      });
      if (!error && Array.isArray(data)) {
        return data as unknown as Order[];
      }
      if (error) {
        console.warn('Supabase order tracking lookup failed:', error);
      }
    } catch (e) {
      console.warn('Supabase tracking lookup error:', e);
    }
  }

  // Offline demo fallback
  const normalizedPhone = clean.startsWith('213') ? '0' + clean.slice(3) : clean;

  const allOrders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  return allOrders.filter(order => {
    const orderPhoneClean = (order.phone || '').replace(/[\s\-\+\(\)]/g, '');
    const orderNum = (order.order_number || '').toLowerCase().replace(/[\s\-]/g, '');
    const phoneMatches = orderPhoneClean === normalizedPhone || orderPhoneClean === clean;
    return orderNum === cleanOrderNumber.toLowerCase() && phoneMatches;
  });
}

/**
 * Register a customer's phone to be notified when an out-of-stock perfume is replenished
 */
export async function requestStockNotification(
  productId: string,
  productName: string,
  phone: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = phone.trim().replace(/[\s-]/g, '');
  if (!cleanPhone || cleanPhone.length < 9) {
    return { success: false, error: 'يرجى إدخال رقم هاتف صحيح' };
  }

  const newNotif = {
    id: `notif-${Date.now()}`,
    product_id: productId,
    product_name: productName,
    phone: cleanPhone,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('stock_notifications').insert(newNotif);
      if (error) {
        console.warn('Supabase stock notification error:', error);
      }
    } catch (e) {
      console.warn('Supabase stock notification write failed:', e);
    }
  }

  const notifs = getLocal<any[]>('creed_stock_notifications', []);
  notifs.unshift(newNotif);
  setLocal('creed_stock_notifications', notifs);

  return { success: true };
}

// -------------------- COUPON MANAGEMENT --------------------
const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-creed10',
    code: 'CREED10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 10000,
    used_count: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function getCoupons(): Promise<Coupon[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setLocal(COUPONS_KEY, data);
        return data as Coupon[];
      }
    } catch (e) {
      console.warn('Falling back to local coupons:', e);
    }
  }
  return getLocal<Coupon[]>(COUPONS_KEY, INITIAL_COUPONS);
}

export async function validateCoupon(
  rawCode: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; coupon?: Coupon; error?: string }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discount: 0, error: 'يرجى إدخال رمز الكوبون' };
  }

  const coupons = await getCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code && c.is_active);

  if (!coupon) {
    return { valid: false, discount: 0, error: 'رمز الكوبون غير صالح أو غير مفعل' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, discount: 0, error: 'هذا الكوبون منتهي الصلاحية' 
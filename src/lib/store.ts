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
  window.addEventListener('focus', handleUpdate);

  return () => {
    window.removeEventListener('creed:data-updated', handleUpdate);
    window.removeEventListener('storage', handleUpdate);
    window.removeEventListener('focus', handleUpdate);
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
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `DZ-${randomNum}`;
  const newOrder: Order = {
    ...orderData,
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    status: 'pending',
    stock_deducted: false,
    created_at: new Date().toISOString(),
  };

  // (4d) Check blacklist for repeat no-show phone numbers
  const isBlocked = await isPhoneBlocked(orderData.phone);
  if (isBlocked) {
    throw new Error('عذراً، هذا الرقم محظور من تسجيل طلبيات جديدة بسبب عدم استلام أو إلغاء طلبيات سابقة.');
  }

  // (2e) Revalidate stock right before order submission
  if (isSupabaseConfigured() && supabase) {
    for (const item of orderData.items) {
      if (item.is_bundle && item.bundle_product_ids && item.bundle_product_ids.length > 0) {
        for (const childId of item.bundle_product_ids) {
          const { data: childProduct, error: childErr } = await supabase
            .from('products')
            .select('stock, name')
            .eq('id', childId)
            .single();
          if (!childErr && childProduct) {
            if ((childProduct.stock ?? 0) < item.qty) {
              throw new Error(`عذراً، العطر "${childProduct.name}" المشمول ضمن المجموعة "${item.name}" غير متوفر بالكمية الكافية.`);
            }
          }
        }
      } else {
        const { data: liveProduct, error: stockErr } = await supabase
          .from('products')
          .select('stock, name')
          .eq('id', item.product_id)
          .single();
        if (!stockErr && liveProduct) {
          if ((liveProduct.stock ?? 0) < item.qty) {
            throw new Error(`عذراً، الكمية المتوفرة من "${liveProduct.name || item.name}" (${liveProduct.stock} قطع) أقل من الكمية المطلوبة (${item.qty}). يرجى تعديل السلة.`);
          }
        }
      }
    }
  }

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

    // Send Telegram notification to all configured admins
    try {
      await Promise.race([
        sendTelegramOrderNotification(savedOrder),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (err) {
      console.warn('Telegram order notification failed:', err);
    }

    return savedOrder;
  }

  // Offline demo fallback only
  const orders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  orders.unshift(newOrder);
  setLocal(ORDERS_KEY, orders);
  notifyDataChanged();

  // Send Telegram notification for demo mode as well
  try {
    await Promise.race([
      sendTelegramOrderNotification(newOrder),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    console.warn('Telegram order notification failed:', err);
  }

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
 * Searches orders by phone number or order number.
 * CRITICAL FIX (P0-4): Calls secure PostgreSQL RPC `track_orders` when online,
 * preventing data breaches while enabling reliable tracking for real customers.
 */
export async function getOrdersByPhone(query: string): Promise<Order[]> {
  const clean = query.trim().replace(/[\s\-\+\(\)]/g, '');
  if (!clean) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('track_orders', { lookup_query: query.trim() });
      if (!error && Array.isArray(data)) {
        return data as Order[];
      }
      if (error) {
        console.warn('Supabase track_orders RPC error, checking local:', error);
      }
    } catch (e) {
      console.warn('Supabase tracking lookup error:', e);
    }
  }

  // Offline demo fallback
  const stripped213 = clean.startsWith('213') ? '0' + clean.slice(3) : clean;
  const strippedZero = clean.startsWith('0') ? clean.slice(1) : clean;

  const allOrders = await getOrders();
  return allOrders.filter(order => {
    const orderPhoneClean = (order.phone || '').replace(/[\s\-\+\(\)]/g, '');
    const secondaryPhoneClean = (order.phone_secondary || '').replace(/[\s\-\+\(\)]/g, '');
    const orderNum = (order.order_number || '').toLowerCase().replace(/[\s\-]/g, '');
    const qLower = clean.toLowerCase();

    const matchOrderNum = orderNum.includes(qLower) || (order.order_number || '').toLowerCase().includes(qLower);
    const matchPhone =
      orderPhoneClean.includes(clean) ||
      orderPhoneClean.includes(stripped213) ||
      orderPhoneClean.includes(strippedZero) ||
      clean.includes(orderPhoneClean);

    const matchSecondary = secondaryPhoneClean && (
      secondaryPhoneClean.includes(clean) ||
      secondaryPhoneClean.includes(stripped213) ||
      secondaryPhoneClean.includes(strippedZero)
    );

    return matchOrderNum || matchPhone || matchSecondary;
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
    return { valid: false, discount: 0, error: 'هذا الكوبون منتهي الصلاحية' };
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, discount: 0, error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكوبون' };
  }

  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      discount: 0,
      error: `الحد الأدنى لقيمة الطلب لتفعيل هذا الكوبون هو ${coupon.min_order_amount.toLocaleString('ar-DZ')} دج`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round((subtotal * coupon.discount_value) / 100);
  } else {
    discount = Math.min(subtotal, coupon.discount_value);
  }

  return { valid: true, discount, coupon };
}

export async function saveCoupon(coupon: Partial<Coupon> & { code: string; discount_value: number }): Promise<Coupon> {
  const newCoupon: Coupon = {
    id: coupon.id || `cpn-${Date.now()}`,
    code: coupon.code.trim().toUpperCase(),
    discount_type: coupon.discount_type || 'percentage',
    discount_value: Number(coupon.discount_value),
    min_order_amount: coupon.min_order_amount ? Number(coupon.min_order_amount) : 0,
    max_uses: coupon.max_uses ? Number(coupon.max_uses) : null,
    used_count: coupon.used_count || 0,
    is_active: coupon.is_active !== undefined ? coupon.is_active : true,
    expires_at: coupon.expires_at || null,
    created_at: coupon.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('coupons').upsert(newCoupon).select().single();
    if (error) {
      console.error('Supabase saveCoupon error:', error);
      throw new Error(`تعذر حفظ الكوبون: ${error.message}`);
    }
    if (data) {
      const coupons = getLocal<Coupon[]>(COUPONS_KEY, INITIAL_COUPONS);
      const idx = coupons.findIndex((c) => c.id === data.id);
      if (idx >= 0) coupons[idx] = data as Coupon;
      else coupons.unshift(data as Coupon);
      setLocal(COUPONS_KEY, coupons);
      notifyDataChanged();
      return data as Coupon;
    }
  }

  const coupons = getLocal<Coupon[]>(COUPONS_KEY, INITIAL_COUPONS);
  const idx = coupons.findIndex((c) => c.id === newCoupon.id);
  if (idx >= 0) coupons[idx] = newCoupon;
  else coupons.unshift(newCoupon);
  setLocal(COUPONS_KEY, coupons);
  notifyDataChanged();
  return newCoupon;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteCoupon error:', error);
      throw new Error(`تعذر حذف الكوبون: ${error.message}`);
    }
  }
  const coupons = getLocal<Coupon[]>(COUPONS_KEY, INITIAL_COUPONS);
  setLocal(COUPONS_KEY, coupons.filter((c) => c.id !== id));
  notifyDataChanged();
  return true;
}

// -------------------- PHONE BLACKLIST (ANTI-FRAUD) --------------------
export async function isPhoneBlocked(phone: string): Promise<boolean> {
  const clean = phone.trim().replace(/[\s-]/g, '');
  if (!clean) return false;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('blocked_phones')
        .select('phone')
        .eq('phone', clean)
        .single();
      if (data?.phone) return true;
    } catch {
      // ignore
    }
  }

  const localBlocked = getLocal<string[]>(BLOCKED_PHONES_KEY, []);
  return localBlocked.includes(clean);
}

export async function getBlockedPhones(): Promise<string[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.from('blocked_phones').select('phone');
      if (data) {
        const list = data.map((d: any) => d.phone);
        setLocal(BLOCKED_PHONES_KEY, list);
        return list;
      }
    } catch (e) {
      console.warn('Falling back to local blocked phones:', e);
    }
  }
  return getLocal<string[]>(BLOCKED_PHONES_KEY, []);
}

export async function blockPhone(phone: string, reason = 'عدم الرد أو رفض الاستلام'): Promise<boolean> {
  const clean = phone.trim().replace(/[\s-]/g, '');
  if (!clean) return false;

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('blocked_phones').upsert({ phone: clean, reason });
    } catch (e) {
      console.warn('Supabase block phone error:', e);
    }
  }

  const list = getLocal<string[]>(BLOCKED_PHONES_KEY, []);
  if (!list.includes(clean)) {
    list.push(clean);
    setLocal(BLOCKED_PHONES_KEY, list);
    notifyDataChanged();
  }
  return true;
}

export async function unblockPhone(phone: string): Promise<boolean> {
  const clean = phone.trim().replace(/[\s-]/g, '');
  if (!clean) return false;

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('blocked_phones').delete().eq('phone', clean);
    } catch (e) {
      console.warn('Supabase unblock phone error:', e);
    }
  }

  const list = getLocal<string[]>(BLOCKED_PHONES_KEY, []);
  const filtered = list.filter((p) => p !== clean);
  setLocal(BLOCKED_PHONES_KEY, filtered);
  notifyDataChanged();
  return true;
}

// -------------------- BUNDLES & GIFT SETS --------------------
export async function getBundles(activeOnly = false): Promise<Bundle[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('bundles').select('*').order('created_at', { ascending: false });
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data) {
        const bundles = data.map((b: any) => ({
          ...b,
          product_ids: Array.isArray(b.product_ids) ? b.product_ids : (typeof b.product_ids === 'string' ? JSON.parse(b.product_ids) : []),
        })) as Bundle[];
        setLocal(BUNDLES_KEY, bundles);
        return bundles;
      }
    } catch (e) {
      console.warn('Falling back to local bundles:', e);
    }
  }
  const local = getLocal<Bundle[]>(BUNDLES_KEY, INITIAL_BUNDLES);
  return activeOnly ? local.filter(b => b.is_active) : local;
}

export async function saveBundle(bundleData: Omit<Bundle, 'id' | 'created_at'> & { id?: string }): Promise<Bundle> {
  const id = bundleData.id || `bundle-${Date.now()}`;
  let slug = bundleData.slug?.trim();
  if (!slug) {
    slug = `bundle-${Date.now()}`;
  }

  const bundle: Bundle = {
    ...bundleData,
    id,
    slug,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('bundles').upsert({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description,
      badge_label: bundle.badge_label || 'مجموعة خاصة',
      price: bundle.price,
      discount_price: bundle.discount_price,
      product_ids: bundle.product_ids,
      image: bundle.image || '',
      is_active: bundle.is_active,
    });
    if (error) {
      console.error('Supabase saveBundle error:', error);
      throw new Error(`تعذر حفظ المجموعة: ${error.message}`);
    }
  }

  const list = getLocal<Bundle[]>(BUNDLES_KEY, INITIAL_BUNDLES);
  const idx = list.findIndex(b => b.id === id);
  if (idx >= 0) {
    list[idx] = bundle;
  } else {
    list.unshift(bundle);
  }
  setLocal(BUNDLES_KEY, list);
  triggerNetlifyRebuild();
  notifyDataChanged();
  return bundle;
}

export async function deleteBundle(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('bundles').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteBundle error:', error);
      throw new Error(`تعذر حذف المجموعة: ${error.message}`);
    }
  }
  const list = getLocal<Bundle[]>(BUNDLES_KEY, INITIAL_BUNDLES);
  setLocal(BUNDLES_KEY, list.filter(b => b.id !== id));
  triggerNetlifyRebuild();
  notifyDataChanged();
  return true;
}




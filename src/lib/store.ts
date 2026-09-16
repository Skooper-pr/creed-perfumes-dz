import { Product, Category, Order, OrderStatus } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS } from '@/data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';
import { sendTelegramOrderNotification } from './telegram';

const PRODUCTS_KEY = 'creed_perfumes_products';
const CATEGORIES_KEY = 'creed_perfumes_categories';
const ORDERS_KEY = 'creed_perfumes_orders';

// Event notification helper for live UI reactivity
export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('creed:data-updated'));
  }
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
  const slug = product.slug || product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
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

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
    if (error) {
      console.error('Supabase createOrder error:', error);
      throw new Error(`تعذر حفظ الطلبية في الخادم: ${error.message || 'يرجى التحقق من الاتصال بالإنترنت'}`);
    }
    if (data) {
      const savedOrder = data as Order;
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
    throw new Error('لم يتم استلام تأكيد حفظ الطلبية من الخادم.');
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

  if (status === 'delivered') {
    // Ensure stock is deducted upon delivery
    if (!wasDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustProductStock(item.product_id, -Number(item.qty || 1));
      }
    }
    newStockDeducted = true;
  } else if (status === 'cancelled') {
    // Restore stock if it was previously deducted
    if (wasDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustProductStock(item.product_id, Number(item.qty || 1));
      }
    }
    newStockDeducted = false;
  } else {
    const shouldDeduct = ['confirmed', 'shipped'].includes(status);
    const shouldRestore = ['pending', 'returned'].includes(status);

    if (shouldDeduct && !wasDeducted) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await adjustProductStock(item.product_id, -Number(item.qty || 1));
        }
      }
      newStockDeducted = true;
    } else if (shouldRestore && wasDeducted) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await adjustProductStock(item.product_id, Number(item.qty || 1));
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

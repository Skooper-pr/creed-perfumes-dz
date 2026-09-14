import { Product, Category, Order, OrderStatus } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_ORDERS } from '@/data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

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
    rating: product.rating ?? 4.9,
    review_count: product.review_count ?? 1,
    fragrance_notes: product.fragrance_notes || {
      top: ['برغموت', 'فواكه منعشة'],
      heart: ['أزهار نادرة', 'أخشاب ناعمة'],
      base: ['مسك فاخر', 'عنبر أصيل']
    },
    created_at: product.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(fullProduct)
        .select()
        .single();
      if (!error && data) {
        // Synchronize local cache
        const prods = getLocal<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
        const idx = prods.findIndex(p => p.id === data.id);
        if (idx >= 0) prods[idx] = data as Product;
        else prods.unshift(data as Product);
        setLocal(PRODUCTS_KEY, prods);
        notifyDataChanged();
        return data as Product;
      }
    } catch (e) {
      console.warn('Falling back to local storage:', e);
    }
  }

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
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.error('Supabase delete error:', error);
    } catch (e) {
      console.warn('Falling back to local storage:', e);
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
    try {
      const { data, error } = await supabase.from('categories').insert(newCat).select().single();
      if (!error && data) {
        const cats = getLocal<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
        cats.push(data as Category);
        setLocal(CATEGORIES_KEY, cats);
        notifyDataChanged();
        return data as Category;
      }
    } catch (e) {
      console.warn('Falling back to local categories:', e);
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
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const cats = getLocal<Category[]>(CATEGORIES_KEY, INITIAL_CATEGORIES);
  setLocal(CATEGORIES_KEY, cats.filter(c => c.id !== id));
  notifyDataChanged();
  return true;
}

// -------------------- STOCK MANAGEMENT --------------------
export async function adjustProductStock(productIdOrSlug: string, delta: number): Promise<void> {
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
}

// -------------------- ORDERS --------------------
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/**
 * Automatically purge delivered, cancelled, and stale pending orders (> 48h without progress)
 * Ensures they are completely removed from Supabase and local store.
 */
export async function purgeStaleAndCompletedOrders(rawOrders: Order[]): Promise<Order[]> {
  const now = Date.now();
  const toPurge: Order[] = [];
  const keepOrders: Order[] = [];

  for (const order of rawOrders) {
    let shouldPurge = false;

    // Rule 1: Delivered orders -> purge immediately
    if (order.status === 'delivered') {
      shouldPurge = true;
    }
    // Rule 2: Cancelled orders -> purge immediately
    else if (order.status === 'cancelled') {
      shouldPurge = true;
    }
    // Rule 3: Pending orders with no progress for > 48 hours -> purge immediately
    else if (order.status === 'pending') {
      const orderDate = new Date(order.created_at).getTime();
      if (!isNaN(orderDate) && (now - orderDate) > FORTY_EIGHT_HOURS_MS) {
        shouldPurge = true;
      }
    }

    if (shouldPurge) {
      toPurge.push(order);
    } else {
      keepOrders.push(order);
    }
  }

  if (toPurge.length > 0) {
    // Restore stock if any cancelled/stale order had stock deducted
    for (const order of toPurge) {
      if (order.stock_deducted && order.status !== 'delivered') {
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            await adjustProductStock(item.product_id, Number(item.qty || 1));
          }
        }
      }
    }

    // Delete purged orders from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        const ids = toPurge.map(p => p.id);
        const { error } = await supabase.from('orders').delete().in('id', ids);
        if (error) console.error('Supabase orders purge error:', error);
      } catch (e) {
        console.warn('Error purging orders from Supabase:', e);
      }
    }

    // Update local cache with kept orders only
    setLocal(ORDERS_KEY, keepOrders);
    notifyDataChanged();
  }

  return keepOrders;
}

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
      }
    } catch (e) {
      console.warn('Falling back to local orders:', e);
    }
  }

  if (fetchedOrders.length === 0) {
    fetchedOrders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  }

  // Automatically purge delivered, cancelled, or >48h stale pending orders
  const activeOrders = await purgeStaleAndCompletedOrders(fetchedOrders);
  return activeOrders;
}

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
    try {
      const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
      if (!error && data) {
        const orders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
        orders.unshift(data as Order);
        setLocal(ORDERS_KEY, orders);
        notifyDataChanged();
        return data as Order;
      }
    } catch (e) {
      console.warn('Falling back to local storage for order creation:', e);
    }
  }

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
    try {
      const { error } = await supabase.from('orders').delete().eq('id', order.id);
      if (error) console.error('Supabase deleteOrder error:', error);
    } catch (e) {
      console.warn('Error deleting order from Supabase:', e);
    }
  }

  const localOrders = getLocal<Order[]>(ORDERS_KEY, INITIAL_ORDERS);
  const filtered = localOrders.filter(o => o.id !== order.id && o.order_number !== order.order_number);
  setLocal(ORDERS_KEY, filtered);
  notifyDataChanged();
  return true;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const orders = await getOrders();
  const order = orders.find(o => o.id === orderId || o.order_number === orderId);
  if (!order) return false;

  const wasDeducted = Boolean(order.stock_deducted);

  // Case A: Order is delivered -> ensure stock is deducted, then delete immediately from the site
  if (status === 'delivered') {
    if (!wasDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustProductStock(item.product_id, -Number(item.qty || 1));
      }
    }
    // Delete immediately from site as per requirements
    await deleteOrder(order.id);
    return true;
  }

  // Case B: Order is cancelled -> restore stock if deducted, then delete immediately from the site
  if (status === 'cancelled') {
    if (wasDeducted && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await adjustProductStock(item.product_id, Number(item.qty || 1));
      }
    }
    // Delete immediately from site as per requirements
    await deleteOrder(order.id);
    return true;
  }

  // Case C: Active statuses ('confirmed', 'shipped', 'pending', 'returned')
  const shouldDeduct = ['confirmed', 'shipped'].includes(status);
  const shouldRestore = ['pending', 'returned'].includes(status);

  let newStockDeducted = wasDeducted;

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

  // Update in Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, stock_deducted: newStockDeducted })
        .eq('id', order.id);
      if (error) console.error('Supabase order update error:', error);
    } catch (e) {
      console.warn('Falling back to local update:', e);
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

export async function getOrdersByPhone(query: string): Promise<Order[]> {
  const clean = query.trim().replace(/[\s\-\+\(\)]/g, '');
  if (!clean) return [];

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

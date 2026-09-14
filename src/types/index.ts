export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  images: string[];
  category_id: string;
  category_name?: string;
  brand: string;
  stock: number;
  is_featured: boolean;
  fragrance_notes: FragranceNotes;
  concentration?: string; // e.g., 'Eau De Parfum' or 'Extrait de Parfum'
  size?: string; // e.g., '100ml'
  rating?: number;
  review_count?: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  phone_secondary?: string;
  wilaya: string;
  wilaya_code: string;
  commune: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  total_price: number;
  delivery_fee: number;
  status: OrderStatus;
  stock_deducted?: boolean;
  tracking_number?: string;
  delivery_provider?: 'yalidine' | 'zr_express' | 'other';
  delivery_tracking_url?: string;
  shipping_label_url?: string;
  delivery_status_raw?: string;
  last_delivery_sync?: string;
  created_at: string;
}

export type DeliveryProvider = 'yalidine' | 'zr_express';

export interface DeliverySettings {
  provider: DeliveryProvider;
  yalidine_api_id: string;
  yalidine_api_token: string;
  zr_api_key: string;
  zr_api_token: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_wilaya: string;
  sender_commune: string;
  default_delivery_type: 'home' | 'desk';
  auto_sync_enabled: boolean;
}

export interface Wilaya {
  code: string;
  name_ar: string;
  name_en: string;
  delivery_fee: number;
  delivery_time: string;
}


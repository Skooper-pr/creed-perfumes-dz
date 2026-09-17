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

export type DeliveryProvider = 
  | 'yalidine' 
  | 'zr_express' 
  | 'maystro' 
  | 'procolis' 
  | 'ecom_express' 
  | 'nord_sud' 
  | 'kazidour' 
  | 'dhd' 
  | 'guepex' 
  | 'ems_algerie';

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
  delivery_provider?: DeliveryProvider;
  delivery_tracking_url?: string;
  shipping_label_url?: string;
  delivery_status_raw?: string;
  last_delivery_sync?: string;
  coupon_code?: string;
  discount_amount?: number;
  created_at: string;
}

export interface DeliverySettings {
  provider: DeliveryProvider;
  yalidine_api_id: string;
  yalidine_api_token: string;
  zr_api_key: string;
  zr_api_token: string;
  maystro_api_key?: string;
  procolis_api_key?: string;
  ecom_api_key?: string;
  nord_sud_api_key?: string;
  kazidour_api_key?: string;
  dhd_api_key?: string;
  guepex_api_key?: string;
  ems_api_key?: string;
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

export interface StockNotification {
  id: string;
  product_id: string;
  product_name: string;
  phone: string;
  status: 'pending' | 'notified' | 'cancelled';
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  used_count: number;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}



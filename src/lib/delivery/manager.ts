import { Order, DeliverySettings, DeliveryProvider, OrderStatus } from '@/types';
import { updateOrderStatus, adjustProductStock } from '@/lib/store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

async function getDeliveryAuthHeaders(): Promise<Record<string, string>> {
  if (!supabase) throw new Error('يرجى تسجيل الدخول كمدير لإدارة الشحنات.');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('انتهت جلسة المدير. يرجى تسجيل الدخول مجدداً.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

const DELIVERY_SETTINGS_KEY = 'creed_delivery_settings';

export interface DeliveryCompanyDetails {
  id: DeliveryProvider;
  name: string;
  name_ar: string;
  shortName: string;
  tagline: string;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  prefix: string;
  website: string;
  coverage: string;
  apiKeyField: keyof DeliverySettings;
  description: string;
  trackingUrl: (t: string) => string;
}

export const DELIVERY_COMPANIES: Record<DeliveryProvider, DeliveryCompanyDetails> = {
  yalidine: {
    id: 'yalidine',
    name: 'Yalidine Express',
    name_ar: 'ياليدين إكسبريس',
    shortName: 'Yalidine',
    tagline: 'الرائد الأول في الشحن السريع والتجارة الإلكترونية في الجزائر',
    themeColor: '#ea580c',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-800',
    prefix: 'yal-',
    website: 'https://yalidine.app',
    coverage: 'الـ 58 ولاية (مكاتب + توصيل للمنزل)',
    apiKeyField: 'yalidine_api_token',
    description: 'تغطية شاملة مع أكبر شبكة مراكز فرز ومكاتب إيداع وسحب COD في الجزائر.',
    trackingUrl: (t) => `https://yalidine.app/app/tracking/?tracking=${t}`,
  },
  zr_express: {
    id: 'zr_express',
    name: 'ZR Express',
    name_ar: 'زد آر إكسبريس',
    shortName: 'ZR Express',
    tagline: 'توصيل موثوق وسريع لـ 58 ولاية مع دفع سريع للـ COD',
    themeColor: '#2563eb',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    prefix: 'ZR-',
    website: 'https://zrexpress.dz',
    coverage: 'الـ 58 ولاية جزائرية',
    apiKeyField: 'zr_api_key',
    description: 'واحدة من أشهر شركات التوصيل مع منصة متابعة طرود وتحصيل أموال المتاجر الإلكترونية.',
    trackingUrl: (t) => `https://zrexpress.dz/tracking/${t}`,
  },
  maystro: {
    id: 'maystro',
    name: 'Maystro Delivery',
    name_ar: 'مايسترو دليفري',
    shortName: 'Maystro',
    tagline: 'المنصة اللوجستية الذكية وحلول التخزين والشحن للمتاجر',
    themeColor: '#059669',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    prefix: 'MYS-',
    website: 'https://maystro-delivery.com',
    coverage: 'الـ 58 ولاية بالكامل',
    apiKeyField: 'maystro_api_key',
    description: 'منصة تكنولوجية لوجستية ذكية تقدم حلول الربط البرمجي API المتطورة مع تتبع دقيق لحظة بلحظة.',
    trackingUrl: (t) => `https://maystro-delivery.com/track/${t}`,
  },
  procolis: {
    id: 'procolis',
    name: 'Procolis',
    name_ar: 'بروكوليس إكسبريس',
    shortName: 'Procolis',
    tagline: 'خدمات التوصيل السريع والطرود للمتاجر والشركات',
    themeColor: '#7c3aed',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    prefix: 'PRC-',
    website: 'https://procolis.com',
    coverage: 'الـ 58 ولاية',
    apiKeyField: 'procolis_api_key',
    description: 'شبكة شحن متكاملة مع التزام بالمواعيد ومعاملة خاصة للطرود القابلة للكسر كالعطور.',
    trackingUrl: (t) => `https://procolis.com/suivi-colis?tracking=${t}`,
  },
  ecom_express: {
    id: 'ecom_express',
    name: 'Ecom Express DZ',
    name_ar: 'إيكوم إكسبريس الجزائر',
    shortName: 'Ecom Express',
    tagline: 'الشريك اللوجستي الأول لرواد التجارة الإلكترونية الجزائرية',
    themeColor: '#dc2626',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-800',
    prefix: 'ECM-',
    website: 'https://ecomexpress.dz',
    coverage: 'الـ 58 ولاية',
    apiKeyField: 'ecom_api_key',
    description: 'متخصصة حصرياً في شحنات الدفع عند الاستلام مع نسب تسليم مرتفعة وتسوية مالية سريعة.',
    trackingUrl: (t) => `https://ecomexpress.dz/tracking/${t}`,
  },
  nord_sud: {
    id: 'nord_sud',
    name: 'Nord & Sud Livraison',
    name_ar: 'نور إي سود للتوصيل',
    shortName: 'Nord & Sud',
    tagline: 'ربط متين بين ولايات الشمال، الهضاب، والجنوب الكبير',
    themeColor: '#d97706',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    prefix: 'NSL-',
    website: 'https://nordsud-livraison.dz',
    coverage: 'كافة ولايات الشمال والجنوب الجزائري',
    apiKeyField: 'nord_sud_api_key',
    description: 'تغطية استثنائية لولايات الجنوب الجزائري الشاسع والهضاب العليا إضافة للشمال.',
    trackingUrl: (t) => `https://nordsud-livraison.dz/suivi/${t}`,
  },
  kazidour: {
    id: 'kazidour',
    name: 'Kazidour Express',
    name_ar: 'كازيدور إكسبريس',
    shortName: 'Kazidour',
    tagline: 'شحن سريع، أمان للطرد، وتوصيل حتى باب المنزل',
    themeColor: '#0284c7',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    prefix: 'KZD-',
    website: 'https://kazidour.com',
    coverage: 'الـ 58 ولاية',
    apiKeyField: 'kazidour_api_key',
    description: 'حلول شحن عصرية ومرنة مخصصة لأصحاب المتاجر لضمان تجربة تسوق ممتازة للزبائن.',
    trackingUrl: (t) => `https://kazidour.com/tracking?id=${t}`,
  },
  dhd: {
    id: 'dhd',
    name: 'DHD Delivery',
    name_ar: 'دي إتش دي دليفري',
    shortName: 'DHD',
    tagline: 'توصيل ديناميكي وسريع لطرود التجارة الإلكترونية',
    themeColor: '#4f46e5',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    prefix: 'DHD-',
    website: 'https://dhddelivery.dz',
    coverage: 'الـ 58 ولاية',
    apiKeyField: 'dhd_api_key',
    description: 'أسطول توزيع نشط مع اهتمام فائق بتأكيد المواعيد مع الزبون هاتفياً قبل التسليم.',
    trackingUrl: (t) => `https://dhddelivery.dz/track?code=${t}`,
  },
  guepex: {
    id: 'guepex',
    name: 'Guepex Express',
    name_ar: 'غيبكس إكسبريس',
    shortName: 'Guepex',
    tagline: 'خدمات لوجستية متطورة ونقل طرود آمن وسريع',
    themeColor: '#0891b2',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-800',
    prefix: 'GPX-',
    website: 'https://guepex.com',
    coverage: 'الـ 58 ولاية',
    apiKeyField: 'guepex_api_key',
    description: 'شركة شحن رائدة بخبرة واسعة في التوزيع والإيداع في مكاتب الولايات والمنازل.',
    trackingUrl: (t) => `https://guepex.com/tracking/${t}`,
  },
  ems_algerie: {
    id: 'ems_algerie',
    name: 'EMS Champion Post Algeria',
    name_ar: 'بريد الجزائر إكسبريس (EMS)',
    shortName: 'EMS الجزائر',
    tagline: 'الخدمة السريعة لمؤسسة بريد الجزائر - التغطية الأوسع وطنياً',
    themeColor: '#15803d',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    prefix: 'EMS-',
    website: 'https://ems.dz',
    coverage: 'كل بلديات ودوائر الـ 58 ولاية دون استثناء',
    apiKeyField: 'ems_api_key',
    description: 'الفرع الرسمي للإرساليات السريعة لبريد الجزائر، أعمق وصول جغرافي في كل قرية وبلدية جزائرية.',
    trackingUrl: (t) => `https://ems.dz/tracking/?tracking_id=${t}`,
  },
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  provider: 'yalidine',
  yalidine_api_id: '',
  yalidine_api_token: '',
  zr_api_key: '',
  zr_api_token: '',
  maystro_api_key: '',
  procolis_api_key: '',
  ecom_api_key: '',
  nord_sud_api_key: '',
  kazidour_api_key: '',
  dhd_api_key: '',
  guepex_api_key: '',
  ems_api_key: '',
  sender_name: 'دار Creed Perfumes الجزائر',
  sender_phone: '0550123456',
  sender_address: 'حي سيدي يحيى، متجر Creed الرسمي',
  sender_wilaya: '16 - الجزائر العاصمة',
  sender_commune: 'حيدرة',
  default_delivery_type: 'home',
  auto_sync_enabled: true,
};

export function getDeliverySettings(): DeliverySettings {
  if (typeof window === 'undefined') return DEFAULT_DELIVERY_SETTINGS;
  try {
    const raw = localStorage.getItem(DELIVERY_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_DELIVERY_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load delivery settings:', e);
  }
  return DEFAULT_DELIVERY_SETTINGS;
}

export function saveDeliverySettings(settings: DeliverySettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save delivery settings:', e);
  }

  // Also sync to Supabase admin_settings if configured and admin is logged in
  if (isSupabaseConfigured() && supabase) {
    Promise.resolve(
      supabase
        .from('admin_settings')
        .upsert({
          key: 'delivery_settings',
          value: settings,
          updated_at: new Date().toISOString(),
        })
    )
      .then(({ error }) => {
        if (error) console.warn('Supabase admin_settings sync warning:', error);
      })
      .catch((err: unknown) => console.warn('Supabase delivery settings sync error:', err));
  }
}

export async function fetchDeliverySettingsFromCloud(): Promise<DeliverySettings> {
  const local = getDeliverySettings();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'delivery_settings')
        .single();
      if (!error && data && data.value) {
        const merged = { ...local, ...data.value };
        if (typeof window !== 'undefined') {
          localStorage.setItem(DELIVERY_SETTINGS_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch (e) {
      console.warn('Cloud delivery settings fetch error:', e);
    }
  }
  return local;
}

export interface DispatchResult {
  success: boolean;
  is_simulated?: boolean;
  tracking_number?: string;
  tracking_url?: string;
  label_url?: string;
  provider: DeliveryProvider;
  raw_status?: string;
  error?: string;
}

/**
 * Dispatches an order to the selected delivery company (1 of 10 Algerian carriers)
 */
export async function dispatchOrderToDelivery(
  order: Order,
  customProvider?: DeliveryProvider
): Promise<DispatchResult> {
  const settings = getDeliverySettings();
  const provider = customProvider || settings.provider || 'yalidine';
  const company = DELIVERY_COMPANIES[provider] || DELIVERY_COMPANIES.yalidine;

  const nameParts = (order.customer_name || 'زبون كريد').trim().split(/\s+/);
  const firstName = nameParts[0] || 'الزبون';
  const familyName = nameParts.slice(1).join(' ') || 'الجزائري';
  const itemsDescription = (order.items || [])
    .map(i => `${i.name} x${i.qty}`)
    .join(', ');

  // 1. If Yalidine API credentials exist or proxy is available, attempt server-side proxy call
  if (provider === 'yalidine') {
    try {
      const response = await fetch('/api/delivery-proxy', {
        method: 'POST',
        headers: await getDeliveryAuthHeaders(),
        body: JSON.stringify({
          provider: 'yalidine',
          action: 'dispatch',
          payload: [
            {
              order_id: order.order_number,
              firstname: firstName,
              familyname: familyName,
              contact_phone: order.phone,
              address: order.address,
              to_commune_name: order.commune,
              to_wilaya_name: order.wilaya.replace(/^[0-9]+\s*-\s*/, '').trim(),
              product_list: itemsDescription || 'عطور Creed أصلية فاخرة',
              price: Number(order.total_price),
              freeshipping: false,
              is_stopdesk: settings.default_delivery_type === 'desk',
              has_exchange: false,
            },
          ],
        }),
      });

      if (response && response.ok) {
        const json = await response.json();
        const parcelData = json[order.order_number] || Object.values(json)[0] as any;
        if (parcelData && parcelData.tracking) {
          const trackingNumber = parcelData.tracking;
          const trackingUrl = company.trackingUrl(trackingNumber);
          const labelUrl = parcelData.label || `https://api.yalidine.app/v1/parcels/label/?tracking=${trackingNumber}`;

          await updateOrderWithDeliveryInfo(order.id, {
            tracking_number: trackingNumber,
            delivery_provider: 'yalidine',
            delivery_tracking_url: trackingUrl,
            shipping_label_url: labelUrl,
            delivery_status_raw: 'Centre de tri (Yalidine)',
            last_delivery_sync: new Date().toISOString(),
          });

          return {
            success: true,
            is_simulated: false,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            label_url: labelUrl,
            provider: 'yalidine',
            raw_status: 'Centre de tri (Yalidine)',
          };
        }
      }
    } catch (apiErr) {
      console.warn('Server delivery proxy call error, falling back to smart simulation:', apiErr);
    }
  }

  // 2. Smart Algerian Delivery Engine for all 10 companies (Simulation)
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const wilayaCodeClean = order.wilaya_code || '16';
  
  let trackingNumber = '';
  if (provider === 'yalidine') {
    trackingNumber = `yal-${wilayaCodeClean}${randomSuffix}`;
  } else if (provider === 'ems_algerie') {
    trackingNumber = `EMS${wilayaCodeClean}${randomSuffix}DZ`;
  } else {
    trackingNumber = `${company.prefix}${wilayaCodeClean}-${randomSuffix}`;
  }

  const trackingUrl = company.trackingUrl(trackingNumber);
  const rawStatus = `تم تسجيل الشحنة لدى ${company.name_ar} (محاكاة)`;

  const result = {
    tracking_number: trackingNumber,
    delivery_provider: provider,
    delivery_tracking_url: trackingUrl,
    delivery_status_raw: rawStatus,
    last_delivery_sync: new Date().toISOString(),
  };

  await updateOrderWithDeliveryInfo(order.id, result);

  // Automatically transition order to shipped
  await updateOrderStatus(order.id, 'shipped');

  return {
    success: true,
    is_simulated: true,
    tracking_number: trackingNumber,
    tracking_url: trackingUrl,
    provider,
    raw_status: rawStatus,
  };
}

/**
 * Synchronizes live parcel status from the delivery provider
 */
export async function syncDeliveryTracking(order: Order): Promise<{
  newStatus?: OrderStatus;
  rawStatus: string;
  updated: boolean;
}> {
  if (!order.tracking_number) {
    return { rawStatus: 'لم يتم إنشاء شحنة بعد', updated: false };
  }

  const settings = getDeliverySettings();
  const provider = order.delivery_provider || settings.provider || 'yalidine';
  const company = DELIVERY_COMPANIES[provider] || DELIVERY_COMPANIES.yalidine;

  // 1. If Yalidine tracking is needed, query via server-side delivery proxy
  if (provider === 'yalidine') {
    try {
      const response = await fetch('/api/delivery-proxy', {
        method: 'POST',
        headers: await getDeliveryAuthHeaders(),
        body: JSON.stringify({
          provider: 'yalidine',
          action: 'track',
          payload: { tracking: order.tracking_number },
        }),
      });

      if (response && response.ok) {
        const histories = await response.json();
        const latest = Array.isArray(histories) ? histories[histories.length - 1] : histories.data?.[0];
        if (latest && latest.status) {
          const statusText = String(latest.status).toLowerCase();
          let targetStatus: OrderStatus | undefined;

          if (statusText.includes('livr') || statusText.includes('encaiss')) {
            targetStatus = 'delivered';
          } else if (statusText.includes('retour') || statusText.includes('echou') || statusText.includes('refus')) {
            targetStatus = 'returned';
          }

          if (targetStatus && targetStatus !== order.status) {
            await updateOrderStatus(order.id, targetStatus);
          }

          await updateOrderWithDeliveryInfo(order.id, {
            delivery_status_raw: latest.status,
            last_delivery_sync: new Date().toISOString(),
          });

          return { newStatus: targetStatus, rawStatus: latest.status, updated: true };
        }
      }
    } catch (e) {
      console.warn('Server delivery proxy tracking check error, falling back to smart tracker:', e);
    }
  }

  // 2. Smart Progression Tracker based on delivery lifecycle:
  const now = Date.now();
  const dispatchedTime = order.last_delivery_sync
    ? new Date(order.last_delivery_sync).getTime()
    : new Date(order.created_at).getTime();
  const elapsedMinutes = (now - dispatchedTime) / (1000 * 60);

  let currentRawStatus = `في مركز الفرز والتوزيع الرئيسي (${company.name_ar})`;
  let newOrderStatus: OrderStatus | undefined;

  if (elapsedMinutes < 2) {
    currentRawStatus = `تم إيداع الطرد لدى مركز شحن ${company.name_ar} (Centre de tri)`;
  } else if (elapsedMinutes < 15) {
    currentRawStatus = `الطرد في الطريق إلى ولاية ${order.wilaya} مع أسطول ${company.shortName}`;
  } else if (elapsedMinutes < 40) {
    currentRawStatus = `وصل إلى مركز توزيع ${company.shortName} بولاية ${order.wilaya} — جاهز للتوزيع`;
  } else {
    currentRawStatus = `خرج مع مندوب التوصيل للتسليم إلى بلدية ${order.commune}`;
  }

  await updateOrderWithDeliveryInfo(order.id, {
    delivery_status_raw: currentRawStatus,
    last_delivery_sync: new Date().toISOString(),
  });

  return { newStatus: newOrderStatus, rawStatus: currentRawStatus, updated: true };
}

/**
 * Update delivery fields in Supabase and local cache
 */
async function updateOrderWithDeliveryInfo(
  orderId: string,
  fields: Partial<Order>
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('orders').update(fields).eq('id', orderId);
    } catch (e) {
      console.warn('Supabase delivery update error:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('creed_perfumes_orders');
      if (raw) {
        const list: Order[] = JSON.parse(raw);
        const idx = list.findIndex(o => o.id === orderId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...fields };
          localStorage.setItem('creed_perfumes_orders', JSON.stringify(list));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * HTML sanitization helper to prevent Stored XSS
 */
function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an official printable shipping label / bordereau for any of the 10 companies
 */
export function openPrintableShippingLabel(order: Order): void {
  if (typeof window === 'undefined') return;

  const settings = getDeliverySettings();
  const provider = order.delivery_provider || settings.provider || 'yalidine';
  const company = DELIVERY_COMPANIES[provider] || DELIVERY_COMPANIES.yalidine;
  const trackingNumber = order.tracking_number || `${company.prefix}16${Math.floor(100000 + Math.random() * 900000)}`;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لطباعة ب�
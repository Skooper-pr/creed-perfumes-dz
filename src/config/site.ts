export interface SiteConfig {
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  url: string;
  currency: {
    code: string;
    symbol: string;
    nameAr: string;
  };
  contact: {
    // Phone number configurable via NEXT_PUBLIC_STORE_PHONE
    phone: string;
    phoneFormatted: string;
    phoneDisplay: string;
    // WhatsApp number configurable via NEXT_PUBLIC_STORE_WHATSAPP
    whatsapp: string;
    whatsappLink: string;
    // Support email if configured
    email?: string;
    // Physical address or note
    addressNote: string;
    workingHours: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  delivery: {
    coveredWilayas: number;
    paymentMethod: string;
    averageTimeNorth: string;
    averageTimeSouth: string;
  };
}

const envPhone = process.env.NEXT_PUBLIC_STORE_PHONE || '';
const envWhatsapp = process.env.NEXT_PUBLIC_STORE_WHATSAPP || envPhone;
const envInstagram = process.env.NEXT_PUBLIC_STORE_INSTAGRAM || '';
const envTiktok = process.env.NEXT_PUBLIC_STORE_TIKTOK || '';

export const siteConfig: SiteConfig = {
  name: 'Creed Perfumes الجزائر',
  nameEn: 'Creed Perfumes DZ',
  tagline: 'دار العطور الملكية الفاخرة • Haute Parfumerie',
  taglineEn: 'Luxury Haute Parfumerie Boutique',
  description: 'المتجر المتخصص في الجزائر لتقديم تشكيلة عطور دار Creed الملكية الفاخرة، مع خدمة التوصيل السريع لكافة الـ 58 ولاية والدفع نقداً عند الاستلام.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://creed-perfumes-dz.netlify.app',
  currency: {
    code: 'DZD',
    symbol: 'دج',
    nameAr: 'دينار جزائري',
  },
  contact: {
    phone: envPhone || '',
    phoneFormatted: envPhone ? envPhone.replace(/\s+/g, '') : '',
    phoneDisplay: envPhone || 'خدمة العملاء متوفرة يومياً',
    whatsapp: envWhatsapp || '',
    whatsappLink: envWhatsapp ? `https://wa.me/${envWhatsapp.replace(/[^0-9]/g, '')}` : '',
    addressNote: 'الجزائر العاصمة • خدمة التوصيل متوفرة لكافة الـ 58 ولاية جزائرية',
    workingHours: 'يومياً من 9:00 صباحاً حتى 8:00 مساءً',
  },
  social: {
    instagram: envInstagram || undefined,
    tiktok: envTiktok || undefined,
  },
  delivery: {
    coveredWilayas: 58,
    paymentMethod: 'الدفع نقداً عند الاستلام (COD)',
    averageTimeNorth: '24 إلى 48 ساعة',
    averageTimeSouth: '3 إلى 5 أيام',
  },
};

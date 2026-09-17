import type { Metadata } from 'next';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CartToast } from '@/components/CartToast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { siteConfig } from '@/config/site';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Creed Perfumes الجزائر | بوتيك العطور الفاخرة - الدفع عند الاستلام',
    template: '%s | Creed Perfumes الجزائر',
  },
  description: 'بوتيك عطور دار Creed الفاخرة لزبائن الجزائر. تشكيلة مختارة من أرقى العطور العالمية، مع خدمة التوصيل لكافة الـ 58 ولاية جزائرية والدفع نقدًا عند الاستلام (COD).',
  keywords: [
    'عطور الجزائر',
    'Creed Perfumes Algeria',
    'كريد أفينتوس الجزائر',
    'عطور نيش الجزائر',
    'عطور رجالية فاخرة',
    'عطور نسائية فاخرة',
    'الدفع عند الاستلام الجزائر',
    'Creed Aventus DZ',
    'عطور 58 ولاية'
  ],
  authors: [{ name: 'Creed Perfumes DZ' }],
  creator: 'Creed Perfumes DZ',
  publisher: 'Creed Perfumes DZ',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ar_DZ',
    url: siteConfig.url,
    title: 'Creed Perfumes الجزائر | بوتيك العطور الفاخرة',
    description: 'تسوق أرقى عطور دار Creed العالمية في الجزائر مع خدمة التوصيل السريع لكافة الـ 58 ولاية والدفع نقدًا عند الاستلام.',
    siteName: 'Creed Perfumes DZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creed Perfumes الجزائر | بوتيك العطور الفاخرة',
    description: 'تسوق عطور Creed الفاخرة بنظام الدفع عند الاستلام لكافة الـ 58 ولاية جزائرية.',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Creed Perfumes الجزائر',
    description: siteConfig.description,
    url: siteConfig.url,
    priceRange: '28000 DZD - 42000 DZD',
    paymentAccepted: 'Cash on delivery',
    currenciesAccepted: 'DZD',
    areaServed: {
      '@type': 'Country',
      name: 'Algeria',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Creed Perfumes Haute Parfumerie',
    },
  };

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#F7F4EE] text-[#151515] flex flex-col min-h-screen selection:bg-[#E5E0D5] selection:text-[#151515]">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <CartToast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

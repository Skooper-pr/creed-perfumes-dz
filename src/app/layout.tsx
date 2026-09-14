import type { Metadata } from 'next';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CartToast } from '@/components/CartToast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Creed Perfumes الجزائر | متجر العطور الفاخرة - الدفع عند الاستلام',
  description: 'المتجر الأول في الجزائر لبيع عطور Creed الملكية الأصلية بنظام الدفع عند الاستلام لكافة الـ 58 ولاية. عطور نيش فاخرة وأسعار بالدينار الجزائري (دج).',
  keywords: 'عطور الجزائر, Creed Perfumes, كريد أفينتوس, عطور رجالية, عطور نسائية, دفع عند الاستلام الجزائر, COD الجزائر, عطور أصلية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${jakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary-fixed selection:text-primary">
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

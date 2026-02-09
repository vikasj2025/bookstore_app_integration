import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Online Bookstore',
    template: '%s | Online Bookstore',
  },
  description: 'Discover and purchase your favorite books online',
  keywords: ['books', 'bookstore', 'online shopping', 'literature', 'reading'],
  authors: [{ name: 'Online Bookstore Team' }],
  creator: 'Online Bookstore',
  publisher: 'Online Bookstore',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookstore.com',
    siteName: 'Online Bookstore',
    title: 'Online Bookstore - Discover Your Next Great Read',
    description: 'Browse thousands of books across all genres. Fast shipping, great prices, and excellent customer service.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Online Bookstore',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Bookstore',
    description: 'Discover and purchase your favorite books online',
    images: ['/og-image.jpg'],
    creator: '@bookstore',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  alternates: {
    canonical: 'https://bookstore.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          <div className="flex min-h-full flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

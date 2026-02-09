import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Online Bookstore',
    template: '%s | Online Bookstore',
  },
  description: 'Your favorite online bookstore with a vast collection of books',
  keywords: ['books', 'bookstore', 'online', 'reading', 'literature'],
  authors: [{ name: 'Online Bookstore Team' }],
  creator: 'Online Bookstore',
  publisher: 'Online Bookstore',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bookstore.com',
    siteName: 'Online Bookstore',
    title: 'Online Bookstore',
    description: 'Your favorite online bookstore with a vast collection of books',
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
    description: 'Your favorite online bookstore with a vast collection of books',
    images: ['/og-image.jpg'],
    creator: '@bookstore',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

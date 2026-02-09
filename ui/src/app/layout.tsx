import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Online Bookstore - Your Gateway to Knowledge',
  description: 'Discover and purchase books from our extensive collection. Browse by category, author, or search for your favorite titles.',
  keywords: 'books, bookstore, online books, literature, fiction, non-fiction, education',
  authors: [{ name: 'Bookstore Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Online Bookstore - Your Gateway to Knowledge',
    description: 'Discover and purchase books from our extensive collection.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Online Bookstore',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Bookstore - Your Gateway to Knowledge',
    description: 'Discover and purchase books from our extensive collection.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 min-h-0">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

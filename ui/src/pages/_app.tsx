import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps, router }: AppProps) {
  // Pages that don't need the main layout
  const noLayoutPages = ['/login', '/register', '/404', '/500'];
  const useLayout = !noLayoutPages.includes(router.pathname);

  return (
    <div className={inter.className}>
      <AuthProvider>
        {useLayout ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </AuthProvider>
    </div>
  );
}

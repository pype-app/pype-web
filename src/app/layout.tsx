import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import CookieBanner from '@/components/CookieBanner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { APP_NAME } from '@/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${APP_NAME} - Pipeline Orchestrator`,
  description: 'Multi-tenant pipeline orchestration platform - pype.app.br',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
          <CookieBanner />
        </ErrorBoundary>
      </body>
    </html>
  );
}
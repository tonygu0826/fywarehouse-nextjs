import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Montserrat, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-primary',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fallback',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FY Warehouse | Montreal Sufferance Warehouse',
  description: 'FY Warehouse sufferance warehouse, warehousing, and distribution services in Montreal.',
  keywords: ['FY Warehouse', 'sufferance warehouse', 'Montreal warehouse', 'warehousing', 'distribution'],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${notoSansSC.variable} ${montserrat.variable}`}>{children}</body>
    </html>
  );
}

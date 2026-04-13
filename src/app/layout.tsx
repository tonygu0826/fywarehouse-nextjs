import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Montserrat, Noto_Sans_SC } from 'next/font/google';
import Script from 'next/script';
import { AnalyticsShell } from '@/components/Analytics/AnalyticsShell';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/SEO/JsonLd';
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
  metadataBase: new URL('https://www.fywarehouse.com'),
  title: {
    default: 'FENGYE LOGISTICS | Montreal Sufferance Warehouse',
    template: '%s | FENGYE LOGISTICS',
  },
  description: 'FENGYE LOGISTICS (FENGYE Warehouse) — sufferance warehouse, warehousing, and distribution services in Montreal, Canada.',
  keywords: ['FENGYE LOGISTICS', 'FENGYE Warehouse', 'sufferance warehouse', 'Montreal warehouse', 'warehousing', 'distribution', 'logistics', 'customs', 'supply chain'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://www.fywarehouse.com',
    siteName: 'FENGYE LOGISTICS',
    title: 'FENGYE LOGISTICS | Montreal Sufferance Warehouse',
    description: 'FENGYE LOGISTICS — sufferance warehouse, warehousing, and distribution services in Montreal, Canada.',
    images: [{ url: '/api/og?title=FENGYE%20LOGISTICS&category=Montreal%20Warehousing', alt: 'FENGYE LOGISTICS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FENGYE LOGISTICS | Montreal Sufferance Warehouse',
    description: 'FENGYE LOGISTICS — sufferance warehouse, warehousing, and distribution services in Montreal.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com',
    languages: {
      'en': 'https://www.fywarehouse.com',
      'fr': 'https://www.fywarehouse.com/fr',
      'x-default': 'https://www.fywarehouse.com',
    },
    types: {
      'application/rss+xml': 'https://www.fywarehouse.com/feed.xml',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch and preconnect for critical third-party origins */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* GEO meta tags for local SEO */}
        <meta name="geo.region" content="CA-QC" />
        <meta name="geo.placename" content="Lachine, Montreal" />
        <meta name="geo.position" content="45.4587;-73.6785" />
        <meta name="ICBM" content="45.4587, -73.6785" />
      </head>
      <body className={`${notoSansSC.variable} ${montserrat.variable}`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HY3YP9YVPW" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-HY3YP9YVPW');
            gtag('config', 'G-HD9MSP5L8G');
            gtag('config', 'G-VWSC3KX9BD');
          `}
        </Script>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {children}
        <AnalyticsShell />
        <Script id="crisp-widget" strategy="afterInteractive" dangerouslySetInnerHTML={{__html: `window.$crisp=[];window.CRISP_WEBSITE_ID="455ee6fd-9d0a-481b-9338-fed7d7d70746";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();window.$crisp.push(["config","position:reverse",true]);setTimeout(function(){window.$crisp.push(["do","message:show",["text","👋 Need warehousing in Canada? We reply in minutes!"]]);},5000);`}} />
      </body>
    </html>
  );
}

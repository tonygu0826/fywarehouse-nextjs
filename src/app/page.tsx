import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { Hero } from '@/components/Hero/Hero';
import { Services } from '@/components/Services/Services';
import { CTABanner } from '@/components/CTA/CTABanner';
import { LocalBusinessJsonLd } from '@/components/SEO/JsonLd';
import { LatestNews } from '@/components/News/LatestNews';
import { AnimateOnScroll } from '@/components/AnimateOnScroll/AnimateOnScroll';

const Contact = dynamic(() => import('@/components/Contact/Contact').then((m) => m.Contact), {
  ssr: true,
});

const Map = dynamic(() => import('@/components/Map/Map').then((module) => module.Map), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Montreal's Trusted Warehouse & Logistics Partner | FENGYE LOGISTICS",
  description: 'FENGYE LOGISTICS provides CBSA-authorized sufferance warehouse, warehousing, distribution, and local delivery services in Montreal, Quebec. Fast cross-dock handling, bonded cargo support, and customs examination.',
  keywords: ['Montreal warehouse', 'sufferance warehouse Montreal', 'CBSA authorized warehouse', 'Montreal logistics', 'bonded cargo Montreal', 'freight warehousing Quebec', 'FENGYE LOGISTICS', 'distribution services Montreal', 'customs warehouse Canada'],
  openGraph: {
    title: "Montreal's Trusted Warehouse & Logistics Partner",
    description: 'CBSA-authorized sufferance warehouse, warehousing, and distribution services in Montreal. Fast cross-dock handling and bonded cargo support.',
    url: 'https://www.fywarehouse.com',
    type: 'website',
    locale: 'en_CA',
    images: [{ url: '/api/og?title=Montreal%20Warehouse%20%26%20Logistics&category=FENGYE%20LOGISTICS', alt: 'FENGYE LOGISTICS Montreal Warehouse' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Montreal's Trusted Warehouse & Logistics Partner",
    description: 'CBSA-authorized sufferance warehouse and distribution services in Montreal.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com',
    languages: {
      'en': 'https://www.fywarehouse.com',
      'fr': 'https://www.fywarehouse.com/fr',
      'zh': 'https://www.fywarehouse.com/zh',
      'x-default': 'https://www.fywarehouse.com',
    },
  },
};

export default function HomePage() {
  return (
    <main>
      <LocalBusinessJsonLd />
      <Header />
      <Hero />
      <AnimateOnScroll>
        <Services />
      </AnimateOnScroll>
      <CTABanner />
      <AnimateOnScroll delay={100}>
        <Contact />
      </AnimateOnScroll>
      <AnimateOnScroll delay={100}>
        <LatestNews />
      </AnimateOnScroll>
      <Map />
      <Footer />
    </main>
  );
}

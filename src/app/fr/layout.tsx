import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'FENGYE LOGISTICS | Entrep\u00f4t sous douane Montr\u00e9al',
    template: '%s | FENGYE LOGISTICS',
  },
  description:
    "Services d'entreposage, de distribution et de d\u00e9douanement \u00e0 Montr\u00e9al. FENGYE LOGISTICS \u2014 entrep\u00f4t sous douane, logistique et livraison locale au Canada.",
  keywords: [
    'FENGYE LOGISTICS',
    'entrep\u00f4t sous douane',
    'entrep\u00f4t Montr\u00e9al',
    'logistique Montr\u00e9al',
    'distribution',
    'd\u00e9douanement',
    'fret',
    'cha\u00eene d\'approvisionnement',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    url: 'https://www.fywarehouse.com/fr',
    siteName: 'FENGYE LOGISTICS',
    title: 'FENGYE LOGISTICS | Entrep\u00f4t sous douane Montr\u00e9al',
    description:
      "FENGYE LOGISTICS \u2014 services d'entreposage, de distribution et de d\u00e9douanement \u00e0 Montr\u00e9al, Canada.",
    images: [
      {
        url: '/api/og?title=FENGYE%20LOGISTICS&category=Entrep%C3%B4t%20Montr%C3%A9al',
        alt: 'FENGYE LOGISTICS',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr',
    languages: {
      en: 'https://www.fywarehouse.com',
      fr: 'https://www.fywarehouse.com/fr',
      zh: 'https://www.fywarehouse.com/zh',
      'x-default': 'https://www.fywarehouse.com',
    },
  },
};

export default function FrenchLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div lang="fr">
      {children}
    </div>
  );
}

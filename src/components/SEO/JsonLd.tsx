import type { NewsArticle } from '@/lib/news';

type JsonLdProps = {
  data: Record<string, unknown>;
};

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://www.fywarehouse.com/#organization',
        name: 'FENGYE LOGISTICS',
        alternateName: ['FENGYE Warehouse', 'Fengye Logistics Inc.', '丰业物流'],
        legalName: 'FENGYE LOGISTICS INC.',
        description:
          'CBSA-authorized sufferance and bonded warehouse in Montreal, Quebec. FENGYE LOGISTICS helps European exporters and international freight forwarders land goods in Canada with warehousing, customs clearance support, consolidation/deconsolidation, and last-mile distribution across Quebec and Eastern Canada.',
        slogan: "Montreal's trusted CBSA-authorized bonded warehouse for European exporters",
        url: 'https://www.fywarehouse.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
          width: 600,
          height: 200,
        },
        image: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
        foundingDate: '2019',
        founder: {
          '@type': 'Person',
          name: 'Tony Gu',
          jobTitle: 'Managing Director',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2100C 52e Avenue Dock:5-6-7',
          addressLocality: 'Lachine',
          addressRegion: 'QC',
          postalCode: 'H8T 2Y5',
          addressCountry: 'CA',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+1-438-488-5382',
            contactType: 'customer service',
            email: 'ops@fywarehouse.com',
            availableLanguage: ['English', 'French', 'Chinese'],
            areaServed: ['CA', 'US', 'EU'],
          },
          {
            '@type': 'ContactPoint',
            telephone: '+1-438-488-5382',
            contactType: 'sales',
            email: 'ops@fywarehouse.com',
            availableLanguage: ['English', 'French'],
            areaServed: ['CA', 'EU'],
          },
        ],
        areaServed: [
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'AdministrativeArea', name: 'Quebec' },
          { '@type': 'AdministrativeArea', name: 'Ontario' },
          { '@type': 'Place', name: 'Montreal metropolitan area' },
        ],
        knowsAbout: [
          'CBSA-authorized sufferance warehouse',
          'Bonded warehousing',
          'CARM registration',
          'Customs clearance support',
          'LCL and FCL consolidation',
          'Deconsolidation',
          'Last-mile distribution',
          'CETA Canada-EU trade',
          'Cross-border freight forwarding',
          'Montreal port logistics',
        ],
        knowsLanguage: ['en', 'fr', 'zh'],
        industry: 'Warehousing and Logistics',
        naics: '493110',
        isicV4: '5210',
      }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': 'https://www.fywarehouse.com/#business',
        name: 'FENGYE LOGISTICS',
        legalName: 'FENGYE LOGISTICS INC.',
        description:
          'CBSA-authorized sufferance and bonded warehouse in Montreal, Quebec. We provide warehousing, customs clearance support, LCL/FCL consolidation and deconsolidation, and last-mile distribution across Quebec and Eastern Canada. Specialized in helping European exporters and international freight forwarders enter the Canadian market under CETA.',
        url: 'https://www.fywarehouse.com',
        telephone: '+1-438-488-5382',
        email: 'ops@fywarehouse.com',
        image: [
          'https://www.fywarehouse.com/assets/logo-full-transparent.png',
        ],
        logo: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
        foundingDate: '2019',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2100C 52e Avenue Dock:5-6-7',
          addressLocality: 'Lachine',
          addressRegion: 'QC',
          postalCode: 'H8T 2Y5',
          addressCountry: 'CA',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 45.4587,
          longitude: -73.6785,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00',
        },
        priceRange: '$$',
        currenciesAccepted: 'CAD, USD, EUR',
        paymentAccepted: 'Invoice (Net 30), Wire Transfer, Credit Card',
        areaServed: [
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'AdministrativeArea', name: 'Quebec' },
          { '@type': 'AdministrativeArea', name: 'Ontario' },
          { '@type': 'Place', name: 'Montreal metropolitan area' },
          { '@type': 'Place', name: 'Port of Montreal' },
        ],
        serviceArea: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 45.4587,
            longitude: -73.6785,
          },
          geoRadius: '500000',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'FENGYE LOGISTICS Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'CBSA Sufferance Warehouse',
                description:
                  'CBSA-authorized sufferance warehouse for bonded storage of imported goods pending customs clearance. Duty deferral, customs exam facilities, and seamless clearance workflow.',
                serviceType: 'Bonded Warehousing',
                areaServed: { '@type': 'Place', name: 'Montreal, Quebec' },
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Consolidation & Deconsolidation',
                description:
                  'LCL/FCL cargo consolidation and deconsolidation at our Montreal facility. Sort, palletize, and prepare shipments for distribution across Canada.',
                serviceType: 'Freight Consolidation',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Warehousing & Distribution',
                description:
                  'Short-term and long-term warehousing, inventory management, and distribution services for importers and 3PL clients.',
                serviceType: 'Warehousing',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Last-Mile Delivery (Montreal metro)',
                description:
                  'Local truck delivery across the Island of Montreal, Laval, North Shore, South Shore, and the Highway 20 / 40 corridors.',
                serviceType: 'Last-Mile Delivery',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Customs Clearance Support & CARM Registration',
                description:
                  'Assistance with CBSA customs clearance workflow, CARM Client Portal registration, and liaison with licensed Canadian customs brokers.',
                serviceType: 'Customs Support',
              },
            },
          ],
        },
        keywords:
          'sufferance warehouse Montreal, bonded warehouse Quebec, CBSA authorized warehouse, European exporters Canada, CETA trade, freight forwarding Montreal, consolidation warehouse, last-mile delivery Montreal, CARM registration',
      }}
    />
  );
}

export function NewsArticleJsonLd({ article }: { article: NewsArticle }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.metaDescription,
        image: article.featuredImage || undefined,
        datePublished: article.publishedAt || article.createdAt,
        dateModified: article.updatedAt,
        author: {
          '@type': 'Organization',
          name: article.author || 'FENGYE LOGISTICS',
          url: 'https://www.fywarehouse.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'FENGYE LOGISTICS',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://www.fywarehouse.com/news/${article.slug}`,
        },
        keywords: [article.targetKeyword, ...article.tags].filter(Boolean).join(', '),
        wordCount: article.wordCount,
        articleSection: article.category,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.article-summary', 'h2'],
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null;
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'FY Warehouse',
        url: 'https://www.fywarehouse.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.fywarehouse.com/news?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export type HowToStep = {
  name: string;
  text: string;
};

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        description,
        ...(totalTime ? { totalTime } : {}),
        step: steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      }}
    />
  );
}

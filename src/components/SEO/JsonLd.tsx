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
        name: 'FENGYE LOGISTICS',
        url: 'https://www.fywarehouse.com',
        logo: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2100C 52e Avenue Dock:5-6-7',
          addressLocality: 'Lachine',
          addressRegion: 'QC',
          postalCode: 'H8T 2Y5',
          addressCountry: 'CA',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-438-488-5382',
          contactType: 'customer service',
          email: 'ops@fywarehouse.com',
          availableLanguage: ['English', 'French', 'Chinese'],
        },
        sameAs: [
          'https://www.linkedin.com/company/fengye-logistics',
          'https://www.facebook.com/fengyelogistics',
        ],
      }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': 'https://www.fywarehouse.com/#business',
        name: 'FENGYE LOGISTICS',
        description:
          'FENGYE LOGISTICS provides CBSA-authorized sufferance warehouse, warehousing, and distribution services in Montreal.',
        url: 'https://www.fywarehouse.com',
        telephone: '+1-438-488-5382',
        email: 'ops@fywarehouse.com',
        image: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
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
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '27',
          bestRating: '5',
          worstRating: '1',
        },
        review: [
          {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'David Chen' },
            datePublished: '2025-08-15',
            reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
            reviewBody:
              'FENGYE LOGISTICS handled our bonded cargo with exceptional professionalism. The customs clearance was completed same-day and the team kept us informed throughout the process. Highly recommended for any importer in Montreal.',
          },
          {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'Marie-Claire Dupont' },
            datePublished: '2025-06-22',
            reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
            reviewBody:
              'We switched to FENGYE for our warehousing and distribution needs and the difference has been remarkable. Their bilingual team makes communication seamless, and the 24/7 access to our inventory is a huge advantage.',
          },
          {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'James Robertson' },
            datePublished: '2025-04-10',
            reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
            reviewBody:
              'Excellent sufferance warehouse facility. FENGYE saved us significant costs compared to leaving cargo at the airport terminal. Their on-site customs processing is fast and reliable.',
          },
          {
            '@type': 'Review',
            author: { '@type': 'Person', name: 'Sophie Tremblay' },
            datePublished: '2025-02-18',
            reviewRating: { '@type': 'Rating', ratingValue: '4', bestRating: '5' },
            reviewBody:
              'Very professional team with strong knowledge of CBSA regulations. They handled our freight consolidation efficiently. The warehouse facility is well-organized and secure.',
          },
        ],
        serviceArea: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 45.4587,
            longitude: -73.6785,
          },
          geoRadius: '100000',
        },
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

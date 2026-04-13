import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from '@/components/SEO/JsonLd';
import { servicesData, getServiceBySlug, getAllServiceSlugs } from './services-data';
import { locations } from '@/app/locations/[slug]/locations-data';
import styles from './Services.module.css';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.metaDescription,
    keywords: service.keywords,
    openGraph: {
      title: `${service.title} | FENGYE LOGISTICS`,
      description: service.metaDescription,
      url: `https://www.fywarehouse.com/services/${service.slug}`,
      siteName: 'FENGYE LOGISTICS',
      type: 'website',
      locale: 'en_CA',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(service.shortTitle)}&category=Services`,
          alt: service.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.title} | FENGYE LOGISTICS`,
      description: service.metaDescription,
    },
    alternates: {
      canonical: `https://www.fywarehouse.com/services/${service.slug}`,
      languages: {
        en: `https://www.fywarehouse.com/services/${service.slug}`,
        fr: `https://www.fywarehouse.com/fr/services/${service.slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function ServiceJsonLd({ service }: { service: (typeof servicesData)[number] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: 'FENGYE LOGISTICS',
      url: 'https://www.fywarehouse.com',
      telephone: '+1-438-488-5382',
      email: 'ops@fywarehouse.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2100C 52e Avenue Dock:5-6-7',
        addressLocality: 'Lachine',
        addressRegion: 'QC',
        postalCode: 'H8T 2Y5',
        addressCountry: 'CA',
      },
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 45.5017,
        longitude: -73.5673,
      },
      geoRadius: '100000',
    },
    url: `https://www.fywarehouse.com/services/${service.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const otherServices = servicesData.filter((s) => s.slug !== slug);

  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.fywarehouse.com' },
    { name: 'Services', url: 'https://www.fywarehouse.com/services' },
    { name: service.shortTitle, url: `https://www.fywarehouse.com/services/${service.slug}` },
  ];

  return (
    <main>
      <ServiceJsonLd service={service} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {service.howTo && (
        <HowToJsonLd
          name={service.howTo.name}
          description={service.howTo.description}
          steps={service.howTo.steps}
          totalTime={service.howTo.totalTime}
        />
      )}
      <Header />

      {/* Breadcrumb */}
      <Section className={styles.breadcrumbSection}>
        <Container>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/services">Services</Link>
              </li>
              <li aria-current="page">{service.shortTitle}</li>
            </ol>
          </nav>
        </Container>
      </Section>

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>{service.title}</h1>
          <p className={styles.heroSubtitle}>{service.heroSubtitle}</p>
        </Container>
      </Section>

      {/* Content */}
      <Section className={styles.contentSection}>
        <Container size="narrow">
          {/* Quick Answer */}
          <div className={styles.quickAnswer}>
            <dfn>{service.quickAnswer}</dfn>
          </div>

          <div className={styles.articleContent}>
            {service.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Industry Facts */}
          {service.stats.length > 0 && (
            <aside className={styles.industryFacts}>
              <h2 className={styles.industryFactsTitle}>Industry Facts</h2>
              <div className={styles.factsList}>
                {service.stats.map((stat, index) => (
                  <div key={index} className={styles.factItem}>
                    <span className={styles.factIcon} aria-hidden="true">&#128202;</span>
                    <div className={styles.factContent}>
                      <p className={styles.factText}>{stat.fact}</p>
                      <p className={styles.factSource}>Source: {stat.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </Container>
      </Section>

      {/* Advantages */}
      <Section className={styles.advantagesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>Why Choose FENGYE LOGISTICS</h2>
          <div className={styles.advantagesGrid}>
            {service.advantages.map((advantage) => (
              <div key={advantage.title} className={styles.advantageCard}>
                <h3 className={styles.advantageTitle}>{advantage.title}</h3>
                <p className={styles.advantageDescription}>{advantage.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      {service.faqs.length > 0 && (
        <>
          <FaqJsonLd faqs={service.faqs} />
          <Section className={styles.contentSection}>
            <Container size="narrow">
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              <div className={styles.faqList}>
                {service.faqs.map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Container>
          </Section>
        </>
      )}

      <Footer />
    </main>
  );
}

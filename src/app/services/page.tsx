import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd } from '@/components/SEO/JsonLd';
import { servicesData } from './[slug]/services-data';
import styles from './ServicesOverview.module.css';

export const metadata: Metadata = {
  title: 'Warehouse & Logistics Services',
  description:
    'Explore FENGYE LOGISTICS warehouse and logistics services in Montreal: in-bond cargo handling, consolidation, warehousing, local delivery, and re-palletizing.',
  keywords: [
    'warehouse services Montreal',
    'logistics services Quebec',
    'sufferance warehouse',
    'cargo consolidation',
    'local delivery Montreal',
    'freight services Canada',
  ],
  openGraph: {
    title: 'Warehouse & Logistics Services | FENGYE LOGISTICS',
    description:
      'Complete range of warehousing and logistics services in Montreal, including in-bond cargo handling, consolidation, distribution, and more.',
    url: 'https://www.fywarehouse.com/services',
    siteName: 'FENGYE LOGISTICS',
    type: 'website',
    locale: 'en_CA',
    images: [
      {
        url: '/api/og?title=Our%20Services&category=FENGYE%20LOGISTICS',
        alt: 'FENGYE LOGISTICS Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Warehouse & Logistics Services | FENGYE LOGISTICS',
    description:
      'Complete range of warehousing and logistics services in Montreal by FENGYE LOGISTICS.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/services',
    languages: {
      en: 'https://www.fywarehouse.com/services',
      fr: 'https://www.fywarehouse.com/fr/services',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesOverviewPage() {
  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.fywarehouse.com' },
    { name: 'Services', url: 'https://www.fywarehouse.com/services' },
  ];

  return (
    <main>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'FENGYE LOGISTICS Services',
            description: 'Warehouse and logistics services offered by FENGYE LOGISTICS in Montreal.',
            itemListElement: servicesData.map((service, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: service.title,
              url: `https://www.fywarehouse.com/services/${service.slug}`,
            })),
          }),
        }}
      />
      <Header />

      {/* Breadcrumb */}
      <Section className={styles.breadcrumbSection}>
        <Container>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Services</li>
            </ol>
          </nav>
        </Container>
      </Section>

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Our Warehouse & Logistics Services</h1>
          <p className={styles.heroSubtitle}>
            FENGYE LOGISTICS provides a comprehensive range of warehousing and logistics services from our
            CBSA-authorized facility in Montreal. From in-bond cargo handling and customs examination support
            to local delivery and specialized packaging, we deliver reliable solutions that keep your supply
            chain moving.
          </p>
        </Container>
      </Section>

      {/* Services List */}
      <Section className={styles.servicesSection}>
        <Container>
          <div className={styles.servicesList}>
            {servicesData.map((service, index) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className={`${styles.serviceItem} ${index % 2 === 1 ? styles.serviceItemAlt : ''}`}
              >
                <div className={styles.serviceNumber}>{String(index + 1).padStart(2, '0')}</div>
                <div className={styles.serviceContent}>
                  <h2 className={styles.serviceTitle}>{service.title}</h2>
                  <p className={styles.serviceDescription}>{service.heroSubtitle}</p>
                  <div className={styles.serviceKeywords}>
                    {service.keywords.slice(0, 3).map((keyword) => (
                      <span key={keyword} className={styles.keyword}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <span className={styles.serviceLink}>View Details &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Service Comparison Table */}
      <Section className={styles.comparisonSection}>
        <Container>
          <h2 className={styles.comparisonTitle}>Service Comparison</h2>
          <p className={styles.comparisonSubtitle}>
            Compare our warehouse and logistics services to find the right solution for your business needs.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Best For</th>
                  <th>Typical Timeline</th>
                  <th>Key Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>In-Bond Cargo Handling</strong></td>
                  <td>Importers needing CBSA customs examination</td>
                  <td>2-5 business days</td>
                  <td>CBSA-authorized, secure bonded storage, documentation support</td>
                </tr>
                <tr>
                  <td><strong>Consolidation &amp; De-consolidation</strong></td>
                  <td>Shippers optimizing LCL/FCL freight costs</td>
                  <td>1-3 business days</td>
                  <td>Trailer optimization, multi-dock facility, cross-border expertise</td>
                </tr>
                <tr>
                  <td><strong>Warehousing &amp; Distribution</strong></td>
                  <td>Businesses needing flexible short/long-term storage</td>
                  <td>Same day receiving</td>
                  <td>24/7 security, inventory management, integrated distribution</td>
                </tr>
                <tr>
                  <td><strong>Local Delivery</strong></td>
                  <td>Last mile distribution in Greater Montreal</td>
                  <td>Same day available</td>
                  <td>Greater Montreal coverage, proof of delivery, lift gate equipped</td>
                </tr>
                <tr>
                  <td><strong>Re-palletizing &amp; Re-crating</strong></td>
                  <td>International shippers needing ISPM 15 compliance</td>
                  <td>1-2 business days</td>
                  <td>ISPM 15 certified, custom crates, shrink wrapping &amp; banding</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}

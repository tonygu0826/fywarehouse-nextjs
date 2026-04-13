import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/SEO/JsonLd';
import { locations } from './[slug]/locations-data';
import styles from './[slug]/LocationPage.module.css';

export const metadata: Metadata = {
  title: 'Service Locations | Warehouse & Logistics Across Canada',
  description:
    'FENGYE LOGISTICS serves Montreal, Quebec, and all of Canada with warehousing, customs brokerage, freight forwarding, and supply chain solutions from our CBSA-authorized facility.',
  keywords: [
    'FENGYE LOGISTICS locations',
    'Montreal warehouse',
    'Quebec logistics',
    'Canada freight forwarding',
    'customs broker Montreal',
    'sufferance warehouse',
  ],
  openGraph: {
    title: 'Service Locations | FENGYE LOGISTICS',
    description:
      'Explore FENGYE LOGISTICS service areas across Montreal, Quebec, and Canada. Warehousing, customs, and freight forwarding.',
    url: 'https://www.fywarehouse.com/locations',
    type: 'website',
    images: [
      {
        url: '/api/og?title=Service%20Locations&category=Locations',
        alt: 'FENGYE LOGISTICS Service Locations',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Service Locations | FENGYE LOGISTICS',
    description:
      'Explore FENGYE LOGISTICS service areas across Montreal, Quebec, and Canada.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/locations',
    languages: {
      en: 'https://www.fywarehouse.com/locations',
      fr: 'https://www.fywarehouse.com/fr/locations',
    },
  },
};

export default function LocationsOverviewPage() {
  return (
    <>
      <Header />
      <LocalBusinessJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.fywarehouse.com' },
          { name: 'Locations', url: 'https://www.fywarehouse.com/locations' },
        ]}
      />

      {/* Hero */}
      <section className={styles.hero} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=1920&q=80')" }}>
        <Container>
          <div className={styles.heroContent}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span>Locations</span>
            </nav>
            <h1 className={styles.heroTitle}>Our Service Locations</h1>
            <p className={styles.heroSubtitle}>
              FENGYE LOGISTICS provides warehousing, customs brokerage, freight forwarding, and
              supply chain solutions from our CBSA-authorized facility in Montreal, serving
              businesses across Quebec and all of Canada.
            </p>
          </div>
        </Container>
      </section>

      {/* Overview Content */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>
            Warehousing &amp; Logistics Across Canada
          </h2>
          <p className={styles.sectionText}>
            From our strategically located Montreal warehouse, FENGYE LOGISTICS serves clients
            throughout Quebec and across Canada. Our CBSA-authorized sufferance warehouse, combined
            with comprehensive logistics capabilities, makes us the ideal partner for businesses
            engaged in domestic distribution and international trade. Explore our service areas
            below to learn how we can support your specific logistics needs.
          </p>

          <div className={styles.overviewGrid}>
            {locations.map((location) => (
              <Link
                key={location.slug}
                href={`/locations/${location.slug}`}
                className={styles.overviewCard}
              >
                <h2>{location.title}</h2>
                <p>{location.metaDescription}</p>
                <div className={styles.overviewKeywords}>
                  {location.keywords.slice(0, 3).map((kw) => (
                    <span key={kw}>{kw}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Location Comparison Table */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
            Service Area Comparison
          </h2>
          <p className={styles.sectionText} style={{ textAlign: 'center', margin: '0 auto 32px' }}>
            Compare our logistics capabilities across different service areas to find the best fit for your supply chain needs.
          </p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '8px', border: '1px solid var(--color-tool-border)' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', background: 'var(--color-white)' }}>
              <thead>
                <tr>
                  <th style={{ background: 'var(--color-primary)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, textAlign: 'left', padding: '14px 18px', whiteSpace: 'nowrap' }}>Location</th>
                  <th style={{ background: 'var(--color-primary)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, textAlign: 'left', padding: '14px 18px', whiteSpace: 'nowrap' }}>Key Services</th>
                  <th style={{ background: 'var(--color-primary)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, textAlign: 'left', padding: '14px 18px', whiteSpace: 'nowrap' }}>Distance from Port</th>
                  <th style={{ background: 'var(--color-primary)', color: 'var(--color-white)', fontSize: '14px', fontWeight: 600, textAlign: 'left', padding: '14px 18px', whiteSpace: 'nowrap' }}>Specialization</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}><strong>Montreal Warehouse</strong></td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Warehousing, sufferance, pick &amp; pack, distribution</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>15 km from Port of Montreal</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>CBSA-authorized bonded cargo &amp; e-commerce fulfillment</td>
                </tr>
                <tr style={{ background: 'var(--color-neutral-50)' }}>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}><strong>Quebec Logistics</strong></td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Supply chain management, freight, customs compliance</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Province-wide from Montreal hub</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Bilingual operations &amp; provincial regulatory expertise</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}><strong>Montreal Customs Broker</strong></td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Import clearance, duty optimization, trade compliance</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>On-site at Montreal facility</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>CUSMA/CETA/CPTPP trade agreements &amp; tariff engineering</td>
                </tr>
                <tr style={{ background: 'var(--color-neutral-50)' }}>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}><strong>Canada Freight Forwarding</strong></td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Ocean, air, ground freight, door-to-door logistics</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Direct port &amp; airport access</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5, borderBottom: '1px solid var(--color-tool-border)' }}>Asia-Pacific trade routes &amp; cross-border US-Canada</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5 }}><strong>Montreal Sufferance Warehouse</strong></td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5 }}>Bonded storage, cargo inspection, customs clearance</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5 }}>Near YUL Airport &amp; Port of Montreal</td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', lineHeight: 1.5 }}>Cost-effective alternative to terminal storage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
}

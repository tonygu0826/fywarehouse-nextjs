import type { Metadata } from 'next';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd } from '@/components/SEO/JsonLd';
import { TrackingClient } from './TrackingClient';
import styles from './Tracking.module.css';

export const metadata: Metadata = {
  title: 'Track Your Shipment | FENGYE LOGISTICS - CBSA Cargo Status',
  description:
    'Track your shipment customs clearance status with FENGYE LOGISTICS. Enter your Cargo Control Number (CCN) to check CBSA release status in real time.',
  keywords: [
    'track shipment',
    'cargo control number',
    'CCN tracking',
    'CBSA customs status',
    'shipment tracking Canada',
    'PARS tracking',
    'customs clearance status',
    'Montreal warehouse tracking',
  ],
  openGraph: {
    title: 'Track Your Shipment | FENGYE LOGISTICS',
    description:
      'Enter your Cargo Control Number (CCN) to check your shipment customs clearance status with CBSA.',
    url: 'https://www.fywarehouse.com/tracking',
    siteName: 'FENGYE LOGISTICS',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Your Shipment | FENGYE LOGISTICS',
    description:
      'Check your cargo customs clearance status in real time with FENGYE LOGISTICS.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/tracking',
    languages: {
      en: 'https://www.fywarehouse.com/tracking',
      fr: 'https://www.fywarehouse.com/fr/tracking',
    },
  },
};

const texts = {
  inputPlaceholder: 'Enter your CCN (e.g., 1234-5678-AB01)',
  buttonText: 'Track',
  loadingText: 'Querying CBSA... This may take up to 30 seconds.',
  errorGeneric: 'Failed to query shipment status. Please try again later.',
  ccnLabel: 'Cargo Control Number',
  statusLabel: 'Status',
  transactionLabel: 'Transaction Number',
  officeLabel: 'Release Office',
  timestampLabel: 'Timestamp',
  releasedText: 'Released',
  acceptedText: 'Accepted',
  notOnFileText: 'Not On File',
  pendingText: 'Pending',
  errorText: 'Error',
};

export default function TrackingPage() {
  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.fywarehouse.com' },
          { name: 'Tracking', url: 'https://www.fywarehouse.com/tracking' },
        ]}
      />
      <Header />

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Track Your Shipment</h1>
          <p className={styles.heroSubtitle}>
            Enter your Cargo Control Number (CCN) to check your shipment&apos;s customs clearance status with CBSA.
          </p>
        </Container>
      </Section>

      <TrackingClient texts={texts} />

      {/* Info Section */}
      <Section className={styles.infoSection}>
        <Container>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>What is a CCN?</h3>
              <p className={styles.infoText}>
                A Cargo Control Number (CCN) is a unique identifier assigned to each shipment entering Canada.
                It is used by CBSA to track and control the movement of goods through customs. You can find
                your CCN on your bill of lading, carrier documentation, or by contacting your freight forwarder.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Understanding Status Results</h3>
              <p className={styles.infoText}>
                <strong>Released</strong> means your shipment has been cleared by customs.{' '}
                <strong>Accepted</strong> means the declaration is being processed.{' '}
                <strong>Not On File</strong> means the CCN has not been registered yet.
                Status updates may take a few minutes to reflect changes from CBSA.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Need Help?</h3>
              <p className={styles.infoText}>
                If you have questions about your shipment status or need assistance with customs clearance,
                contact our operations team at{' '}
                <a href="tel:4384885382" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>438-488-5382</a>{' '}
                or email{' '}
                <a href="mailto:ops@fywarehouse.com" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>ops@fywarehouse.com</a>.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}

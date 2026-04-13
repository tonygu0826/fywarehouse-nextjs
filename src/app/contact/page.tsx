import type { Metadata } from 'next';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Contact } from '@/components/Contact/Contact';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './Contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | FENGYE LOGISTICS Montreal Warehouse',
  description:
    'Get in touch with FENGYE LOGISTICS for warehousing, distribution, customs bonded storage, and freight handling services in Montreal. Call 438-488-5382 or fill out our contact form.',
  keywords: [
    'contact FENGYE LOGISTICS',
    'Montreal warehouse contact',
    'freight handling inquiry',
    'warehousing quote Montreal',
    'logistics services contact',
  ],
  openGraph: {
    title: 'Contact Us | FENGYE LOGISTICS',
    description: 'Reach out for warehousing and logistics solutions in Montreal.',
    url: 'https://www.fywarehouse.com/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/contact',
    languages: {
      en: 'https://www.fywarehouse.com/contact',
      fr: 'https://www.fywarehouse.com/fr/contact',
    },
  },
};

export default function ContactPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <span>Contact Us</span>
            </nav>
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroSubtitle}>
              Get in touch with FENGYE LOGISTICS for warehousing, distribution, and customs bonded storage services in Montreal.
            </p>
          </div>
        </Container>
      </Section>

      <Contact />
      <Footer />
    </main>
  );
}

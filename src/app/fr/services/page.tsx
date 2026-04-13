import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd } from '@/components/SEO/JsonLd';
import { servicesData } from '@/app/services/[slug]/services-data';
import { servicesFr } from '@/lib/services-data-fr';
import { getTranslations } from '@/lib/i18n';
import styles from '@/app/services/ServicesOverview.module.css';

const t = getTranslations('fr');

export const metadata: Metadata = {
  title: 'Services d\'entreposage et logistique',
  description:
    'D\u00e9couvrez les services d\'entreposage et de logistique de FENGYE LOGISTICS \u00e0 Montr\u00e9al\u00a0: manutention de fret sous caution, consolidation, entreposage, livraison locale et remise en palette.',
  openGraph: {
    title: 'Services d\'entreposage et logistique | FENGYE LOGISTICS',
    description:
      'Gamme compl\u00e8te de services d\'entreposage et de logistique \u00e0 Montr\u00e9al par FENGYE LOGISTICS.',
    url: 'https://www.fywarehouse.com/fr/services',
    siteName: 'FENGYE LOGISTICS',
    type: 'website',
    locale: 'fr_CA',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr/services',
    languages: {
      en: 'https://www.fywarehouse.com/services',
      fr: 'https://www.fywarehouse.com/fr/services',
    },
  },
};

export default function FrServicesOverviewPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.fywarehouse.com/fr' },
    { name: 'Services', url: 'https://www.fywarehouse.com/fr/services' },
  ];

  return (
    <main>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Header />

      {/* Breadcrumb */}
      <Section className={styles.breadcrumbSection}>
        <Container>
          <nav aria-label="Fil d'Ariane" className={styles.breadcrumb}>
            <ol>
              <li>
                <Link href="/fr">{t.breadcrumb.home}</Link>
              </li>
              <li aria-current="page">{t.breadcrumb.services}</li>
            </ol>
          </nav>
        </Container>
      </Section>

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>{t.services.pageTitle}</h1>
          <p className={styles.heroSubtitle}>
            {t.services.pageDescription}
          </p>
        </Container>
      </Section>

      {/* Services List */}
      <Section className={styles.servicesSection}>
        <Container>
          <div className={styles.servicesList}>
            {servicesData.map((service, index) => {
              const fr = servicesFr[service.slug];
              return (
                <Link
                  key={service.slug}
                  href={`/fr/services/${service.slug}`}
                  className={`${styles.serviceItem} ${index % 2 === 1 ? styles.serviceItemAlt : ''}`}
                >
                  <div className={styles.serviceNumber}>{String(index + 1).padStart(2, '0')}</div>
                  <div className={styles.serviceContent}>
                    <h2 className={styles.serviceTitle}>{fr?.title || service.title}</h2>
                    <p className={styles.serviceDescription}>{fr?.heroSubtitle || service.heroSubtitle}</p>
                    <div className={styles.serviceKeywords}>
                      {service.keywords.slice(0, 3).map((keyword) => (
                        <span key={keyword} className={styles.keyword}>
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <span className={styles.serviceLink}>{t.services.viewDetails} &rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section className={styles.ctaSection}>
        <Container size="narrow">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>{t.services.ctaTitle}</h2>
            <p className={styles.ctaText}>
              {t.services.ctaText}
            </p>
            <div className={styles.ctaActions}>
              <Link href="/fr#contact-us" className={styles.ctaButton}>
                {t.services.ctaButton}
              </Link>
              <a href="tel:4384885382" className={styles.ctaPhone}>
                {t.services.ctaPhone}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}

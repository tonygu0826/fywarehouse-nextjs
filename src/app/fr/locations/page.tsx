import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from '@/components/SEO/JsonLd';
import { locations } from '@/app/locations/[slug]/locations-data';
import { locationsFr } from '@/lib/locations-data-fr';
import { getTranslations } from '@/lib/i18n';
import styles from '@/app/locations/[slug]/LocationPage.module.css';

const t = getTranslations('fr');

export const metadata: Metadata = {
  title: 'Emplacements de service | Entreposage et logistique au Canada',
  description:
    'FENGYE LOGISTICS dessert Montr\u00e9al, le Qu\u00e9bec et tout le Canada avec des services d\'entreposage, de courtage en douane, d\'exp\u00e9dition de fret et de solutions de cha\u00eene d\'approvisionnement.',
  openGraph: {
    title: 'Emplacements de service | FENGYE LOGISTICS',
    description:
      'D\u00e9couvrez les zones de service de FENGYE LOGISTICS \u00e0 Montr\u00e9al, au Qu\u00e9bec et au Canada.',
    url: 'https://www.fywarehouse.com/fr/locations',
    type: 'website',
    locale: 'fr_CA',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr/locations',
    languages: {
      en: 'https://www.fywarehouse.com/locations',
      fr: 'https://www.fywarehouse.com/fr/locations',
    },
  },
};

export default function FrLocationsOverviewPage() {
  return (
    <>
      <Header />
      <LocalBusinessJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', url: 'https://www.fywarehouse.com/fr' },
          { name: 'Emplacements', url: 'https://www.fywarehouse.com/fr/locations' },
        ]}
      />

      {/* Hero */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
              <Link href="/fr">{t.breadcrumb.home}</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span>{t.breadcrumb.locations}</span>
            </nav>
            <h1 className={styles.heroTitle}>{t.locations.pageTitle}</h1>
            <p className={styles.heroSubtitle}>
              {t.locations.pageDescription}
            </p>
          </div>
        </Container>
      </section>

      {/* Overview Content */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>
            {t.locations.sectionTitle}
          </h2>
          <p className={styles.sectionText}>
            {t.locations.sectionText}
          </p>

          <div className={styles.overviewGrid}>
            {locations.map((location) => {
              const fr = locationsFr[location.slug];
              return (
                <Link
                  key={location.slug}
                  href={`/fr/locations/${location.slug}`}
                  className={styles.overviewCard}
                >
                  <h2>{fr?.title || location.title}</h2>
                  <p>{fr?.metaDescription || location.metaDescription}</p>
                  <div className={styles.overviewKeywords}>
                    {location.keywords.slice(0, 3).map((kw) => (
                      <span key={kw}>{kw}</span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <Container>
          <h2 className={styles.ctaTitle}>{t.locations.ctaTitle}</h2>
          <p className={styles.ctaSubtitle}>
            {t.locations.ctaSubtitle}
          </p>
          <div className={styles.ctaGrid}>
            <div className={styles.ctaItem}>
              <span className={styles.ctaItemIcon} aria-hidden="true">
                &#128222;
              </span>
              <span className={styles.ctaItemLabel}>{t.locations.phone}</span>
              <span className={styles.ctaItemValue}>
                <a href="tel:+14384885382">438-488-5382</a>
              </span>
            </div>
            <div className={styles.ctaItem}>
              <span className={styles.ctaItemIcon} aria-hidden="true">
                &#9993;
              </span>
              <span className={styles.ctaItemLabel}>{t.locations.email}</span>
              <span className={styles.ctaItemValue}>
                <a href="mailto:ops@fywarehouse.com">ops@fywarehouse.com</a>
              </span>
            </div>
            <div className={styles.ctaItem}>
              <span className={styles.ctaItemIcon} aria-hidden="true">
                &#128205;
              </span>
              <span className={styles.ctaItemLabel}>{t.locations.location}</span>
              <span className={styles.ctaItemValue}>Montr\u00e9al, QC, Canada</span>
            </div>
          </div>
          <a href="/fr#contact-us" className={styles.ctaButton}>
            {t.locations.requestQuote}
          </a>
        </Container>
      </section>

      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container/Container';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { LocalBusinessJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/SEO/JsonLd';
import { locations, getLocationBySlug, getAllLocationSlugs } from '@/app/locations/[slug]/locations-data';
import { locationsFr } from '@/lib/locations-data-fr';
import { servicesData } from '@/app/services/[slug]/services-data';
import { servicesFr } from '@/lib/services-data-fr';
import { getTranslations } from '@/lib/i18n';
import styles from '@/app/locations/[slug]/LocationPage.module.css';

const t = getTranslations('fr');

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = getLocationBySlug(params.slug);
  if (!location) return { title: 'Non trouv\u00e9' };

  const fr = locationsFr[location.slug];
  const title = fr?.title || location.metaTitle;

  return {
    title,
    description: fr?.metaDescription || location.metaDescription,
    keywords: location.keywords,
    openGraph: {
      title: `${title} | FENGYE LOGISTICS`,
      description: fr?.metaDescription || location.metaDescription,
      url: `https://www.fywarehouse.com/fr/locations/${location.slug}`,
      type: 'website',
      locale: 'fr_CA',
    },
    alternates: {
      canonical: `https://www.fywarehouse.com/fr/locations/${location.slug}`,
      languages: {
        en: `https://www.fywarehouse.com/locations/${location.slug}`,
        fr: `https://www.fywarehouse.com/fr/locations/${location.slug}`,
      },
    },
  };
}

const internalLinks = [
  { href: '/fr', label: 'Accueil', desc: 'Page d\'accueil FENGYE LOGISTICS' },
  { href: '/fr/services', label: 'Nos services', desc: 'Liste compl\u00e8te des services logistiques' },
  { href: '/fr#contact-us', label: 'Contactez-nous', desc: 'Communiquez avec notre \u00e9quipe' },
  { href: '/fr/news', label: 'Actualit\u00e9s', desc: 'Derni\u00e8res nouvelles logistiques et commerciales' },
  { href: '/fr/locations', label: 'Tous les emplacements', desc: 'Voir toutes les zones de service' },
];

export default function FrLocationPage({ params }: Props) {
  const location = getLocationBySlug(params.slug);
  if (!location) notFound();

  const fr = locationsFr[location.slug];
  const frTitle = fr?.title || location.title;

  const otherLocations = locations.filter((loc) => loc.slug !== location.slug);

  return (
    <>
      <Header />
      <LocalBusinessJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', url: 'https://www.fywarehouse.com/fr' },
          { name: 'Emplacements', url: 'https://www.fywarehouse.com/fr/locations' },
          {
            name: frTitle,
            url: `https://www.fywarehouse.com/fr/locations/${location.slug}`,
          },
        ]}
      />

      {/* Hero */}
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroContent}>
            <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
              <Link href="/fr">{t.breadcrumb.home}</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/fr/locations">{t.breadcrumb.locations}</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span>{frTitle}</span>
            </nav>
            <h1 className={styles.heroTitle}>{frTitle}</h1>
            <p className={styles.heroSubtitle}>{location.heroSubtitle}</p>
          </div>
        </Container>
      </section>

      {/* Intro */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{location.introHeading}</h2>
          {location.introText.map((text, i) => (
            <p key={i} className={styles.sectionText}>
              {text}
            </p>
          ))}
        </Container>
      </section>

      {/* Services */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{location.servicesHeading}</h2>
          <div className={styles.servicesGrid}>
            {location.services.map((service, i) => (
              <div key={i} className={styles.serviceCard}>
                <span className={styles.serviceIcon} aria-hidden="true">
                  {service.icon}
                </span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Advantages */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{location.advantagesHeading}</h2>
          <ul className={styles.advantagesList}>
            {location.advantages.map((adv, i) => (
              <li key={i}>
                <span className={styles.checkIcon} aria-hidden="true">
                  &#10003;
                </span>
                {adv}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Detail */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{location.detailHeading}</h2>
          {location.detailText.map((text, i) => (
            <p key={i} className={styles.sectionText}>
              {text}
            </p>
          ))}
        </Container>
      </section>

      {/* FAQ */}
      {location.faqs.length > 0 && (
        <>
          <FaqJsonLd faqs={location.faqs} />
          <section className={styles.contentSection}>
            <Container>
              <h2 className={styles.sectionTitle}>{t.locations.faqTitle}</h2>
              <div className={styles.faqList}>
                {location.faqs.map((faq, i) => (
                  <div key={i} className={styles.faqItem}>
                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      {/* Our Services */}
      <section className={styles.contentSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{t.locations.ourServices}</h2>
          <div className={styles.servicesGrid}>
            {servicesData.slice(0, 5).map((svc) => {
              const svcFr = servicesFr[svc.slug];
              return (
                <Link key={svc.slug} href={`/fr/services/${svc.slug}`} className={styles.serviceLink}>
                  <h3>{svcFr?.shortTitle || svc.shortTitle}</h3>
                  <p>{svc.metaDescription.slice(0, 120)}...</p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <Container>
          <h2 className={styles.ctaTitle}>{t.locations.getQuoteTitle}</h2>
          <p className={styles.ctaSubtitle}>
            {t.locations.getQuoteSubtitle}
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

      {/* Internal Links */}
      <section className={styles.linksSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{t.locations.exploreMore}</h2>
          <div className={styles.linksGrid}>
            {internalLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.linkCard}>
                {link.label}
                <span>{link.desc}</span>
              </Link>
            ))}
          </div>
          {otherLocations.length > 0 && (
            <>
              <h3 className={styles.sectionTitle} style={{ marginTop: '32px' }}>
                {t.locations.otherAreas}
              </h3>
              <div className={styles.linksGrid}>
                {otherLocations.map((loc) => {
                  const locFr = locationsFr[loc.slug];
                  return (
                    <Link
                      key={loc.slug}
                      href={`/fr/locations/${loc.slug}`}
                      className={styles.linkCard}
                    >
                      {locFr?.title || loc.title}
                      <span>{(locFr?.metaDescription || loc.metaDescription).slice(0, 80)}...</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </Container>
      </section>

      <Footer />
    </>
  );
}

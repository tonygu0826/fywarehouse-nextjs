import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/SEO/JsonLd';
import { servicesData, getServiceBySlug, getAllServiceSlugs } from '@/app/services/[slug]/services-data';
import { servicesFr } from '@/lib/services-data-fr';
import { locations } from '@/app/locations/[slug]/locations-data';
import { locationsFr } from '@/lib/locations-data-fr';
import { getTranslations } from '@/lib/i18n';
import styles from '@/app/services/[slug]/Services.module.css';

const t = getTranslations('fr');

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

  const fr = servicesFr[slug];
  const title = fr?.title || service.title;

  return {
    title,
    description: service.metaDescription,
    openGraph: {
      title: `${title} | FENGYE LOGISTICS`,
      description: service.metaDescription,
      url: `https://www.fywarehouse.com/fr/services/${service.slug}`,
      siteName: 'FENGYE LOGISTICS',
      type: 'website',
      locale: 'fr_CA',
    },
    alternates: {
      canonical: `https://www.fywarehouse.com/fr/services/${service.slug}`,
      languages: {
        en: `https://www.fywarehouse.com/services/${service.slug}`,
        fr: `https://www.fywarehouse.com/fr/services/${service.slug}`,
      },
    },
  };
}

export default async function FrServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const fr = servicesFr[slug];
  const frTitle = fr?.title || service.title;
  const frShortTitle = fr?.shortTitle || service.shortTitle;
  const frHeroSubtitle = fr?.heroSubtitle || service.heroSubtitle;

  const otherServices = servicesData.filter((s) => s.slug !== slug);

  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://www.fywarehouse.com/fr' },
    { name: 'Services', url: 'https://www.fywarehouse.com/fr/services' },
    { name: frShortTitle, url: `https://www.fywarehouse.com/fr/services/${service.slug}` },
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
              <li>
                <Link href="/fr/services">{t.breadcrumb.services}</Link>
              </li>
              <li aria-current="page">{frShortTitle}</li>
            </ol>
          </nav>
        </Container>
      </Section>

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>{frTitle}</h1>
          <p className={styles.heroSubtitle}>{frHeroSubtitle}</p>
        </Container>
      </Section>

      {/* Content */}
      <Section className={styles.contentSection}>
        <Container size="narrow">
          <div className={styles.articleContent}>
            {service.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </Section>

      {/* Advantages */}
      <Section className={styles.advantagesSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{t.services.whyChoose}</h2>
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

      {/* Related Services */}
      <Section className={styles.relatedSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{t.services.exploreOther}</h2>
          <div className={styles.relatedGrid}>
            {otherServices.map((s) => {
              const sFr = servicesFr[s.slug];
              return (
                <Link key={s.slug} href={`/fr/services/${s.slug}`} className={styles.relatedCard}>
                  <h3 className={styles.relatedCardTitle}>{sFr?.shortTitle || s.shortTitle}</h3>
                  <p className={styles.relatedCardDescription}>{s.metaDescription}</p>
                  <span className={styles.relatedCardLink}>{t.services.learnMore} &rarr;</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      {service.faqs.length > 0 && (
        <>
          <FaqJsonLd faqs={service.faqs} />
          <Section className={styles.contentSection}>
            <Container size="narrow">
              <h2 className={styles.sectionTitle}>{t.services.faqTitle}</h2>
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

      {/* Explore Our Locations */}
      <Section className={styles.relatedSection}>
        <Container>
          <h2 className={styles.sectionTitle}>{t.services.exploreLocations}</h2>
          <div className={styles.relatedGrid}>
            {locations.slice(0, 5).map((loc) => {
              const locFr = locationsFr[loc.slug];
              return (
                <Link key={loc.slug} href={`/fr/locations/${loc.slug}`} className={styles.relatedCard}>
                  <h3 className={styles.relatedCardTitle}>{locFr?.title || loc.title}</h3>
                  <p className={styles.relatedCardDescription}>{(locFr?.metaDescription || loc.metaDescription).slice(0, 120)}...</p>
                  <span className={styles.relatedCardLink}>{t.services.viewLocation} &rarr;</span>
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
            <h2 className={styles.ctaTitle}>{t.services.readyTitle}</h2>
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

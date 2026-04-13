import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/Container/Container';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { LocalBusinessJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/SEO/JsonLd';
import { locations, getLocationBySlug, getAllLocationSlugs } from './locations-data';
import { servicesData } from '@/app/services/[slug]/services-data';
import styles from './LocationPage.module.css';

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = getLocationBySlug(params.slug);
  if (!location) return { title: 'Not Found' };

  return {
    title: location.metaTitle,
    description: location.metaDescription,
    keywords: location.keywords,
    openGraph: {
      title: `${location.metaTitle} | FENGYE LOGISTICS`,
      description: location.metaDescription,
      url: `https://www.fywarehouse.com/locations/${location.slug}`,
      type: 'website',
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(location.title)}&category=Locations`,
          alt: location.title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${location.metaTitle} | FENGYE LOGISTICS`,
      description: location.metaDescription,
    },
    alternates: {
      canonical: `https://www.fywarehouse.com/locations/${location.slug}`,
      languages: {
        en: `https://www.fywarehouse.com/locations/${location.slug}`,
        fr: `https://www.fywarehouse.com/fr/locations/${location.slug}`,
      },
    },
  };
}

const internalLinks = [
  { href: '/', label: 'Home', desc: 'FENGYE LOGISTICS homepage' },
  { href: '/#services', label: 'Our Services', desc: 'Full list of logistics services' },
  { href: '/#about', label: 'About Us', desc: 'Learn about FENGYE LOGISTICS' },
  { href: '/#contact-us', label: 'Contact Us', desc: 'Get in touch with our team' },
  { href: '/news', label: 'Industry News', desc: 'Latest logistics and trade news' },
  { href: '/locations', label: 'All Locations', desc: 'View all service areas' },
];

export default function LocationPage({ params }: Props) {
  const location = getLocationBySlug(params.slug);
  if (!location) notFound();

  const otherLocations = locations.filter((loc) => loc.slug !== location.slug);

  return (
    <>
      <Header />
      <LocalBusinessJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.fywarehouse.com' },
          { name: 'Locations', url: 'https://www.fywarehouse.com/locations' },
          {
            name: location.title,
            url: `https://www.fywarehouse.com/locations/${location.slug}`,
          },
        ]}
      />

      {/* Hero */}
      <section className={styles.hero} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1920&q=80')" }}>
        <Container>
          <div className={styles.heroContent}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/locations">Locations</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span>{location.title}</span>
            </nav>
            <h1 className={styles.heroTitle}>{location.title}</h1>
            <p className={styles.heroSubtitle}>{location.heroSubtitle}</p>
          </div>
        </Container>
      </section>

      {/* Intro */}
      <section className={styles.contentSection}>
        <Container>
          {/* Quick Answer */}
          <div className={styles.quickAnswer}>
            <dfn>{location.quickAnswer}</dfn>
          </div>

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

          {/* Industry Facts */}
          {location.stats.length > 0 && (
            <aside className={styles.industryFacts}>
              <h3 className={styles.industryFactsTitle}>Industry Facts</h3>
              <div className={styles.factsList}>
                {location.stats.map((stat, i) => (
                  <div key={i} className={styles.factItem}>
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
      </section>

      {/* FAQ */}
      {location.faqs.length > 0 && (
        <>
          <FaqJsonLd faqs={location.faqs} />
          <section className={styles.contentSection}>
            <Container>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
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

      <Footer />
    </>
  );
}

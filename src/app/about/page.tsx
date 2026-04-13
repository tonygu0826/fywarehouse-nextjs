import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd } from '@/components/SEO/JsonLd';

export const metadata: Metadata = {
  title: 'About Us | FENGYE LOGISTICS - CBSA Authorized Warehouse Montreal',
  description:
    'Learn about FENGYE LOGISTICS, a CBSA-authorized bonded warehouse in Montreal. Experienced team, 24/7 operations, serving 1000+ businesses across Canada since 2019.',
  keywords: [
    'about FENGYE LOGISTICS',
    'Montreal warehouse company',
    'CBSA authorized warehouse',
    'bonded warehouse Montreal',
    'logistics company Montreal',
    'warehouse team Montreal',
  ],
  openGraph: {
    title: 'About Us | FENGYE LOGISTICS',
    description:
      'FENGYE LOGISTICS is a CBSA-authorized bonded warehouse in Montreal serving 1000+ businesses with 24/7 operations.',
    url: 'https://www.fywarehouse.com/about',
    siteName: 'FENGYE LOGISTICS',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | FENGYE LOGISTICS',
    description:
      'CBSA-authorized bonded warehouse in Montreal. Experienced team, 24/7 operations, serving businesses across Canada.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/about',
    languages: {
      en: 'https://www.fywarehouse.com/about',
      fr: 'https://www.fywarehouse.com/fr/about',
    },
  },
};

function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.fywarehouse.com/#organization',
    name: 'FENGYE LOGISTICS',
    legalName: 'FENGYE LOGISTICS',
    url: 'https://www.fywarehouse.com',
    logo: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
    image: 'https://www.fywarehouse.com/assets/logo-full-transparent.png',
    description:
      'CBSA-authorized bonded warehouse in Montreal providing warehousing, distribution, customs clearance, and freight forwarding services across Canada.',
    foundingDate: '2019',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2100C 52e Avenue Dock:5-6-7',
      addressLocality: 'Lachine',
      addressRegion: 'QC',
      postalCode: 'H8T 2Y5',
      addressCountry: 'CA',
    },
    telephone: '+1-438-488-5382',
    email: 'ops@fywarehouse.com',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-438-488-5382',
      contactType: 'customer service',
      email: 'ops@fywarehouse.com',
      availableLanguage: ['English', 'French', 'Chinese'],
    },
    areaServed: [
      { '@type': 'City', name: 'Montreal' },
      { '@type': 'AdministrativeArea', name: 'Quebec' },
      { '@type': 'Country', name: 'Canada' },
    ],
    knowsAbout: [
      'Bonded warehousing',
      'Sufferance warehouse operations',
      'Customs clearance',
      'Freight forwarding',
      'Supply chain management',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'CBSA Authorized Sufferance Warehouse License',
      },
    ],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 10,
      maxValue: 50,
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const stats = [
  { value: '1000+', label: 'Businesses Served' },
  { value: '24/7', label: 'Operations' },
  { value: 'Since 2019', label: 'Established' },
];

const credentials = [
  {
    title: 'CBSA Authorized',
    description:
      'Fully authorized by the Canada Border Services Agency to operate as a sufferance warehouse, handling bonded cargo directly from international carriers.',
  },
  {
    title: 'Bonded Warehouse License',
    description:
      'Licensed bonded warehouse facility providing secure storage for goods under customs control until duties are paid and merchandise is released.',
  },
  {
    title: 'ISPM 15 Certified',
    description:
      'Certified to handle heat-treated wood packaging materials in compliance with international phytosanitary standards for export shipments.',
  },
];

export default function AboutPage() {
  return (
    <main>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.fywarehouse.com' },
          { name: 'About', url: 'https://www.fywarehouse.com/about' },
        ]}
      />
      <Header />

      {/* Hero Section */}
      <Section
        style={{
          position: 'relative' as const,
          backgroundImage: "url('https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#fff',
          padding: '80px 0 60px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(15,61,145,0.88) 0%, rgba(15,61,145,0.7) 100%)',
            zIndex: 0,
          }}
        />
        <Container>
          <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
            <h1
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 700,
                marginBottom: '16px',
                lineHeight: 1.2,
              }}
            >
              About FENGYE LOGISTICS
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                lineHeight: 1.7,
                opacity: 0.9,
              }}
            >
              Montreal&apos;s trusted CBSA-authorized bonded warehouse, providing reliable warehousing,
              distribution, and customs services to businesses across Canada.
            </p>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section style={{ padding: '48px 0', background: 'var(--color-neutral-50)' }}>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    margin: '0 0 4px',
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--color-text)', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Our Story */}
      <Section style={{ padding: 'var(--section-padding-desktop)' }}>
        <Container>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-title)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Our Story
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              FENGYE LOGISTICS was founded in Montreal with a clear mission: to provide importers and
              businesses across Canada with a reliable, efficient, and cost-effective warehousing and
              logistics partner. As a CBSA-authorized sufferance warehouse, we bridge the gap between
              international carriers and Canadian customs, offering bonded storage and seamless customs
              clearance under one roof.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Located in Lachine, Quebec, our facility sits at the heart of Montreal&apos;s logistics
              corridor -- minutes from Montreal-Trudeau International Airport (YUL) and the Port of
              Montreal. This strategic position allows us to serve businesses engaged in international
              trade with speed and precision, whether they are importing from Asia, Europe, or the
              United States.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)' }}>
              Over the years, we have grown from a single-service operation into a comprehensive
              logistics provider, offering warehousing, distribution, freight consolidation, local
              delivery, and specialized packaging services. Our growth is driven by one simple
              principle: deliver exceptional service that keeps our clients coming back.
            </p>
          </div>
        </Container>
      </Section>

      {/* Video Section */}
      <Section style={{ padding: 'var(--section-padding-desktop)', background: 'var(--color-neutral-50)' }}>
        <Container>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-title)',
                marginBottom: 'var(--space-6)',
              }}
            >
              See Our Facilities
            </h2>
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/t6yedZodi18"
                title="See Our Facilities"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section style={{ padding: 'var(--section-padding-desktop)', background: 'var(--color-neutral-50)' }}>
        <Container>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-title)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Our Team
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Our team brings together decades of combined experience in warehousing, freight
              management, customs brokerage, and supply chain operations. From seasoned logistics
              coordinators to hands-on warehouse professionals, every member of the FENGYE LOGISTICS
              team is committed to precision, efficiency, and exceptional client service.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              We operate as a multilingual team, fluent in English, French, and Mandarin. This
              language capability is more than a convenience -- it is a competitive advantage for
              our clients engaged in Asia-Pacific trade, allowing us to communicate directly with
              overseas suppliers, shipping lines, and customs authorities on their behalf.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)' }}>
              Our people are our greatest asset. We invest in ongoing training, safety certification,
              and professional development to ensure our team stays at the forefront of industry best
              practices and regulatory requirements.
            </p>
          </div>
        </Container>
      </Section>

      {/* Credentials Section */}
      <Section style={{ padding: 'var(--section-padding-desktop)' }}>
        <Container>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700,
              color: 'var(--color-title)',
              marginBottom: 'var(--space-8)',
            }}
          >
            Certifications &amp; Credentials
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {credentials.map((cred) => (
              <div
                key={cred.title}
                style={{
                  padding: 'var(--space-6)',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-tool-border)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--color-title)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {cred.title}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
                  {cred.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Service Area */}
      <Section style={{ padding: 'var(--section-padding-desktop)', background: 'var(--color-neutral-50)' }}>
        <Container>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-title)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Service Area
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              While our facility is based in Montreal, our logistics reach extends across the entire
              country. We serve clients in Montreal, across Quebec, and throughout Canada, connecting
              businesses to domestic and international supply chains through our comprehensive service
              network.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                'Montreal & Greater Montreal Area',
                'Laval & South Shore',
                'Quebec City',
                'Province of Quebec',
                'Ontario & Eastern Canada',
                'Cross-Canada Distribution',
              ].map((area) => (
                <li
                  key={area}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--color-white)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-tool-border)',
                    fontSize: '14px',
                    color: 'var(--color-title)',
                    fontWeight: 500,
                  }}
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Contact Info */}
      <Section style={{ padding: 'var(--section-padding-desktop)' }}>
        <Container>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--color-title)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Get in Touch
            </h2>
            <div style={{ fontSize: '16px', lineHeight: 2, color: 'var(--color-text)' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--color-title)' }}>
                FENGYE LOGISTICS
              </p>
              <p style={{ margin: '0 0 8px' }}>
                2100C 52e Avenue Dock:5-6-7, Lachine, QC H8T 2Y5
              </p>
              <p style={{ margin: '0 0 8px' }}>
                Phone:{' '}
                <a href="tel:4384885382" style={{ color: 'var(--color-primary)' }}>
                  438-488-5382
                </a>
              </p>
              <p style={{ margin: '0 0 24px' }}>
                Email:{' '}
                <a href="mailto:ops@fywarehouse.com" style={{ color: 'var(--color-primary)' }}>
                  ops@fywarehouse.com
                </a>
              </p>
            </div>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              Contact Us
            </Link>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}

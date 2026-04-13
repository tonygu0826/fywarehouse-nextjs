import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd } from '@/components/SEO/JsonLd';

export const metadata: Metadata = {
  title: 'À propos | FENGYE LOGISTICS - Entrepôt sous douane Montréal',
  description:
    'Découvrez FENGYE LOGISTICS, un entrepôt sous douane autorisé par l\'ASFC à Montréal. Équipe expérimentée, opérations 24/7, au service de plus de 1000 entreprises à travers le Canada depuis 2019.',
  keywords: [
    'à propos FENGYE LOGISTICS',
    'entreprise entrepôt Montréal',
    'entrepôt autorisé ASFC',
    'entrepôt sous douane Montréal',
    'société logistique Montréal',
  ],
  openGraph: {
    title: 'À propos | FENGYE LOGISTICS',
    description:
      'FENGYE LOGISTICS est un entrepôt sous douane autorisé par l\'ASFC à Montréal, au service de plus de 1000 entreprises avec des opérations 24/7.',
    url: 'https://www.fywarehouse.com/fr/about',
    siteName: 'FENGYE LOGISTICS',
    type: 'website',
    locale: 'fr_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'À propos | FENGYE LOGISTICS',
    description:
      'Entrepôt sous douane autorisé par l\'ASFC à Montréal. Équipe expérimentée, opérations 24/7, au service des entreprises à travers le Canada.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr/about',
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
      'Entrepôt sous douane autorisé par l\'ASFC à Montréal offrant des services d\'entreposage, de distribution, de dédouanement et d\'expédition de fret à travers le Canada.',
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
      { '@type': 'City', name: 'Montréal' },
      { '@type': 'AdministrativeArea', name: 'Québec' },
      { '@type': 'Country', name: 'Canada' },
    ],
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
  { value: '1000+', label: 'Entreprises desservies' },
  { value: '24/7', label: 'Opérations' },
  { value: 'Depuis 2019', label: 'Établi' },
  { value: '3', label: 'Langues parlées' },
];

const credentials = [
  {
    title: 'Autorisé par l\'ASFC',
    description:
      'Pleinement autorisé par l\'Agence des services frontaliers du Canada pour opérer en tant qu\'entrepôt sous douane, gérant le fret sous caution directement des transporteurs internationaux.',
  },
  {
    title: 'Licence d\'entrepôt sous douane',
    description:
      'Installation d\'entreposage sous douane licenciée fournissant un stockage sécurisé pour les marchandises sous contrôle douanier jusqu\'au paiement des droits.',
  },
  {
    title: 'Certifié NIMP 15',
    description:
      'Certifié pour manipuler les matériaux d\'emballage en bois traités thermiquement conformément aux normes phytosanitaires internationales pour les expéditions d\'exportation.',
  },
];

export default function AboutPageFr() {
  return (
    <main>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', url: 'https://www.fywarehouse.com/fr' },
          { name: 'À propos', url: 'https://www.fywarehouse.com/fr/about' },
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
              À propos de FENGYE LOGISTICS
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                lineHeight: 1.7,
                opacity: 0.9,
              }}
            >
              L&apos;entrepôt sous douane de confiance à Montréal, autorisé par l&apos;ASFC, offrant des
              services fiables d&apos;entreposage, de distribution et de douane aux entreprises à travers
              le Canada.
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

      {/* Notre histoire */}
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
              Notre histoire
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              FENGYE LOGISTICS a été fondée à Montréal avec une mission claire : offrir aux
              importateurs et aux entreprises à travers le Canada un partenaire d&apos;entreposage et de
              logistique fiable, efficace et économique. En tant qu&apos;entrepôt sous douane autorisé par
              l&apos;ASFC, nous faisons le lien entre les transporteurs internationaux et les douanes
              canadiennes, offrant un stockage sous caution et un dédouanement fluide sous un même toit.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Situé à Lachine, au Québec, notre installation se trouve au coeur du corridor
              logistique de Montréal -- à quelques minutes de l&apos;aéroport international
              Montréal-Trudeau (YUL) et du Port de Montréal. Cette position stratégique nous permet
              de servir les entreprises engagées dans le commerce international avec rapidité et
              précision.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)' }}>
              Au fil des années, nous sommes passés d&apos;une opération à service unique à un fournisseur
              logistique complet, offrant entreposage, distribution, consolidation de fret, livraison
              locale et services d&apos;emballage spécialisé. Notre croissance est motivée par un principe
              simple : offrir un service exceptionnel qui fidélise nos clients.
            </p>
          </div>
        </Container>
      </Section>

      {/* Notre équipe */}
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
              Notre équipe
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Notre équipe rassemble des décennies d&apos;expérience combinée en entreposage, gestion de
              fret, courtage en douane et opérations de chaîne d&apos;approvisionnement. Des coordinateurs
              logistiques chevronnés aux professionnels d&apos;entrepôt, chaque membre de l&apos;équipe
              FENGYE LOGISTICS est engagé envers la précision, l&apos;efficacité et un service client
              exceptionnel.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Nous opérons en tant qu&apos;équipe multilingue, parlant couramment l&apos;anglais, le français
              et le mandarin. Cette capacité linguistique est un avantage concurrentiel pour nos
              clients engagés dans le commerce Asie-Pacifique, nous permettant de communiquer
              directement avec les fournisseurs, les lignes maritimes et les autorités douanières.
            </p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)' }}>
              Nos employés sont notre plus grand atout. Nous investissons dans la formation continue,
              la certification en sécurité et le développement professionnel pour garantir que notre
              équipe reste à la pointe des meilleures pratiques de l&apos;industrie.
            </p>
          </div>
        </Container>
      </Section>

      {/* Certifications */}
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
            Certifications et accréditations
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

      {/* Zone de service */}
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
              Zone de service
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
              Bien que notre installation soit basée à Montréal, notre portée logistique s&apos;étend à
              travers tout le pays. Nous desservons des clients à Montréal, à travers le Québec et
              dans tout le Canada, connectant les entreprises aux chaînes d&apos;approvisionnement
              nationales et internationales.
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
                'Montréal et Grand Montréal',
                'Laval et Rive-Sud',
                'Ville de Québec',
                'Province de Québec',
                'Ontario et Est du Canada',
                'Distribution pancanadienne',
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

      {/* Contact */}
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
              Contactez-nous
            </h2>
            <div style={{ fontSize: '16px', lineHeight: 2, color: 'var(--color-text)' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--color-title)' }}>
                FENGYE LOGISTICS
              </p>
              <p style={{ margin: '0 0 8px' }}>
                2100C 52e Avenue Dock:5-6-7, Lachine, QC H8T 2Y5
              </p>
              <p style={{ margin: '0 0 8px' }}>
                Téléphone :{' '}
                <a href="tel:4384885382" style={{ color: 'var(--color-primary)' }}>
                  438-488-5382
                </a>
              </p>
              <p style={{ margin: '0 0 24px' }}>
                Courriel :{' '}
                <a href="mailto:ops@fywarehouse.com" style={{ color: 'var(--color-primary)' }}>
                  ops@fywarehouse.com
                </a>
              </p>
            </div>
            <Link
              href="/fr/contact"
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
              Contactez-nous
            </Link>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}

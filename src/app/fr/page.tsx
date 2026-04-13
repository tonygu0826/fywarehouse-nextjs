import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { LocalBusinessJsonLd } from '@/components/SEO/JsonLd';
import { LatestNews } from '@/components/News/LatestNews';
import { getTranslations } from '@/lib/i18n';

const Contact = dynamic(() => import('@/components/Contact/Contact').then((m) => m.Contact), {
  ssr: true,
});

const Map = dynamic(() => import('@/components/Map/Map').then((module) => module.Map), {
  ssr: false,
});

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr',
    languages: {
      en: 'https://www.fywarehouse.com',
      fr: 'https://www.fywarehouse.com/fr',
      zh: 'https://www.fywarehouse.com/zh',
      'x-default': 'https://www.fywarehouse.com',
    },
  },
};

const heroImage =
  'https://images.unsplash.com/photo-1497005367839-6e852de72767?auto=format&fit=crop&w=2000&q=85';

const cdnBaseUrl = 'https://user-assets.sxlcdn.com/images/834385';
const fallbackBaseUrl = 'https://images.unsplash.com';

const services = [
  {
    title: 'Manutention de fret sous caution',
    description:
      "Lorsque votre envoi FTL ou LTL doit subir un examen de l'ASFC, choisissez l'entrep\u00f4t sous douane FY pour un processus fluide et sans retards inutiles. Nous g\u00e9rons la soumission de vos documents \u00e0 l'ASFC et transf\u00e9rons votre envoi sous caution vers nos installations.",
    imageSrc: `${cdnBaseUrl}/Fkbro1UZoC2SnDg-fBVF404X8yR0.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85`,
  },
  {
    title: 'Consolidation / D\u00e9consolidation',
    description:
      "Am\u00e9liorez vos op\u00e9rations de fret avec nos services logistiques complets. Que vous transportiez des charges mixtes vers ou depuis le Canada, nous nous occupons de tout. Consolidation, d\u00e9consolidation et distribution locale.",
    imageSrc: `${cdnBaseUrl}/Fi_rYaCNiJbpFZlCoPzJRgnKqL-e.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1617957743098-5e16907f288f?auto=format&fit=crop&w=1600&q=85`,
  },
  {
    title: 'Acc\u00e8s 24/7',
    description:
      "Chez FENGYE, nous comprenons le rythme incessant de l'industrie du transport. Notre entrep\u00f4t est toujours accessible lorsque vous avez besoin de nos services, 24 heures sur 24, 365 jours par an.",
    imageSrc: `${cdnBaseUrl}/FrfwmGkB0RlQeiehGQTtNLQ4O6Ju.png`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=85`,
  },
  {
    title: 'Livraison locale',
    description:
      "Si le temps presse et que vous ne pouvez pas r\u00e9cup\u00e9rer votre fret d\u00e9douan\u00e9, laissez-nous nous en charger. Notre \u00e9quipe organise la livraison locale rapidement et \u00e0 moindre co\u00fbt.",
    imageSrc: `${cdnBaseUrl}/FlN2W5HThoYJnu6Vpd3SsNuwCQb4.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=85`,
  },
  {
    title: 'Remise en palette et remise en caisse',
    description:
      "Nous offrons des services de remise en palette ou en caisse pour vos envois, en utilisant exclusivement des mat\u00e9riaux d'emballage en bois trait\u00e9s thermiquement, certifi\u00e9s NIMP 15.",
    imageSrc: `${cdnBaseUrl}/Fhv2qttxYo0PpVjpkHcGnMp4ST7E.jpg`,
    imageFallbackSrc: `${fallbackBaseUrl}/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1600&q=85`,
  },
] as const;

export default function FrenchHomePage() {
  const t = getTranslations('fr');

  return (
    <main>
      <LocalBusinessJsonLd />
      <Header />

      {/* Hero Section */}
      <Section style={{ position: 'relative', minHeight: '420px', display: 'flex', alignItems: 'center' }}>
        <Image
          src={heroImage}
          alt="Int\u00e9rieur d'entrep\u00f4t de stockage et distribution"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', zIndex: 0 }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,17,96,0.85), rgba(0,17,96,0.5))',
            zIndex: 1,
          }}
        />
        <Container size="wide" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '700px', color: '#fff', padding: '60px 0' }}>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
              {t.hero.title}
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6, opacity: 0.9 }}>
              {t.hero.subtitle}
            </p>
          </div>
        </Container>
      </Section>

      {/* Services Section */}
      <Section id="services" style={{ padding: 'var(--section-padding-desktop)' }}>
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
            {t.services.sectionTitle}
          </h2>
          <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
            {services.map((service) => (
              <div
                key={service.title}
                style={{
                  padding: 'var(--space-6)',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-tool-border)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-title)', marginBottom: 'var(--space-3)' }}>
                  {service.title}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link
              href="/fr/services"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {t.services.viewDetails} &rarr;
            </Link>
          </div>
        </Container>
      </Section>

      {/* Contact Info Section */}
      <Section id="contact-us" style={{ padding: 'var(--section-padding-desktop)', background: 'var(--color-neutral-50)' }}>
        <Container>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700,
              color: 'var(--color-title)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {t.contact.title}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '16px', color: 'var(--color-text)', marginBottom: 'var(--space-8)', lineHeight: 1.7 }}>
            {t.contact.subtitle}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-title)', marginBottom: 'var(--space-2)' }}>{t.contact.address}</p>
              <p style={{ color: 'var(--color-text)', fontSize: '14px', margin: 0 }}>
                2100C 52e Avenue Dock:5-6-7, Lachine, QC H8T 2Y5
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-title)', marginBottom: 'var(--space-2)' }}>{t.contact.phone}</p>
              <a href="tel:4384885382" style={{ color: 'var(--color-primary)', fontSize: '14px' }}>438-488-5382</a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-title)', marginBottom: 'var(--space-2)' }}>{t.contact.email}</p>
              <a href="mailto:ops@fywarehouse.com" style={{ color: 'var(--color-primary)', fontSize: '14px' }}>ops@fywarehouse.com</a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-title)', marginBottom: 'var(--space-2)' }}>{t.contact.businessHours}</p>
              <p style={{ color: 'var(--color-text)', fontSize: '14px', margin: 0 }}>{t.contact.businessHoursValue}</p>
            </div>
          </div>
        </Container>
      </Section>

      <LatestNews />
      <Map />
      <Footer />
    </main>
  );
}

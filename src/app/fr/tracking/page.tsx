import type { Metadata } from 'next';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { BreadcrumbJsonLd } from '@/components/SEO/JsonLd';
import { TrackingClient } from '@/app/tracking/TrackingClient';
import styles from '@/app/tracking/Tracking.module.css';

export const metadata: Metadata = {
  title: 'Suivre votre exp\u00e9dition | FENGYE LOGISTICS - Statut cargo ASFC',
  description:
    'Suivez le statut de d\u00e9douanement de votre exp\u00e9dition avec FENGYE LOGISTICS. Entrez votre num\u00e9ro de contr\u00f4le du fret (CCN) pour v\u00e9rifier le statut de mainlev\u00e9e de l\'ASFC en temps r\u00e9el.',
  keywords: [
    'suivre exp\u00e9dition',
    'num\u00e9ro de contr\u00f4le du fret',
    'suivi CCN',
    'statut douanes ASFC',
    'suivi exp\u00e9dition Canada',
    'suivi PARS',
    'statut d\u00e9douanement',
    'suivi entrep\u00f4t Montr\u00e9al',
  ],
  openGraph: {
    title: 'Suivre votre exp\u00e9dition | FENGYE LOGISTICS',
    description:
      'Entrez votre num\u00e9ro de contr\u00f4le du fret (CCN) pour v\u00e9rifier le statut de d\u00e9douanement de votre exp\u00e9dition aupr\u00e8s de l\'ASFC.',
    url: 'https://www.fywarehouse.com/fr/tracking',
    siteName: 'FENGYE LOGISTICS',
    type: 'website',
    locale: 'fr_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suivre votre exp\u00e9dition | FENGYE LOGISTICS',
    description:
      'V\u00e9rifiez le statut de d\u00e9douanement de votre cargo en temps r\u00e9el avec FENGYE LOGISTICS.',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr/tracking',
    languages: {
      en: 'https://www.fywarehouse.com/tracking',
      fr: 'https://www.fywarehouse.com/fr/tracking',
    },
  },
};

const texts = {
  inputPlaceholder: 'Entrez votre CCN (ex. 1234-5678-AB01)',
  buttonText: 'Suivre',
  loadingText: 'Interrogation de l\'ASFC... Cela peut prendre jusqu\'\u00e0 30 secondes.',
  errorGeneric: 'Impossible de v\u00e9rifier le statut de l\'exp\u00e9dition. Veuillez r\u00e9essayer plus tard.',
  ccnLabel: 'Num\u00e9ro de contr\u00f4le du fret',
  statusLabel: 'Statut',
  transactionLabel: 'Num\u00e9ro de transaction',
  officeLabel: 'Bureau de mainlev\u00e9e',
  timestampLabel: 'Horodatage',
  releasedText: 'Mainlev\u00e9e',
  acceptedText: 'Accept\u00e9',
  notOnFileText: 'Non enregistr\u00e9',
  pendingText: 'En attente',
  errorText: 'Erreur',
};

export default function TrackingPageFr() {
  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          { name: 'Accueil', url: 'https://www.fywarehouse.com/fr' },
          { name: 'Suivi', url: 'https://www.fywarehouse.com/fr/tracking' },
        ]}
      />
      <Header />

      {/* Hero */}
      <Section className={styles.hero}>
        <Container>
          <h1 className={styles.heroTitle}>Suivre votre exp&eacute;dition</h1>
          <p className={styles.heroSubtitle}>
            Entrez votre num&eacute;ro de contr&ocirc;le du fret (CCN) pour v&eacute;rifier le statut de d&eacute;douanement
            de votre exp&eacute;dition aupr&egrave;s de l&apos;ASFC.
          </p>
        </Container>
      </Section>

      <TrackingClient texts={texts} />

      {/* Info Section */}
      <Section className={styles.infoSection}>
        <Container>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Qu&apos;est-ce qu&apos;un CCN&nbsp;?</h3>
              <p className={styles.infoText}>
                Un num&eacute;ro de contr&ocirc;le du fret (CCN) est un identifiant unique attribu&eacute; &agrave; chaque
                exp&eacute;dition entrant au Canada. Il est utilis&eacute; par l&apos;ASFC pour suivre et contr&ocirc;ler
                le mouvement des marchandises &agrave; travers les douanes. Vous pouvez trouver votre CCN
                sur votre connaissement, les documents du transporteur ou en contactant votre transitaire.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Comprendre les r&eacute;sultats</h3>
              <p className={styles.infoText}>
                <strong>Mainlev&eacute;e</strong> signifie que votre exp&eacute;dition a &eacute;t&eacute; d&eacute;douan&eacute;e.{' '}
                <strong>Accept&eacute;</strong> signifie que la d&eacute;claration est en cours de traitement.{' '}
                <strong>Non enregistr&eacute;</strong> signifie que le CCN n&apos;a pas encore &eacute;t&eacute; enregistr&eacute;.
                Les mises &agrave; jour de statut peuvent prendre quelques minutes.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Besoin d&apos;aide&nbsp;?</h3>
              <p className={styles.infoText}>
                Si vous avez des questions sur le statut de votre exp&eacute;dition ou besoin d&apos;aide pour le
                d&eacute;douanement, contactez notre &eacute;quipe des op&eacute;rations au{' '}
                <a href="tel:4384885382" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>438-488-5382</a>{' '}
                ou par courriel &agrave;{' '}
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

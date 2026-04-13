import type { Metadata } from 'next';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Contact } from '@/components/Contact/Contact';
import { Container } from '@/components/Container/Container';

export const metadata: Metadata = {
  title: 'Contactez-nous | FENGYE LOGISTICS Entrepôt Montréal',
  description:
    'Contactez FENGYE LOGISTICS pour des services d\'entreposage, de distribution, de stockage sous douane et de manutention de fret à Montréal. Appelez le 438-488-5382.',
  openGraph: {
    title: 'Contactez-nous | FENGYE LOGISTICS',
    description: 'Solutions d\'entreposage et de logistique à Montréal.',
    url: 'https://www.fywarehouse.com/fr/contact',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.fywarehouse.com/fr/contact',
    languages: {
      en: 'https://www.fywarehouse.com/contact',
      fr: 'https://www.fywarehouse.com/fr/contact',
    },
  },
};

export default function ContactPageFr() {
  return (
    <main>
      <Header />
      <Container>
        <nav aria-label="Fil d'Ariane" style={{ padding: '16px 0 0', fontSize: '14px' }}>
          <a href="/fr" style={{ color: 'var(--color-primary)' }}>Accueil</a>
          {' / '}
          <span style={{ color: 'var(--color-subtext)' }}>Contactez-nous</span>
        </nav>
      </Container>
      <Contact />
      <Footer />
    </main>
  );
}

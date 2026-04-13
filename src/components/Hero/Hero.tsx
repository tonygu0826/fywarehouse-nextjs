import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './Hero.module.css';

const heroImage =
  'https://images.unsplash.com/photo-1497005367839-6e852de72767?auto=format&fit=crop&w=2000&q=85';

export function Hero() {
  return (
    <Section className={styles.hero}>
      <Image
        src={heroImage}
        alt="Warehouse storage and distribution interior"
        fill
        priority
        sizes="100vw"
        className={styles.background}
        style={{ transform: 'scaleY(-1)' }}
      />
      <div className={styles.overlay} />
      <Container size="wide" className={styles.container}>
        <div className={styles.content}>
          <h1>Montreal&apos;s Trusted Warehouse &amp; Logistics Partner</h1>
          <p className={styles.subcopy}>
            CBSA-authorized sufferance warehouse offering cross-dock handling,
            bonded cargo support, and distribution services.
          </p>
          <div className={styles.buttons}>
            <Link href="/contact" className={styles.btnPrimary}>
              Get a Quote
            </Link>
            <Link href="/services" className={styles.btnSecondary}>
              Our Services
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

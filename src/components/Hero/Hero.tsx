import Image from 'next/image';
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
      />
      <div className={styles.overlay} />
      <Container size="wide" className={styles.container}>
        <div className={styles.content}>
          <h1>
            <strong>Warehousing and Distribution</strong>
          </h1>
        </div>
      </Container>
    </Section>
  );
}

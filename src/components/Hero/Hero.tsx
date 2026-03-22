import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <Section className={styles.hero}>
      <Container>
        <div className={styles.content}>
          <h1>Warehousing and Distribution</h1>
        </div>
      </Container>
    </Section>
  );
}

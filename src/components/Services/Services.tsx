import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './Services.module.css';

const services = [
  'Handling and Warehousing of In-Bond Cargo',
  'Consolidation / De-consolidation',
  '24/7 Access',
  'Local Delivery',
];

export function Services() {
  return (
    <Section id="services">
      <Container>
        <div className={styles.header}>
          <h2>Sufferance Warehouse Services</h2>
        </div>
        <div className={styles.grid}>
          {services.map((service) => (
            <article key={service} className={styles.card}>
              <h3>{service}</h3>
              <p>Section scaffold ready for pixel-level content implementation in Day 2.</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './CTABanner.module.css';

export function CTABanner() {
  return (
    <Section className={styles.cta}>
      <Container size="narrow">
        <div className={styles.content}>
          <h2 className={styles.title}>Ready to Streamline Your Supply Chain?</h2>
          <p className={styles.subtitle}>
            Get in touch with our team for a free consultation and quote.
          </p>
          <div className={styles.buttons}>
            <Link href="/contact" className={styles.btnPrimary}>
              Contact Us
            </Link>
            <a href="tel:+14384885382" className={styles.btnSecondary}>
              Call Now: 438-488-5382
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}

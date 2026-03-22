import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <Section id="contact-us">
      <Container>
        <div className={styles.header}>
          <h2>Get Our Service</h2>
          <p>Fill out the form below, and our Client Services team will contact you to kickstart the process.</p>
        </div>
        <div className={styles.columns}>
          <div className={styles.infoPanel}>
            <p>2100C 52e Avenue Dock:5-6-7, Lachine, QC H8T 2Y5</p>
            <p>Mon-Fri 9:00AM-4:30PM</p>
            <p>438-488-5382</p>
            <p>ops@fywarehouse.com</p>
          </div>
          <div className={styles.formShell}>
            <div className={styles.field} />
            <div className={styles.field} />
            <div className={styles.field} />
            <div className={`${styles.field} ${styles.fieldLarge}`} />
            <div className={styles.button}>Form integration scheduled for Day 7</div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

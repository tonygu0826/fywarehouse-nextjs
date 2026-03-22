import { Container } from '@/components/Container/Container';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container size="narrow">
        <div className={styles.content}>
          <strong>FENGYE LOGISTICS</strong>
          <span>Copyright 2024</span>
        </div>
      </Container>
    </footer>
  );
}

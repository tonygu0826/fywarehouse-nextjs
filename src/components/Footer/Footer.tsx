import { Container } from '@/components/Container/Container';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container size="narrow">
        <div className={styles.content}>
          {/* ui-ux-design review: keep white-on-black contrast, preserve centered vertical hierarchy, and retain the shared 727px breakpoint with compact 27px mobile spacing. */}
          <strong className={styles.brand}>FENGYE LOGISTICS</strong>
          <span className={styles.copy}>Copyright 2024</span>
          <a
            className={styles.link}
            href="https://www.web-site-map.com/file.php?n=www.fywarehouse.com&t=1"
            target="_blank"
            rel="noreferrer"
            aria-label="Open Fengye Logistics XML sitemap in a new tab"
          >
            xlm
          </a>
        </div>
      </Container>
    </footer>
  );
}

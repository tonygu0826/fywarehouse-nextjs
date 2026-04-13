import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import styles from './Footer.module.css';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Locations', href: '/locations' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Tracking', href: '/tracking' },
];

const serviceLinks = [
  { label: 'In-Bond', href: '/services' },
  { label: 'Warehousing', href: '/services' },
  { label: 'Consolidation', href: '/services' },
  { label: 'Local Delivery', href: '/services' },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container size="wide">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <strong className={styles.logo}>FENGYE LOGISTICS</strong>
            <p className={styles.description}>
              Montreal-based CBSA-authorized sufferance warehouse providing
              reliable warehousing, cross-dock handling, and distribution
              services.
            </p>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Services</h4>
            <ul className={styles.linkList}>
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Contact Info</h4>
            <address className={styles.contactInfo}>
              <p>2100C 52e Avenue Dock:5-6-7, Lachine, QC H8T 2Y5</p>
              <p>
                <a href="tel:+14384885382" className={styles.link}>
                  438-488-5382
                </a>
              </p>
              <p>
                <a href="mailto:ops@fywarehouse.com" className={styles.link}>
                  ops@fywarehouse.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className={styles.divider} />
        <div className={styles.bottom}>
          <span className={styles.copy}>
            &copy; {new Date().getFullYear()} FENGYE LOGISTICS. All rights
            reserved.
          </span>
        </div>
      </Container>
    </footer>
  );
}

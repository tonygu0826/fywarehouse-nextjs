import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import styles from './Header.module.css';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Contact US', href: '#contact-us' },
  { label: 'Fulfillment Warehouse', href: 'https://www.fengyecang.cn/2', external: true },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Container>
          <div className={styles.topBarInner}>
            <span>438-488-5382</span>
            <span>office@fengyecang.com</span>
          </div>
        </Container>
      </div>
      <div className={styles.navBar}>
        <Container>
          <div className={styles.navInner}>
            <Link href="/" className={styles.logoLink} aria-label="FY Warehouse home">
              <Image
                src="/assets/FgelaufocZF814ibZuUSYOIE-92t.png"
                alt="Montreal Sufferance Warehouse"
                width={300}
                height={300}
                priority
                className={styles.logo}
              />
            </Link>
            <nav aria-label="Primary navigation">
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={item.label} className={styles.navItem}>
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </div>
    </header>
  );
}

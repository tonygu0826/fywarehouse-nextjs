import Link from 'next/link';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import styles from './not-found.module.css';

const navLinks = [
  { href: '/', label: 'Home', icon: '\u{1F3E0}' },
  { href: '/services', label: 'Services', icon: '\u{1F4E6}' },
  { href: '/locations', label: 'Locations', icon: '\u{1F4CD}' },
  { href: '/news', label: 'News', icon: '\u{1F4F0}' },
];

const popularPages = [
  {
    href: '/services/in-bond-cargo-handling',
    label: 'In-Bond Cargo Handling & Sufferance Warehouse',
    desc: 'CBSA-authorized facility for imported goods pending customs clearance',
  },
  {
    href: '/services/warehousing-distribution',
    label: 'Warehousing & Distribution Services',
    desc: 'Flexible storage and integrated distribution in Montreal',
  },
  {
    href: '/locations/montreal-warehouse',
    label: 'Montreal Warehouse & Logistics Services',
    desc: 'Full-service warehousing near YUL airport and the Port of Montreal',
  },
  {
    href: '/locations/montreal-customs-broker',
    label: 'Montreal Customs Broker & Clearance Services',
    desc: 'Expert customs brokerage with fast import/export processing',
  },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <p className={styles.errorCode}>404</p>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Sorry, the page you are looking for does not exist or has been moved.
          Use the links below to find what you need.
        </p>

        <nav className={styles.navGrid} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navCard}>
              <span className={styles.navCardIcon} aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.popularSection}>
          <h2 className={styles.popularTitle}>Popular Pages</h2>
          <div className={styles.popularList}>
            {popularPages.map((page) => (
              <Link key={page.href} href={page.href} className={styles.popularLink}>
                {page.label}
                <span>{page.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

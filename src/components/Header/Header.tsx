'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { trackEvent } from '@/lib/analytics';
import styles from './Header.module.css';

type NavItem = {
  label: string;
  href: string;
  eventName: 'navigation_click' | 'external_link_click';
  external?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/', eventName: 'navigation_click' },
  { label: 'Contact US', href: '#contact-us', eventName: 'navigation_click' },
  { label: 'Fulfillment Warehouse', href: 'https://www.fengyecang.cn/2', external: true, eventName: 'external_link_click' },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Container>
          <div className={styles.topBarInner}>
            <a
              href="tel:4384885382"
              onClick={() => trackEvent('phone_click', { location: 'header_top_bar', phone_number: '438-488-5382' })}
            >
              438-488-5382
            </a>
            <a
              href="mailto:office@fengyecang.com"
              onClick={() => trackEvent('email_click', { location: 'header_top_bar', email_address: 'office@fengyecang.com' })}
            >
              office@fengyecang.com
            </a>
          </div>
        </Container>
      </div>
      <div className={styles.navBar}>
        <Container>
          <div className={styles.navInner}>
            <Link
              href="/"
              className={styles.logoLink}
              aria-label="FY Warehouse home"
              onClick={() => trackEvent('logo_click', { location: 'header' })}
            >
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
                {navItems.map((item) => {
                  const isExternal = 'external' in item && item.external;

                  return (
                    <li key={item.label} className={styles.navItem}>
                      <Link
                        href={item.href}
                        className={styles.navLink}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noreferrer' : undefined}
                        onClick={() =>
                          trackEvent(item.eventName, {
                            location: 'header_navigation',
                            link_text: item.label,
                            link_url: item.href,
                          })
                        }
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </Container>
      </div>
    </header>
  );
}

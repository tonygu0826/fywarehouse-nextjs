'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { trackEvent } from '@/lib/analytics';
import { getTranslations, getLocaleFromPath, switchLocalePath, getLocalePath } from '@/lib/i18n';
import styles from './Header.module.css';

type NavItem = {
  label: string;
  href: string;
  eventName: 'navigation_click' | 'external_link_click';
  external?: boolean;
};

export function Header() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = getTranslations(locale);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: t.nav.home, href: getLocalePath('/', locale), eventName: 'navigation_click' },
    { label: t.nav.services, href: getLocalePath('/services', locale), eventName: 'navigation_click' },
    { label: t.nav.locations, href: getLocalePath('/locations', locale), eventName: 'navigation_click' },
    { label: t.nav.news, href: getLocalePath('/news', locale), eventName: 'navigation_click' },
    { label: t.nav.tracking, href: getLocalePath('/tracking', locale), eventName: 'navigation_click' },
    { label: t.nav.contact, href: getLocalePath('/contact', locale), eventName: 'navigation_click' },
    { label: t.nav.about, href: getLocalePath('/about', locale), eventName: 'navigation_click' },
    { label: locale === 'en' ? 'FR' : 'EN', href: switchLocalePath(pathname, locale === 'en' ? 'fr' : 'en'), eventName: 'navigation_click' },
  ];

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const homeHref = getLocalePath('/', locale);

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
              href="mailto:ops@fywarehouse.com"
              onClick={() => trackEvent('email_click', { location: 'header_top_bar', email_address: 'ops@fywarehouse.com' })}
            >
              ops@fywarehouse.com
            </a>
          </div>
        </Container>
      </div>
      <div className={styles.navBar}>
        <Container>
          <div className={styles.navInner}>
            {/* Mobile hamburger button */}
            <button
              className={styles.hamburger}
              onClick={toggleDrawer}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
            >
              <span className={`${styles.hamburgerLine} ${drawerOpen ? styles.hamburgerOpen : ''}`} />
              <span className={`${styles.hamburgerLine} ${drawerOpen ? styles.hamburgerOpen : ''}`} />
              <span className={`${styles.hamburgerLine} ${drawerOpen ? styles.hamburgerOpen : ''}`} />
            </button>

            <Link
              href={homeHref}
              className={styles.logoLink}
              aria-label="FY Warehouse home"
              onClick={() => trackEvent('logo_click', { location: 'header' })}
            >
              <Image
                src="/assets/logo-full-transparent.png"
                alt="FENGYE LOGISTICS - Montreal Sufferance Warehouse"
                width={300}
                height={77}
                priority
                className={styles.logo}
              />
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Primary navigation" className={styles.desktopNav}>
              <ul className={styles.navList}>
                {navItems.map((item) => {
                  const isExternal = 'external' in item && item.external;
                  const isLangSwitch = item.label === 'FR' || item.label === 'EN';
                  const isActive = !isLangSwitch && (
                    item.href === homeHref
                      ? pathname === homeHref
                      : pathname.startsWith(item.href) && !item.href.startsWith('#') && !item.href.includes('#')
                  );

                  return (
                    <li key={item.label} className={styles.navItem}>
                      <Link
                        href={item.href}
                        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
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

      {/* Mobile drawer overlay */}
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayVisible : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <nav
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        aria-label="Mobile navigation"
      >
        <div className={styles.drawerHeader}>
          <Link href={homeHref} className={styles.drawerLogoLink} onClick={closeDrawer}>
            <Image
              src="/assets/logo-full-transparent.png"
              alt="FENGYE LOGISTICS"
              width={200}
              height={51}
              className={styles.drawerLogo}
            />
          </Link>
          <button className={styles.drawerClose} onClick={closeDrawer} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <ul className={styles.drawerList}>
          {navItems.map((item) => {
            const isExternal = 'external' in item && item.external;
            const isLangSwitch = item.label === 'FR' || item.label === 'EN';
            const isActive = !isLangSwitch && (
              item.href === homeHref
                ? pathname === homeHref
                : pathname.startsWith(item.href) && !item.href.startsWith('#') && !item.href.includes('#')
            );
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                  onClick={() => {
                    closeDrawer();
                    trackEvent(item.eventName, {
                      location: 'mobile_drawer',
                      link_text: item.label,
                      link_url: item.href,
                    });
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.drawerContact}>
          <a
            href="tel:4384885382"
            className={styles.drawerContactLink}
            onClick={() => {
              closeDrawer();
              trackEvent('phone_click', { location: 'mobile_drawer', phone_number: '438-488-5382' });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            438-488-5382
          </a>
          <a
            href="mailto:ops@fywarehouse.com"
            className={styles.drawerContactLink}
            onClick={() => {
              closeDrawer();
              trackEvent('email_click', { location: 'mobile_drawer', email_address: 'ops@fywarehouse.com' });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            ops@fywarehouse.com
          </a>
        </div>
      </nav>
    </header>
  );
}

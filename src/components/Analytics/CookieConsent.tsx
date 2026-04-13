'use client';

import { useEffect, useState } from 'react';
import { ANALYTICS_CONSENT_KEY, getStoredAnalyticsConsent, hasAnalyticsConfig, isProductionAnalyticsEnabled, setStoredAnalyticsConsent, trackEvent } from '@/lib/analytics';
import styles from './CookieConsent.module.css';

type CookieConsentProps = {
  onConsentChange: (granted: boolean) => void;
};

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    const storedConsent = getStoredAnalyticsConsent();
    setConsent(storedConsent);
    onConsentChange(storedConsent === 'accepted');
  }, [onConsentChange]);

  if (!isProductionAnalyticsEnabled() || !hasAnalyticsConfig()) {
    return null;
  }

  const handleChoice = (nextConsent: 'accepted' | 'declined') => {
    setStoredAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
    onConsentChange(nextConsent === 'accepted');

    if (nextConsent === 'accepted') {
      trackEvent('cookie_consent_updated', {
        consent_status: 'accepted',
      });
    }
  };

  if (consent !== null) {
    return (
      <button
        type="button"
        className={styles.manageButton}
        onClick={() => {
          window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
          setConsent(null);
          onConsentChange(false);
        }}
      >
        Privacy settings
      </button>
    );
  }

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Cookie consent banner">
      <div className={styles.content}>
        <p className={styles.title}>Analytics cookies</p>
        <p className={styles.text}>
          FENGYE LOGISTICS uses optional analytics cookies to understand visits, contact-form conversions, and link engagement.
          These scripts stay off until you accept.
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={() => handleChoice('declined')}>
          Decline
        </button>
        <button type="button" className={styles.primaryButton} onClick={() => handleChoice('accepted')}>
          Accept analytics
        </button>
      </div>
    </div>
  );
}

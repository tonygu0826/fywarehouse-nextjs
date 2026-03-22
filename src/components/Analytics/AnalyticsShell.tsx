'use client';

import { useState } from 'react';
import { AnalyticsProvider } from './AnalyticsProvider';
import { CookieConsent } from './CookieConsent';

export function AnalyticsShell() {
  const [consentGranted, setConsentGranted] = useState(false);

  return (
    <>
      <AnalyticsProvider consentGranted={consentGranted} />
      <CookieConsent onConsentChange={setConsentGranted} />
    </>
  );
}

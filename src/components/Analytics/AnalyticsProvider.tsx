'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GTM_ID, ensureDataLayer, hasAnalyticsConfig, isProductionAnalyticsEnabled, trackPageView } from '@/lib/analytics';

type AnalyticsProviderProps = {
  consentGranted: boolean;
};

export function AnalyticsProvider({ consentGranted }: AnalyticsProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    ensureDataLayer();
  }, []);

  useEffect(() => {
    if (!consentGranted || !isProductionAnalyticsEnabled() || typeof window === 'undefined') {
      return;
    }

    trackPageView(`${pathname}${window.location.search}`);
  }, [consentGranted, pathname]);

  if (!consentGranted || !isProductionAnalyticsEnabled() || !hasAnalyticsConfig()) {
    return null;
  }

  return (
    <>
      {GTM_ID ? (
        <>
          <Script
            id="fywarehouse-gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {/* GA gtag.js is loaded unconditionally in src/app/layout.tsx for G-HY3YP9YVPW, G-HD9MSP5L8G, G-VWSC3KX9BD. */}
    </>
  );
}

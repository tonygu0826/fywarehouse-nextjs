export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? '';
export const ANALYTICS_CONSENT_KEY = 'fywarehouse-analytics-consent';

export type AnalyticsConsentState = 'accepted' | 'declined';

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function isProductionAnalyticsEnabled() {
  return process.env.NODE_ENV === 'production';
}

export function hasAnalyticsConfig() {
  return Boolean(GA_MEASUREMENT_ID || GTM_ID);
}

export function getStoredAnalyticsConsent(): AnalyticsConsentState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function setStoredAnalyticsConsent(value: AnalyticsConsentState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
}

export function ensureDataLayer() {
  if (typeof window === 'undefined') {
    return [] as Array<Record<string, unknown>>;
  }

  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function pushToDataLayer(event: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || !isProductionAnalyticsEnabled()) {
    return;
  }

  ensureDataLayer().push({
    event,
    ...params,
  });
}

export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !isProductionAnalyticsEnabled() || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });

  pushToDataLayer('page_view', {
    page_path: url,
    page_location: window.location.href,
  });
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || !isProductionAnalyticsEnabled()) {
    return;
  }

  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  pushToDataLayer(eventName, params);
}

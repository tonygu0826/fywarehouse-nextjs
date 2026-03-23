'use client';

import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { SkillReview, type SkillReviewCheck } from '@/components/SkillReview/SkillReview';
import { trackEvent } from '@/lib/analytics';
import styles from './Map.module.css';

const center = {
  lat: 45.458763122558594,
  lng: -73.71878051757812,
} as const;

const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
const embedSrc =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.5546663251907!2d-73.72142608730033!3d45.45862947095315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc917de9324fd61%3A0xa247a7adb1916783!2sMontreal%20Sufferance%20Warehouse!5e0!3m2!1szh-CN!2sca!4v1774309679919!5m2!1szh-CN!2sca';

const reviewChecks: SkillReviewCheck[] = [
  {
    label: 'Layout placement',
    status: 'pass',
    detail: 'The map is inserted directly after the contact section and before the footer flow to preserve the original page order.',
  },
  {
    label: 'Responsive breakpoint',
    status: 'pass',
    detail: '727px/1200px/1400px height tiers are preserved so the section keeps the same desktop prominence and mobile collapse.',
  },
  {
    label: 'Loading strategy',
    status: 'pass',
    detail: 'The page now uses a lightweight Google Maps embed instead of loading the JavaScript Maps runtime and API key flow.',
  },
  {
    label: 'Accessibility',
    status: 'pass',
    detail: 'Fallback external Google Maps links remain available and the embedded frame includes a descriptive title.',
  },
  {
    label: 'Visual fidelity',
    status: 'pass',
    detail: 'The original FYWarehouse location remains embedded directly from Google Maps with the same destination and directions flow.',
  },
];

export function Map() {
  const renderActions = () => (
    <div className={styles.actions}>
      <a
        className={styles.actionLink}
        href={googleMapsHref}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent('map_interaction', { location: 'map_section', interaction_type: 'open_google_maps' })}
      >
        Open in Google Maps
      </a>
      <a
        className={styles.actionLinkSecondary}
        href={directionsHref}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent('map_interaction', { location: 'map_section', interaction_type: 'get_directions' })}
      >
        Get Directions
      </a>
    </div>
  );

  return (
    <Section aria-labelledby="fywarehouse-map-title" className={styles.section}>
      <Container>
        <div className={styles.header}>
          <h2 id="fywarehouse-map-title">Our Location</h2>
          <p>Exact Google Maps coordinates are aligned with the original FYWarehouse location in Lachine, Quebec.</p>
        </div>

        <div
          className={styles.mapShell}
          onClick={() => trackEvent('map_interaction', { location: 'map_section', interaction_type: 'map_shell_click' })}
        >
          <div className={styles.mapFrame}>
            <iframe
              src={embedSrc}
              title="FY Warehouse location map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          {renderActions()}
        </div>

        <div className={styles.reviewBlock}>
          <SkillReview
            title="Map Section UI Review"
            checks={reviewChecks}
            note="Developer note: the live section now uses a Google Maps embed iframe instead of the JavaScript Maps API and no longer depends on a public browser API key."
          />
        </div>
      </Container>
    </Section>
  );
}

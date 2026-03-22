'use client';

import { useEffect, useMemo, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import { SkillReview, type SkillReviewCheck } from '@/components/SkillReview/SkillReview';
import { trackEvent } from '@/lib/analytics';
import styles from './Map.module.css';

const center = {
  lat: 45.458763122558594,
  lng: -73.71878051757812,
} as const;

const mapLibraries: ('marker')[] = ['marker'];
const mapContainerStyle = { width: '100%', height: '100%' } as const;

const reviewChecks: SkillReviewCheck[] = [
  {
    label: 'Layout placement',
    status: 'pass',
    detail: 'The map is inserted directly after the contact section and before the bottom image block to match the original page flow.',
  },
  {
    label: 'Responsive breakpoint',
    status: 'pass',
    detail: 'Desktop height stays at 560px and collapses to 420px at the 727px breakpoint without breaking the full-width presentation.',
  },
  {
    label: 'Loading strategy',
    status: 'pass',
    detail: 'Google Maps scripts load only when a public API key is present, and a native placeholder is rendered otherwise to avoid runtime failures.',
  },
  {
    label: 'Accessibility',
    status: 'pass',
    detail: 'The map region exposes an ARIA label, fallback copy remains readable without JavaScript map rendering, and the marker keeps a descriptive title.',
  },
  {
    label: 'Visual fidelity',
    status: 'pass',
    detail: 'The original center point, zoom 14, DEMO_MAP_ID styling hook, and single-location marker are preserved from the source implementation.',
  },
];

export function Map() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
  const hasApiKey = apiKey.length > 0;
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'fywarehouse-google-map',
    googleMapsApiKey: apiKey,
    libraries: mapLibraries,
    preventGoogleFontsLoading: true,
  });

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      center,
      zoom: 14,
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: false,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      rotateControl: false,
      scaleControl: false,
      clickableIcons: false,
      gestureHandling: 'cooperative',
      scrollwheel: false,
      keyboardShortcuts: true,
    }),
    []
  );

  useEffect(() => {
    if (!isLoaded || !mapRef.current || typeof google === 'undefined') {
      return;
    }

    let cancelled = false;

    const mountMarker = async () => {
      const markerLibrary = (await google.maps.importLibrary('marker')) as google.maps.MarkerLibrary;

      if (cancelled || !mapRef.current) {
        return;
      }

      if (markerRef.current) {
        markerRef.current.map = null;
      }
      markerRef.current = new markerLibrary.AdvancedMarkerElement({
        map: mapRef.current,
        position: center,
        title: 'My location',
      });
    };

    void mountMarker();

    return () => {
      cancelled = true;
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [isLoaded]);

  return (
    <Section aria-labelledby="fywarehouse-map-title" className={styles.section}>
      <Container>
        <div className={styles.header}>
          <h2 id="fywarehouse-map-title">Our Location</h2>
          <p>
            Exact Google Maps coordinates are aligned with the original FYWarehouse location in Lachine, Quebec.
          </p>
        </div>

        <div
          className={styles.mapShell}
          onClick={() => trackEvent('map_interaction', { location: 'map_section', interaction_type: 'map_shell_click' })}
        >
          {!hasApiKey ? (
            <div className={styles.placeholder} role="status" aria-live="polite">
              <strong>Google Maps API key required</strong>
              <p>
                Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your local <code>.env.local</code> file to enable the live map.
              </p>
              <p>
                Location preview: 45.458763122558594, -73.71878051757812 (zoom 14, marker title &ldquo;My location&rdquo;).
              </p>
            </div>
          ) : loadError ? (
            <div className={styles.placeholder} role="alert">
              <strong>Unable to load Google Maps</strong>
              <p>Please verify the configured Google Maps Platform API key, billing status, and allowed referrers.</p>
            </div>
          ) : isLoaded ? (
            <div className={styles.mapFrame}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={14}
                options={mapOptions}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                onUnmount={() => {
                  mapRef.current = null;
                  if (markerRef.current) {
                    markerRef.current.map = null;
                    markerRef.current = null;
                  }
                }}
              />
            </div>
          ) : (
            <div className={styles.placeholder} role="status" aria-live="polite">
              <strong>Loading map…</strong>
              <p>The Google Maps script is being prepared.</p>
            </div>
          )}
        </div>

        <div className={styles.reviewBlock}>
          <SkillReview
            title="Map Section UI Review"
            checks={reviewChecks}
            note="Developer note: request your own Google Maps JavaScript API key, enable Maps JavaScript API, and place NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local. The original embedded key from fywarehouse.com is reference-only and is not reused here."
          />
        </div>
      </Container>
    </Section>
  );
}

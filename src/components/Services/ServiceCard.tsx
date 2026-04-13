'use client';

import Link from 'next/link';
import { ImageWithFallback } from '@/components/ImageWithFallback/ImageWithFallback';
import { trackEvent } from '@/lib/analytics';
import styles from './ServiceCard.module.css';

export type ServiceCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageFallbackSrc?: string;
  imageAlt: string;
  reverse?: boolean;
  copySource?: 'live-site' | 'temporary';
  index?: number;
  slug?: string;
};

export function ServiceCard({
  title,
  description,
  imageSrc,
  imageFallbackSrc,
  imageAlt,
  reverse = false,
  copySource = 'live-site',
  index = 0,
  slug,
}: ServiceCardProps) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`${styles.card} ${reverse ? styles.reverse : ''}`.trim()}
      onClick={() => trackEvent('service_click', { service_name: title, interaction_type: 'card_click' })}
    >
      <div className={styles.media}>
        <ImageWithFallback
          src={imageSrc}
          fallbackSrc={imageFallbackSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 727px) calc(100vw - 32px), (max-width: 1200px) 60vw, 620px"
          className={styles.image}
          wrapperClassName={styles.mediaInner}
        />
      </div>
      <div className={styles.content}>
        <span className={styles.number}>{number}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        {copySource === 'temporary' ? (
          <span className={styles.meta}>Temporary copy pending exact source verification.</span>
        ) : null}
        {slug && (
          <Link href={`/services/${slug}`} className={styles.learnMore}>
            Learn More →
          </Link>
        )}
      </div>
    </article>
  );
}

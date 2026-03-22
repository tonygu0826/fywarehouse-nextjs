import { ImageWithFallback } from '@/components/ImageWithFallback/ImageWithFallback';
import styles from './ServiceCard.module.css';

export type ServiceCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageFallbackSrc?: string;
  imageAlt: string;
  reverse?: boolean;
  copySource?: 'live-site' | 'temporary';
};

export function ServiceCard({
  title,
  description,
  imageSrc,
  imageFallbackSrc,
  imageAlt,
  reverse = false,
  copySource = 'live-site',
}: ServiceCardProps) {
  return (
    <article className={`${styles.card} ${reverse ? styles.reverse : ''}`.trim()}>
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
        {/* ui-ux-design review: 28px heading tier, CSS variable colors only, 727px stack order maintained */}
        <h3>{title}</h3>
        <p>{description}</p>
        {copySource === 'temporary' ? (
          <span className={styles.meta}>Temporary copy pending exact source verification.</span>
        ) : null}
      </div>
    </article>
  );
}

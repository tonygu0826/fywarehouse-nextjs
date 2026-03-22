import Image from 'next/image';
import styles from './ServiceCard.module.css';

export type ServiceCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
};

export function ServiceCard({ title, description, imageSrc, imageAlt, reverse = false }: ServiceCardProps) {
  return (
    <article className={`${styles.card} ${reverse ? styles.reverse : ''}`.trim()}>
      <div className={styles.media}>
        <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 727px) 100vw, 62vw" className={styles.image} />
      </div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

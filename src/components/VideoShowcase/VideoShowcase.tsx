import { Section } from '@/components/Section/Section';
import styles from './VideoShowcase.module.css';

export function VideoShowcase() {
  return (
    <Section>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>See Our Facilities</h2>
        <div className={styles.videoContainer}>
          <iframe
            src="https://www.youtube.com/embed/t6yedZodi18"
            title="See Our Facilities"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </Section>
  );
}

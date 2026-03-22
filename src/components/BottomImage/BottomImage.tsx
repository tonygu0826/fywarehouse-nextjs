import Image from 'next/image';
import { Container } from '@/components/Container/Container';
import styles from './BottomImage.module.css';

export function BottomImage() {
  return (
    <section className={styles.section} aria-label="Warehouse photo section">
      <Container size="narrow">
        <div className={styles.imageWrap}>
          {/* ui-ux-design review: preserve the original narrow content width, keep full-bleed image behavior inside the container, and maintain the 727px breakpoint spacing system (40px desktop / 27px mobile). */}
          <Image
            className={styles.image}
            src="/assets/bottom-image-original.jpg"
            alt="Fengye Logistics warehouse exterior"
            width={1200}
            height={425}
            sizes="(max-width: 727px) calc(100vw - 32px), 800px"
            loading="lazy"
            priority={false}
          />
        </div>
      </Container>
    </section>
  );
}

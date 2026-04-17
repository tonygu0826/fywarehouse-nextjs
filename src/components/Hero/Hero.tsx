'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container/Container';
import { Section } from '@/components/Section/Section';
import styles from './Hero.module.css';

const VIDEOS = ['/hero/hero-1.mp4', '/hero/hero-2.mp4', '/hero/hero-3.mp4'];

export function Hero() {
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
  ];
  const [active, setActive] = useState(0);

  // When active changes: play the active one, pause + rewind the others so
  // the next cycle starts from frame 0. Non-active videos stay in DOM with
  // preload="auto" so their first frame is already decoded — crossfade is
  // seamless (no black flash).
  useEffect(() => {
    videoRefs.forEach((ref, i) => {
      const v = ref.current;
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {
          /* autoplay may be blocked before user interaction; browser will
             resume once hero scrolls into view. Silent. */
        });
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [active]);

  const handleEnded = () => {
    setActive((i) => (i + 1) % VIDEOS.length);
  };

  return (
    <Section className={styles.hero}>
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={videoRefs[i]}
          src={src}
          muted
          playsInline
          preload="auto"
          autoPlay={i === 0}
          onEnded={handleEnded}
          className={styles.background}
          style={{ opacity: i === active ? 1 : 0 }}
          aria-hidden="true"
        />
      ))}
      <div className={styles.overlay} />
      <Container size="wide" className={styles.container}>
        <div className={styles.content}>
          <h1>Montreal&apos;s Trusted Warehouse &amp; Logistics Partner</h1>
          <p className={styles.subcopy}>
            CBSA-authorized sufferance warehouse offering cross-dock handling,
            bonded cargo support, and distribution services.
          </p>
          <div className={styles.buttons}>
            <Link href="/contact" className={styles.btnPrimary}>
              Get a Quote
            </Link>
            <Link href="/services" className={styles.btnSecondary}>
              Our Services
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

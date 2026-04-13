'use client';
import { useRef, useEffect, useState, ReactNode } from 'react';
import styles from './AnimateOnScroll.module.css';

type Props = {
  children: ReactNode;
  delay?: number;
};

export function AnimateOnScroll({ children, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`${styles.wrapper} ${visible ? styles.visible : ''}`}>
      {children}
    </div>
  );
}

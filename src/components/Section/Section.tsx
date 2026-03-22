import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Section.module.css';

type SectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Section({ children, className = '', ...props }: SectionProps) {
  return (
    <section className={`${styles.section} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Container.module.css';

type ContainerSize = 'normal' | 'wide' | 'narrow';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
  children: ReactNode;
};

export function Container({ size = 'normal', children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`${styles.container} ${styles[size]} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

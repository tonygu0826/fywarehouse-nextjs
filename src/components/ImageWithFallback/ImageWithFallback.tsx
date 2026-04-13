'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import styles from './ImageWithFallback.module.css';

type ImageWithFallbackProps = Omit<ImageProps, 'src'> & {
  src: string;
  fallbackSrc?: string;
  wrapperClassName?: string;
  showSkeleton?: boolean;
};

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  wrapperClassName = '',
  showSkeleton = true,
  onLoad,
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
  }, [src]);

  const wrapperClasses = useMemo(
    () => `${styles.wrapper} ${showSkeleton && !isLoaded ? styles.loading : ''} ${wrapperClassName}`.trim(),
    [isLoaded, showSkeleton, wrapperClassName],
  );

  return (
    <div className={wrapperClasses}>
      <Image
        {...props}
        src={currentSrc}
        alt={alt}
        className={`${styles.image} ${className ?? ''}`.trim()}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setIsLoaded(false);
            return;
          }

          setIsLoaded(true);
        }}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
      />
    </div>
  );
}

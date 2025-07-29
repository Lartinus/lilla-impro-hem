// src/components/OptimizedImage.tsx
import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
  preferredSize?: 'small' | 'medium' | 'large';
  onLoad?: (src: string) => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackText = 'Ingen bild',
  preferredSize = 'small',
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { imageUrl, originalSrc } = useCallback(() => {
    if (!src) return { imageUrl: null, originalSrc: null };
    if (typeof src === 'string') return { imageUrl: src, originalSrc: src };
    const url = (src as any)?.data?.attributes?.url || (src as any)?.url;
    return { imageUrl: url, originalSrc: url };
  }, [src])();

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    if (onLoad && originalSrc) onLoad(originalSrc);
  }, [onLoad, originalSrc]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    if (onLoad && originalSrc) onLoad(originalSrc);
  }, [onLoad, originalSrc]);

  if (!imageUrl || hasError) {
    return (
      <div className={`${className} bg-gray-300 flex items-center justify-center`}>
        <span className="text-gray-600 text-sm">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && <Skeleton className={`absolute inset-0 ${className}`} />}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

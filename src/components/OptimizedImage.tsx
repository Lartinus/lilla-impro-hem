import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
  preferredSize?: 'small' | 'medium' | 'large';
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackText = "Ingen bild",
  preferredSize = 'small'
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Memoize the image URL calculation
  const optimizedSrc = useCallback(() => {
    if (!src) return null;

    // Om det redan är en full URL eller lokal sökväg
    if (src.startsWith('http') || src.startsWith('/')) {
      return src;
    }

    // Anropa nya signaturen: ett options‐objekt istället för 3 argument
    return getStrapiImageUrl(src, { size: preferredSize });
  }, [src, preferredSize]);

  const imageUrl = optimizedSrc();

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  if (!imageUrl || hasError) {
    return (
      <div className={`bg-gray-300 rounded-none flex items-center justify-center ${className}`}>
        <span className="text-gray-600 text-sm">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
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
};

export default OptimizedImage;

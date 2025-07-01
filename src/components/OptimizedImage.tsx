
import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
  preferredSize?: 'small' | 'medium' | 'large';
  onLoad?: (src: string) => void;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackText = "Ingen bild",
  preferredSize = 'small',
  onLoad
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Memoize the image URL calculation and use original src for onLoad callback
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
    console.log('OptimizedImage: Image loaded successfully, calling onLoad with original src:', src);
    setIsLoading(false);
    // Always call onLoad with the original src to match imageUrls array
    if (onLoad && src) {
      onLoad(src);
    }
  }, [onLoad, src]);

  const handleError = useCallback(() => {
    console.log('OptimizedImage: Image failed to load, calling onLoad with original src:', src);
    setHasError(true);
    setIsLoading(false);
    // Still call onLoad with original src even on error to not block the loading indicator
    if (onLoad && src) {
      onLoad(src);
    }
  }, [onLoad, src]);

  // If no valid image URL, call onLoad immediately with original src to not block loading
  if (!imageUrl && onLoad && src) {
    console.log('OptimizedImage: No valid image URL, calling onLoad immediately for original src:', src);
    onLoad(src);
  }

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

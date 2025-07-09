import { useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string | any | null; // Support both string URLs and Strapi objects
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

  // Simplified image URL handling - just use src as-is since we removed Strapi
  const { imageUrl, originalSrc } = useCallback(() => {
    if (!src) return { imageUrl: null, originalSrc: null };

    // If src is a string URL, use as-is
    if (typeof src === 'string') {
      return { imageUrl: src, originalSrc: src };
    }

    // Handle object format (for backward compatibility)
    const url = src?.data?.attributes?.url || src?.url;
    return { 
      imageUrl: url, 
      originalSrc: url 
    };
  }, [src])();

  const handleLoad = useCallback(() => {
    console.log('OptimizedImage: Image loaded successfully, calling onLoad with:', originalSrc);
    setIsLoading(false);
    // Call onLoad with the original/constructed src for tracking consistency
    if (onLoad && originalSrc) {
      onLoad(originalSrc);
    }
  }, [onLoad, originalSrc]);

  const handleError = useCallback(() => {
    console.log('OptimizedImage: Image failed to load, calling onLoad with:', originalSrc);
    setHasError(true);
    setIsLoading(false);
    // Still call onLoad even on error to not block the loading indicator
    if (onLoad && originalSrc) {
      onLoad(originalSrc);
    }
  }, [onLoad, originalSrc]);

  // If no valid image URL, call onLoad immediately to not block loading
  if (!imageUrl && onLoad && originalSrc) {
    console.log('OptimizedImage: No valid image URL, calling onLoad immediately for:', originalSrc);
    onLoad(originalSrc);
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

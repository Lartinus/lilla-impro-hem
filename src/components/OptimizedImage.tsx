import { useState } from 'react';
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

  // Get optimized image URL - handle both processed URLs and raw Strapi data
  const getImageUrl = () => {
    if (!src) return null;
    
    // If it's already a full URL, use it directly
    if (src.startsWith('http')) {
      return src;
    }
    
    // Otherwise, treat it as Strapi data and process it
    return getStrapiImageUrl(src, undefined, preferredSize);
  };

  const optimizedSrc = getImageUrl();

  if (!optimizedSrc || hasError) {
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
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default OptimizedImage;

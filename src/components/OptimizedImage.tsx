
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Get optimized image URL based on preferred size
  const getOptimizedImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    
    // If it's already a Strapi URL, try to get the optimized version
    if (imageUrl.includes('reliable-chicken-da8c8aa37e.media.strapiapp.com')) {
      // Extract the hash from the URL
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const baseUrl = parts.slice(0, -1).join('/');
      
      // Return the preferred size version
      return `${baseUrl}/${preferredSize}_${filename}`;
    }
    
    return imageUrl;
  };

  const optimizedSrc = getOptimizedImageUrl(src);

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

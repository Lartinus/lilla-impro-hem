import { useState, useCallback, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { imageCache } from '@/services/imageCache'
import { 
  generateResponsiveImageSources, 
  getOptimizedImageUrl,
  generateSizesAttribute,
  generateBlurPlaceholder,
  preloadCriticalImage
} from '@/utils/imageOptimization'

interface OptimizedImageProps {
  src: string | null
  alt: string
  className?: string
  fallbackText?: string
  preferredSize?: 'small' | 'medium' | 'large'
  onLoad?: (src: string) => void
  priority?: boolean
  responsive?: boolean
  sizes?: string
  layout?: 'hero' | 'card' | 'thumbnail' | 'full-width' | 'custom'
  width?: number
  height?: number
  blurPlaceholder?: boolean
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackText = 'Ingen bild',
  preferredSize = 'small',
  onLoad,
  priority = false,
  responsive = true,
  sizes,
  layout = 'card',
  width,
  height,
  blurPlaceholder = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showImage, setShowImage] = useState(false)

  const { imageUrl, originalSrc, avifSrcSet, webpSrcSet, fallbackSrcSet, sizesAttr, blurDataUrl } = useCallback(() => {
    if (!src) return { 
      imageUrl: null, 
      originalSrc: null, 
      avifSrcSet: '', 
      webpSrcSet: '', 
      fallbackSrcSet: '',
      sizesAttr: '',
      blurDataUrl: ''
    };
    
    let baseSrc: string;
    if (typeof src === 'string') {
      baseSrc = src;
    } else {
      baseSrc = (src as any)?.data?.attributes?.url || (src as any)?.url;
    }
    
    if (!baseSrc) return { 
      imageUrl: null, 
      originalSrc: null, 
      avifSrcSet: '', 
      webpSrcSet: '', 
      fallbackSrcSet: '',
      sizesAttr: '',
      blurDataUrl: ''
    };

    // Use original src for now until optimized images exist
    const responsiveSources = null;
    const optimizedUrl = baseSrc; // Use original URL
    const sizesAttribute = '';
    const placeholder = blurPlaceholder ? generateBlurPlaceholder(width, height) : '';

    return {
      imageUrl: optimizedUrl,
      originalSrc: baseSrc,
      avifSrcSet: responsiveSources?.avif || '',
      webpSrcSet: responsiveSources?.webp || '',
      fallbackSrcSet: responsiveSources?.fallback || '',
      sizesAttr: sizesAttribute,
      blurDataUrl: placeholder
    };
  }, [src, responsive, sizes, layout, width, height, blurPlaceholder])()

  // Check cache and preload if needed
  useEffect(() => {
    if (!originalSrc) return
    
    // Always start with loading state for consistent animation
    setIsLoading(true)
    setShowImage(false)
    
    // Preload critical images immediately
    if (priority) {
      preloadCriticalImage(originalSrc, 'webp');
    }
    
    // If image is already cached, add minimal delay for smooth animation
    if (imageCache.isImageLoaded(originalSrc)) {
      setTimeout(() => {
        setIsLoading(false)
        setTimeout(() => setShowImage(true), 50) // Smooth fade-in
        if (onLoad) {
          onLoad(originalSrc)
        }
      }, 100)
      return
    }

    // Preload image if it's priority or in viewport soon
    if (priority) {
      imageCache.preloadImage(imageUrl || originalSrc).then(success => {
        if (!success) {
          setHasError(true)
        }
        setIsLoading(false)
        setTimeout(() => setShowImage(true), 50) // Smooth fade-in
        if (onLoad) {
          onLoad(originalSrc)
        }
      })
    }
  }, [originalSrc, imageUrl, priority, onLoad])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setTimeout(() => setShowImage(true), 50) // Smooth fade-in
    if (onLoad && originalSrc) {
      onLoad(originalSrc)
    }
  }, [onLoad, originalSrc])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (onLoad && originalSrc) {
      onLoad(originalSrc)
    }
  }, [onLoad, originalSrc])

  if (!imageUrl || hasError) {
    return (
      <div className={`${className} bg-gray-300 flex items-center justify-center`}>
        <span className="text-gray-600 text-sm">{fallbackText}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className} overflow-hidden`} style={{ contentVisibility: 'auto' }}>
      {isLoading && (
        <Skeleton className={`absolute inset-0 w-full h-full ${className.includes('aspect-') ? '' : 'aspect-[4/3]'}`} />
      )}
      {blurPlaceholder && blurDataUrl && isLoading && (
        <img
          src={blurDataUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          style={{ filter: 'blur(10px)' }}
        />
      )}
      <img
        src={imageUrl || originalSrc}
        alt={alt}
        className={`${className} ${showImage ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 will-change-[opacity]`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority && { fetchPriority: "high" })}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        style={{ 
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

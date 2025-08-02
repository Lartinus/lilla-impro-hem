import { useState, useCallback, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { imageCache } from '@/services/imageCache'

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
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackText = 'Ingen bild',
  preferredSize = 'small',
  onLoad,
  priority = false,
  responsive = false,
  sizes,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const { imageUrl, originalSrc, srcSet } = useCallback(() => {
    if (!src) return { imageUrl: null, originalSrc: null, srcSet: '' }
    if (typeof src === 'string') {
      return { imageUrl: src, originalSrc: src, srcSet: '' }
    }
    const url = (src as any)?.data?.attributes?.url || (src as any)?.url
    return { imageUrl: url, originalSrc: url, srcSet: '' }
  }, [src])()

  // Check cache and preload if needed
  useEffect(() => {
    if (!originalSrc) return
    
    // If image is already cached, set loading to false immediately
    if (imageCache.isImageLoaded(originalSrc)) {
      setIsLoading(false)
      setHasError(false)
      if (onLoad) {
        onLoad(originalSrc)
      }
      return
    }

    // Preload image if it's priority or in viewport soon
    if (priority) {
      imageCache.preloadImage(originalSrc).then(success => {
        if (!success) {
          setHasError(true)
        }
        setIsLoading(false)
        if (onLoad) {
          onLoad(originalSrc)
        }
      })
    }
  }, [originalSrc, priority, onLoad])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setImageLoaded(true)
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
      {isLoading && !imageLoaded && (
        <Skeleton className={`absolute inset-0 w-full h-full ${className.includes('aspect-') ? '' : 'aspect-[4/3]'}`} />
      )}
      <img
        src={imageUrl}
        srcSet={srcSet || undefined}
        sizes={sizes}
        alt={alt}
        className={`${className} ${isLoading && !imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 will-change-[opacity]`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

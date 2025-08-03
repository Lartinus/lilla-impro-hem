
import { useState, useCallback, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { imageCache } from '@/services/imageCache'

interface OptimizedImageV2Props {
  src: string | null
  alt: string
  className?: string
  fallbackText?: string
  priority?: boolean
  sizes?: string
  quality?: number
  loading?: 'lazy' | 'eager'
}

export default function OptimizedImageV2({
  src,
  alt,
  className = '',
  fallbackText = 'Ingen bild',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  loading = 'lazy'
}: OptimizedImageV2Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [imageFormat, setImageFormat] = useState<'webp' | 'avif' | 'jpg'>('jpg')

  // Detect browser support for modern image formats
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    
    // Check AVIF support
    canvas.toBlob((blob) => {
      if (blob) {
        setImageFormat('avif')
        return
      }
      // Check WebP support
      canvas.toBlob((blob) => {
        if (blob) {
          setImageFormat('webp')
        }
      }, 'image/webp')
    }, 'image/avif')
  }, [])

  const generateSrcSet = useCallback((baseSrc: string) => {
    if (!baseSrc) return ''
    
    const extension = imageFormat === 'jpg' ? '' : `.${imageFormat}`
    const baseUrl = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '')
    
    // Generate responsive sizes
    return [
      `${baseUrl}_400w${extension} 400w`,
      `${baseUrl}_800w${extension} 800w`,
      `${baseUrl}_1200w${extension} 1200w`,
      `${baseUrl}_1600w${extension} 1600w`
    ].join(', ')
  }, [imageFormat])

  const imageUrl = src?.includes('http') ? src : src ? `/uploads/images/${src}` : null

  // Preload critical images with consistent animation
  useEffect(() => {
    if (!imageUrl) return
    
    // Always start with loading state for consistent animation
    setIsLoading(true)
    setShowImage(false)
    
    if (imageCache.isImageLoaded(imageUrl)) {
      setTimeout(() => {
        setIsLoading(false)
        setTimeout(() => setShowImage(true), 50) // Smooth fade-in
      }, 100)
      return
    }

    if (priority) {
      imageCache.preloadImage(imageUrl).then(success => {
        if (!success) setHasError(true)
        setIsLoading(false)
        setTimeout(() => setShowImage(true), 50) // Smooth fade-in
      })
    }
  }, [imageUrl, priority])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setTimeout(() => setShowImage(true), 50) // Smooth fade-in
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
  }, [])

  if (!imageUrl || hasError) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground text-sm">{fallbackText}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && <Skeleton className={`absolute inset-0 ${className}`} />}
      <img
        src={imageUrl}
        srcSet={generateSrcSet(imageUrl)}
        sizes={sizes}
        alt={alt}
        className={`${className} ${showImage ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        loading={priority ? "eager" : loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

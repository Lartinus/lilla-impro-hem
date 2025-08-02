
import { useState, useEffect } from 'react'
import { imageCache } from '@/services/imageCache'

interface PreloadConfig {
  priority: boolean
  timeout?: number
}

export const useImagePreloader = (imageUrls: string[], config: PreloadConfig = { priority: false }) => {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    if (!config.priority || imageUrls.length === 0) return

    setLoadingState('loading')
    
    const timeout = config.timeout ? setTimeout(() => {
      setLoadingState('loaded') // Force completion after timeout
    }, config.timeout) : null

    Promise.all(
      imageUrls.map(url => imageCache.preloadImage(url))
    ).then(results => {
      if (timeout) clearTimeout(timeout)
      
      const successCount = results.filter(Boolean).length
      setLoadedCount(successCount)
      setLoadingState(successCount > 0 ? 'loaded' : 'error')
    }).catch(() => {
      if (timeout) clearTimeout(timeout)
      setLoadingState('error')
    })

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [imageUrls, config.priority, config.timeout])

  return {
    isLoading: loadingState === 'loading',
    isLoaded: loadingState === 'loaded',
    hasError: loadingState === 'error',
    loadedCount,
    totalCount: imageUrls.length
  }
}

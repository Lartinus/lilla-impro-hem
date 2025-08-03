import { useEffect, useState } from 'react';
import { preloadCriticalImage } from '@/utils/imageOptimization';
import { imageCache } from '@/services/imageCache';

interface ImageOptimizationConfig {
  preloadCriticalImages: boolean;
  enableLazyLoading: boolean;
  preferModernFormats: boolean;
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  preloadCriticalImages: true,
  enableLazyLoading: true,
  preferModernFormats: true,
};

/**
 * Hook for managing image optimization across the application
 */
export const useImageOptimization = (config: Partial<ImageOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isOptimizationReady, setIsOptimizationReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeOptimization = async () => {
      try {
        // Preload critical hero images for different pages
        if (finalConfig.preloadCriticalImages) {
          const criticalImages = [
            '/uploads/images/Rosenqvist-6301.jpg',
            '/uploads/images/kurser_LIT_2024.jpg',
            '/uploads/images/Improvision2024.jpg',
            '/uploads/images/corporate_LIT_2024.jpg'
          ];

          // Preload in modern formats first, then fallback
          const preloadPromises = criticalImages.map(async (imageSrc) => {
            try {
              if (finalConfig.preferModernFormats) {
                // Try AVIF first, then WebP, then original
                const avifSrc = imageSrc.replace(/\.[^/.]+$/, '.avif');
                const webpSrc = imageSrc.replace(/\.[^/.]+$/, '.webp');
                
                try {
                  await imageCache.preloadImage(avifSrc);
                } catch {
                  try {
                    await imageCache.preloadImage(webpSrc);
                  } catch {
                    await imageCache.preloadImage(imageSrc);
                  }
                }
              } else {
                await imageCache.preloadImage(imageSrc);
              }
            } catch (error) {
              console.warn(`Failed to preload critical image: ${imageSrc}`, error);
            }
          });

          // Don't block initialization on preloading
          Promise.all(preloadPromises).catch(console.warn);
        }

        // Set up intersection observer for lazy loading if enabled
        if (finalConfig.enableLazyLoading && 'IntersectionObserver' in window) {
          const lazyImageObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const img = entry.target as HTMLImageElement;
                  if (img.dataset.src && !img.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    lazyImageObserver.unobserve(img);
                  }
                }
              });
            },
            {
              rootMargin: '50px 0px',
              threshold: 0.01,
            }
          );

          // Store observer for cleanup
          (window as any).__lazyImageObserver = lazyImageObserver;
        }

        if (mounted) {
          setIsOptimizationReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize image optimization:', error);
        if (mounted) {
          setIsOptimizationReady(true); // Still mark as ready to not block app
        }
      }
    };

    initializeOptimization();

    return () => {
      mounted = false;
      // Cleanup intersection observer
      const observer = (window as any).__lazyImageObserver;
      if (observer) {
        observer.disconnect();
        delete (window as any).__lazyImageObserver;
      }
    };
  }, [finalConfig.preloadCriticalImages, finalConfig.enableLazyLoading, finalConfig.preferModernFormats]);

  const preloadRoute = async (routeImages: string[]) => {
    if (!finalConfig.preloadCriticalImages) return;

    const preloadPromises = routeImages.map(async (imageSrc) => {
      try {
        if (finalConfig.preferModernFormats) {
          const webpSrc = imageSrc.replace(/\.[^/.]+$/, '.webp');
          try {
            await imageCache.preloadImage(webpSrc);
          } catch {
            await imageCache.preloadImage(imageSrc);
          }
        } else {
          await imageCache.preloadImage(imageSrc);
        }
      } catch (error) {
        console.warn(`Failed to preload route image: ${imageSrc}`, error);
      }
    });

    return Promise.allSettled(preloadPromises);
  };

  const getCacheStats = () => ({
    loadedCount: imageCache.getCacheSize(),
    failedCount: imageCache.getFailedCount(),
    isOptimizationReady,
  });

  const clearCache = () => {
    imageCache.clearCache();
  };

  return {
    isOptimizationReady,
    preloadRoute,
    getCacheStats,
    clearCache,
  };
};
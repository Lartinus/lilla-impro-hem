
import { useEffect } from 'react';

interface ResourceOptimizationConfig {
  enablePrefetch: boolean;
  enablePreload: boolean;
  enableServiceWorker: boolean;
  aggressiveCaching: boolean;
}

const DEFAULT_CONFIG: ResourceOptimizationConfig = {
  enablePrefetch: true,
  enablePreload: true,
  enableServiceWorker: false, // Disabled by default for safety
  aggressiveCaching: true,
};

export const useResourceOptimization = (config: Partial<ResourceOptimizationConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    if (finalConfig.enablePrefetch) {
      // Prefetch likely next pages based on current route
      const currentPath = window.location.pathname;
      const prefetchMap: Record<string, string[]> = {
        '/': ['/forestallningar', '/kurser'],
        '/forestallningar': ['/kurser', '/om-oss'],
        '/kurser': ['/forestallningar', '/boka-oss'],
        '/om-oss': ['/boka-oss', '/lokal'],
      };

      const pagesToPrefetch = prefetchMap[currentPath] || [];
      
      pagesToPrefetch.forEach(path => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        document.head.appendChild(link);
      });

      console.log('🔗 Prefetching likely next pages:', pagesToPrefetch);
    }

    if (finalConfig.enablePreload) {
      // Preload critical resources based on viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src && !img.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all images with data-src attribute (lazy loading)
      setTimeout(() => {
        document.querySelectorAll('img[data-src]').forEach(img => {
          observer.observe(img);
        });
      }, 1000);
    }

    if (finalConfig.aggressiveCaching) {
      // Implement memory-based resource caching
      const resourceCache = new Map<string, { data: any; timestamp: number }>();
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

      (window as any).__resourceCache = {
        set: (key: string, data: any) => {
          resourceCache.set(key, { data, timestamp: Date.now() });
        },
        get: (key: string) => {
          const cached = resourceCache.get(key);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
          }
          resourceCache.delete(key);
          return null;
        },
        clear: () => resourceCache.clear(),
      };

      console.log('💾 Aggressive resource caching enabled');
    }

    // Cleanup function
    return () => {
      // Remove prefetch links
      document.querySelectorAll('link[rel="prefetch"]').forEach(link => {
        link.remove();
      });
    };
  }, [finalConfig]);

  const preloadRoute = (path: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    document.head.appendChild(link);
    
    setTimeout(() => {
      link.remove();
    }, 10000); // Remove after 10 seconds
  };

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadFont = (fontUrl: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  return {
    preloadRoute,
    preloadImage,
    preloadFont,
  };
};

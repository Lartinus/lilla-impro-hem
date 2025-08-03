import { useEffect, useState } from 'react';
import { loadFontAsync, monitorFontLoading, preloadFont } from '@/utils/fontOptimization';

interface FontConfig {
  family: string;
  url: string;
  weight?: string;
  style?: 'normal' | 'italic';
  critical?: boolean;
}

const OPTIMIZED_FONTS: FontConfig[] = [
  {
    family: 'Tanker',
    url: '/fonts/tanker.woff2',
    weight: '400',
    critical: true, // Used in headers
  },
  {
    family: 'Satoshi',
    url: '/fonts/satoshi.woff2',
    weight: '400',
    critical: true, // Used in body text
  },
  {
    family: 'Rajdhani',
    url: '/fonts/rajdhani.woff2',
    weight: '400',
    critical: false, // Used less frequently
  },
];

/**
 * Hook for managing font optimization and loading
 */
export const useFontOptimization = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fontStats, setFontStats] = useState({
    loadedFonts: [] as string[],
    failedFonts: [] as string[],
    loadTime: 0,
  });

  useEffect(() => {
    let mounted = true;

    const initializeFontOptimization = async () => {
      try {
        // Preload critical fonts first
        const criticalFonts = OPTIMIZED_FONTS.filter(font => font.critical);
        const nonCriticalFonts = OPTIMIZED_FONTS.filter(font => !font.critical);

        // Load critical fonts immediately
        const criticalPromises = criticalFonts.map(async (font, index) => {
          try {
            // Preload the font file
            preloadFont(font.url, 'woff2');
            
            // Load the font asynchronously
            await loadFontAsync(font.family, font.url, {
              weight: font.weight,
              style: font.style,
              timeout: 3000,
            });

            if (mounted) {
              setLoadingProgress(((index + 1) / criticalFonts.length) * 70); // 70% for critical fonts
            }
          } catch (error) {
            console.warn(`Failed to load critical font: ${font.family}`, error);
          }
        });

        await Promise.allSettled(criticalPromises);

        // Load non-critical fonts with lower priority
        const nonCriticalPromises = nonCriticalFonts.map(async (font, index) => {
          try {
            await loadFontAsync(font.family, font.url, {
              weight: font.weight,
              style: font.style,
              timeout: 5000,
            });

            if (mounted) {
              setLoadingProgress(70 + ((index + 1) / nonCriticalFonts.length) * 30); // Remaining 30%
            }
          } catch (error) {
            console.warn(`Failed to load non-critical font: ${font.family}`, error);
          }
        });

        await Promise.allSettled(nonCriticalPromises);

        // Monitor overall font loading performance
        const stats = await monitorFontLoading();
        
        if (mounted) {
          setFontStats(stats);
          setFontsLoaded(true);
          setLoadingProgress(100);
        }

        console.log('🔤 Font optimization complete:', {
          loaded: stats.loadedFonts,
          failed: stats.failedFonts,
          loadTime: `${stats.loadTime.toFixed(2)}ms`,
        });

      } catch (error) {
        console.error('Font optimization failed:', error);
        if (mounted) {
          setFontsLoaded(true); // Don't block the app
          setLoadingProgress(100);
        }
      }
    };

    // Start font loading with a small delay to not block critical rendering
    const timeoutId = setTimeout(initializeFontOptimization, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Preload additional font weights/styles as needed
  const preloadFontVariant = async (family: string, weight: string, style: 'normal' | 'italic' = 'normal') => {
    const fontConfig = OPTIMIZED_FONTS.find(font => font.family === family);
    if (!fontConfig) return false;

    try {
      const variantUrl = fontConfig.url.replace('.woff2', `-${weight}${style !== 'normal' ? `-${style}` : ''}.woff2`);
      await loadFontAsync(family, variantUrl, { weight, style });
      return true;
    } catch (error) {
      console.warn(`Failed to load font variant: ${family} ${weight} ${style}`, error);
      return false;
    }
  };

  // Check if a specific font is loaded
  const isFontLoaded = (fontFamily: string): boolean => {
    return fontStats.loadedFonts.includes(fontFamily);
  };

  // Get font loading statistics
  const getFontStats = () => ({
    ...fontStats,
    fontsLoaded,
    loadingProgress: Math.round(loadingProgress),
    totalFonts: OPTIMIZED_FONTS.length,
  });

  return {
    fontsLoaded,
    loadingProgress: Math.round(loadingProgress),
    fontStats: getFontStats(),
    preloadFontVariant,
    isFontLoaded,
  };
};
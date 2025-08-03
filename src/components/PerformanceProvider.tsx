import { createContext, useContext, ReactNode } from 'react';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useFontOptimization } from '@/hooks/useFontOptimization';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceContextValue {
  imageOptimization: ReturnType<typeof useImageOptimization>;
  fontOptimization: ReturnType<typeof useFontOptimization>;
  performanceMetrics: ReturnType<typeof usePerformanceMonitor>;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider = ({ children }: PerformanceProviderProps) => {
  const imageOptimization = useImageOptimization({
    preloadCriticalImages: true,
    enableLazyLoading: true,
    preferModernFormats: true,
  });

  const fontOptimization = useFontOptimization();
  const performanceMetrics = usePerformanceMonitor();

  // Log performance stats periodically in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const imageStats = imageOptimization.getCacheStats();
      const fontStats = fontOptimization.fontStats;
      
      console.log('📊 Performance Summary:', {
        images: `${imageStats.loadedCount} loaded, ${imageStats.failedCount} failed`,
        fonts: `${fontStats.loadedFonts.length}/${fontStats.totalFonts} loaded (${fontStats.loadingProgress}%)`,
        fontLoadTime: `${fontStats.loadTime.toFixed(2)}ms`,
        optimizationReady: imageStats.isOptimizationReady && fontStats.fontsLoaded,
      });
    }, 3000);
  }

  const value: PerformanceContextValue = {
    imageOptimization,
    fontOptimization,
    performanceMetrics,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};
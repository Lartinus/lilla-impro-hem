
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceBudget {
  maxBundleSize: number; // in KB
  maxLoadTime: number; // in ms
  maxLCP: number; // in ms
  maxCLS: number; // score
  maxFID: number; // in ms
}

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  score: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 400, // 400KB
  maxLoadTime: 2000, // 2 seconds
  maxLCP: 2500, // 2.5 seconds
  maxCLS: 0.1, // 0.1 score
  maxFID: 100, // 100ms
};

export const useAdvancedPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [budgetViolations, setBudgetViolations] = useState<string[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const measureAdvancedMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      // Estimate bundle size (simplified)
      const bundleSize = Math.round(performance.memory?.usedJSHeapSize / 1024 || 300);
      
      let currentMetrics: PerformanceMetrics = {
        bundleSize,
        loadTime,
        score: 'good',
      };

      // Measure LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          currentMetrics.lcp = lastEntry.startTime;
        }
      });

      // Measure CLS
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        currentMetrics.cls = clsScore;
      });

      // Measure FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          currentMetrics.fid = entry.processingStart - entry.startTime;
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Observers not supported
      }

      // Calculate performance score and violations
      setTimeout(() => {
        const violations: string[] = [];
        
        if (currentMetrics.bundleSize > PERFORMANCE_BUDGET.maxBundleSize) {
          violations.push(`Bundle size exceeds budget: ${currentMetrics.bundleSize}KB > ${PERFORMANCE_BUDGET.maxBundleSize}KB`);
        }
        
        if (currentMetrics.loadTime > PERFORMANCE_BUDGET.maxLoadTime) {
          violations.push(`Load time exceeds budget: ${currentMetrics.loadTime}ms > ${PERFORMANCE_BUDGET.maxLoadTime}ms`);
        }
        
        if (currentMetrics.lcp && currentMetrics.lcp > PERFORMANCE_BUDGET.maxLCP) {
          violations.push(`LCP exceeds budget: ${Math.round(currentMetrics.lcp)}ms > ${PERFORMANCE_BUDGET.maxLCP}ms`);
        }
        
        if (currentMetrics.cls && currentMetrics.cls > PERFORMANCE_BUDGET.maxCLS) {
          violations.push(`CLS exceeds budget: ${currentMetrics.cls.toFixed(3)} > ${PERFORMANCE_BUDGET.maxCLS}`);
        }

        // Calculate overall score
        const violationCount = violations.length;
        if (violationCount === 0) {
          currentMetrics.score = 'excellent';
        } else if (violationCount <= 1) {
          currentMetrics.score = 'good';
        } else if (violationCount <= 2) {
          currentMetrics.score = 'needs-improvement';
        } else {
          currentMetrics.score = 'poor';
        }

        setMetrics(currentMetrics);
        setBudgetViolations(violations);
        
        console.log('🎯 Performance Analysis:', {
          metrics: currentMetrics,
          budget: PERFORMANCE_BUDGET,
          violations,
          recommendations: getPerformanceRecommendations(currentMetrics, violations)
        });

        // Cleanup observers
        try {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fidObserver.disconnect();
        } catch (e) {
          // Observers might not be supported
        }
      }, 5000);
    };

    if (document.readyState === 'complete') {
      measureAdvancedMetrics();
    } else {
      window.addEventListener('load', measureAdvancedMetrics, { once: true });
    }
  }, []);

  const optimizeQueryCache = () => {
    // Implement aggressive cache pruning for better memory management
    const cacheKeys = queryClient.getQueryCache().getAll().map(query => query.queryKey);
    
    // Remove stale queries older than 10 minutes
    cacheKeys.forEach(key => {
      const query = queryClient.getQueryData(key);
      if (query) {
        const lastUpdated = queryClient.getQueryState(key)?.dataUpdatedAt;
        if (lastUpdated && Date.now() - lastUpdated > 10 * 60 * 1000) {
          queryClient.removeQueries({ queryKey: key });
        }
      }
    });
    
    console.log('🧹 Cache optimized - removed stale queries');
  };

  return {
    metrics,
    budgetViolations,
    optimizeQueryCache,
  };
};

const getPerformanceRecommendations = (metrics: PerformanceMetrics, violations: string[]): string[] => {
  const recommendations: string[] = [];
  
  if (metrics.bundleSize > 300) {
    recommendations.push('Consider implementing more aggressive code splitting');
    recommendations.push('Remove unused dependencies and tree-shake imports');
  }
  
  if (metrics.loadTime > 1500) {
    recommendations.push('Implement resource preloading for critical assets');
    recommendations.push('Consider using a CDN for static assets');
  }
  
  if (metrics.lcp && metrics.lcp > 2000) {
    recommendations.push('Optimize largest contentful paint - preload hero images');
    recommendations.push('Minimize render-blocking resources');
  }
  
  if (metrics.cls && metrics.cls > 0.1) {
    recommendations.push('Reserve space for dynamic content to prevent layout shifts');
    recommendations.push('Ensure images and ads have defined dimensions');
  }
  
  return recommendations;
};

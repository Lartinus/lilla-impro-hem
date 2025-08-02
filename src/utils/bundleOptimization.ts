
// Bundle optimization utilities
export const analyzeBundleSize = () => {
  const getModuleSize = (moduleName: string) => {
    try {
      // Estimate module sizes based on typical bundle analysis
      const moduleMap: Record<string, number> = {
        'react': 45000,
        'react-dom': 130000,
        '@tanstack/react-query': 85000,
        '@radix-ui': 250000, // Combined size of all Radix components
        'recharts': 180000,
        'embla-carousel-react': 65000,
        '@stripe/stripe-js': 120000,
        'lucide-react': 95000,
        'date-fns': 75000,
        'react-router-dom': 55000,
      };
      
      return moduleMap[moduleName] || 0;
    } catch (e) {
      return 0;
    }
  };

  const totalSize = Object.keys(require.cache || {}).reduce((total, module) => {
    return total + (getModuleSize(module.split('/').pop() || '') || 1000);
  }, 0);

  console.log('📦 Estimated bundle size:', {
    totalKB: Math.round(totalSize / 1024),
    recommendations: [
      'Consider removing unused Radix UI components',
      'Lazy load Recharts for admin charts',
      'Use tree-shaking for Lucide icons',
      'Optimize date-fns imports to specific functions'
    ]
  });

  return totalSize;
};

// Tree-shaking helper for selective imports
export const createSelectiveImporter = <T extends Record<string, any>>(
  moduleLoader: () => Promise<T>,
  usedExports: (keyof T)[]
) => {
  return async (): Promise<Partial<T>> => {
    const module = await moduleLoader();
    const optimized: Partial<T> = {};
    
    usedExports.forEach(exportName => {
      if (module[exportName]) {
        optimized[exportName] = module[exportName];
      }
    });
    
    return optimized;
  };
};

// Critical CSS extraction helper
export const inlineCriticalCSS = () => {
  const criticalStyles = `
    /* Critical above-the-fold styles */
    .hero-skeleton {
      height: 60vh;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  
  return criticalStyles;
};


import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Enhanced prefetch configuration with performance optimization
const PREFETCH_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
};

// Connection quality detection
const getConnectionQuality = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    const downlink = connection?.downlink;
    
    if (effectiveType === '4g' && downlink > 2) return 'good';
    if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 2)) return 'fair';
    return 'poor';
  }
  return 'unknown';
};

export const useOptimizedPrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchData = async () => {
      const connectionQuality = getConnectionQuality();
      console.log(`🚀 Starting enhanced prefetch strategy (connection: ${connectionQuality})...`);
      
      // Skip prefetch on poor connections to save bandwidth
      if (connectionQuality === 'poor') {
        console.log('🐌 Poor connection detected, skipping prefetch to save bandwidth');
        return;
      }
      
      // Check if data is already cached to avoid unnecessary requests
      const cachedCourses = queryClient.getQueryData(['courses-optimized-v2']);
      const cachedShows = queryClient.getQueryData(['shows-optimized-v2']);
      
      const prefetchPromises = [];
      
      // Only prefetch courses if not already cached
      if (!cachedCourses) {
        console.log('📚 Prefetching courses with enhanced strategy...');
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: ['courses-optimized-v2'],
            queryFn: async () => {
              const startTime = performance.now();
              const { data, error } = await supabase.functions.invoke('strapi-courses');
              const duration = performance.now() - startTime;
              
              if (error) {
                console.error('❌ Prefetch courses error:', error);
                throw error;
              }
              
              console.log(`📚 Courses prefetched successfully in ${duration.toFixed(0)}ms`);
              return data;
            },
            ...PREFETCH_CONFIG,
          })
        );
      } else {
        console.log('✅ Courses already cached, skipping prefetch');
      }

      // Only prefetch shows if not already cached
      if (!cachedShows) {
        console.log('🎭 Prefetching shows with enhanced strategy...');
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: ['shows-optimized-v2'],
            queryFn: async () => {
              const startTime = performance.now();
              const { data, error } = await supabase.functions.invoke('strapi-shows');
              const duration = performance.now() - startTime;
              
              if (error) {
                console.error('❌ Prefetch shows error:', error);
                throw error;
              }
              
              console.log(`🎭 Shows prefetched successfully in ${duration.toFixed(0)}ms`);
              return data;
            },
            ...PREFETCH_CONFIG,
          })
        );
      } else {
        console.log('✅ Shows already cached, skipping prefetch');
      }
      
      // Execute prefetches in parallel if needed with timeout protection
      if (prefetchPromises.length > 0) {
        try {
          const prefetchTimeout = connectionQuality === 'good' ? 15000 : 25000;
          await Promise.race([
            Promise.all(prefetchPromises),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Prefetch timeout')), prefetchTimeout)
            )
          ]);
          console.log('✅ Enhanced prefetch completed successfully');
        } catch (error) {
          console.warn('⚠️ Some prefetch operations failed or timed out (non-critical):', error);
        }
      } else {
        console.log('✅ All data already cached, no prefetch needed');
      }
    };

    // Adaptive delay based on connection quality
    const connectionQuality = getConnectionQuality();
    const delay = connectionQuality === 'poor' ? 500 : 
                  connectionQuality === 'fair' ? 100 : 50;
    
    const timer = setTimeout(prefetchData, delay);
    return () => clearTimeout(timer);
  }, [queryClient]);
};

// Cache warming utility for critical pages
export const warmCache = async (queryClient: any) => {
  console.log('🔥 Starting cache warming...');
  
  try {
    // Warm courses cache
    await queryClient.prefetchQuery({
      queryKey: ['courses-optimized-v2'],
      queryFn: async () => {
        const { data } = await supabase.functions.invoke('strapi-courses');
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes for warm data
    });
    
    // Warm shows cache
    await queryClient.prefetchQuery({
      queryKey: ['shows-optimized-v2'],
      queryFn: async () => {
        const { data } = await supabase.functions.invoke('strapi-shows');
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes for warm data
    });
    
    console.log('🔥 Cache warming completed');
  } catch (error) {
    console.warn('⚠️ Cache warming failed:', error);
  }
};


import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Optimized prefetch configuration
const PREFETCH_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
};

export const useOptimizedPrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchData = async () => {
      console.log('🚀 Starting optimized prefetch strategy...');
      
      // Check if data is already cached to avoid unnecessary requests
      const cachedCourses = queryClient.getQueryData(['courses-optimized']);
      const cachedShows = queryClient.getQueryData(['shows-optimized']);
      
      const prefetchPromises = [];
      
      // Only prefetch courses if not already cached
      if (!cachedCourses) {
        console.log('📚 Prefetching courses...');
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: ['courses-optimized'],
            queryFn: async () => {
              const { data, error } = await supabase.functions.invoke('strapi-courses');
              if (error) throw error;
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
        console.log('🎭 Prefetching shows...');
        prefetchPromises.push(
          queryClient.prefetchQuery({
            queryKey: ['shows-optimized'],
            queryFn: async () => {
              const { data, error } = await supabase.functions.invoke('strapi-shows');
              if (error) throw error;
              return data;
            },
            ...PREFETCH_CONFIG,
          })
        );
      } else {
        console.log('✅ Shows already cached, skipping prefetch');
      }
      
      // Execute prefetches in parallel if needed
      if (prefetchPromises.length > 0) {
        try {
          await Promise.all(prefetchPromises);
          console.log('✅ Optimized prefetch completed successfully');
        } catch (error) {
          console.warn('⚠️ Some prefetch operations failed (non-critical):', error);
        }
      } else {
        console.log('✅ All data already cached, no prefetch needed');
      }
    };

    // Small delay to not block initial render, but faster than before
    const timer = setTimeout(prefetchData, 50);
    return () => clearTimeout(timer);
  }, [queryClient]);
};


import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Unified cache config for prefetch
const PREFETCH_CONFIG = {
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 2 * 60 * 60 * 1000, // 2 hours
};

export const useOptimizedPrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only prefetch if not already cached
    const prefetchIfNeeded = async () => {
      // Check if courses are already cached
      const cachedCourses = queryClient.getQueryData(['courses-optimized']);
      if (!cachedCourses) {
        console.log('Prefetching courses...');
        queryClient.prefetchQuery({
          queryKey: ['courses-optimized'],
          queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('strapi-courses');
            if (error) throw error;
            return data;
          },
          ...PREFETCH_CONFIG,
        });
      }

      // Check if shows are already cached
      const cachedShows = queryClient.getQueryData(['shows-optimized']);
      if (!cachedShows) {
        console.log('Prefetching shows...');
        queryClient.prefetchQuery({
          queryKey: ['shows-optimized'],
          queryFn: async () => {
            const { data, error } = await supabase.functions.invoke('strapi-shows');
            if (error) throw error;
            return data;
          },
          ...PREFETCH_CONFIG,
        });
      }
    };

    // Small delay to not block initial render
    const timer = setTimeout(prefetchIfNeeded, 100);
    return () => clearTimeout(timer);
  }, [queryClient]);
};

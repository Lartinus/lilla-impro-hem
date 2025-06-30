
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Phase 2: Ultra-aggressive prefetching with batched requests
    console.log('Phase 2: Prefetching with batched requests and ultra-aggressive caching...');
    
    // Prefetch shows list with ultra-aggressive caching
    queryClient.prefetchQuery({
      queryKey: ['shows'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        if (error) throw error;
        return data;
      },
      staleTime: 45 * 60 * 1000, // 45 minutes - Phase 2 increase
      gcTime: 90 * 60 * 1000, // 1.5 hours - Phase 2 increase
    });

    // Prefetch courses in parallel with ultra-aggressive caching
    queryClient.prefetchQuery({
      queryKey: ['courses-parallel'],
      queryFn: async () => {
        const [coursesResponse, mainInfoResponse] = await Promise.all([
          supabase.functions.invoke('strapi-courses'),
          supabase.functions.invoke('strapi-site-content', {
            body: { type: 'course-main-info' }
          })
        ]);
        if (coursesResponse.error) throw coursesResponse.error;
        if (mainInfoResponse.error) throw mainInfoResponse.error;

        return {
          coursesData: coursesResponse.data,
          mainInfoData: mainInfoResponse.data
        };
      },
      staleTime: 90 * 60 * 1000, // 1.5 hours - Phase 2 increase
      gcTime: 6 * 60 * 60 * 1000, // 6 hours - Phase 2 increase
    });

    // Phase 2: Prefetch critical content types in batches
    const criticalContentTypes = ['about', 'private-party', 'hero-image'];
    
    criticalContentTypes.forEach(contentType => {
      queryClient.prefetchQuery({
        queryKey: ['site-content', contentType],
        queryFn: async () => {
          const { data, error } = await supabase.functions.invoke('strapi-site-content', {
            body: { type: contentType }
          });
          if (error) throw error;
          return data;
        },
        staleTime: 4 * 60 * 60 * 1000, // 4 hours - Phase 2 increase
        gcTime: 8 * 60 * 60 * 1000, // 8 hours - Phase 2 increase
      });
    });

    console.log('Phase 2: Ultra-aggressive prefetching strategy optimized - removed single show details prefetching');
  }, [queryClient]);
};

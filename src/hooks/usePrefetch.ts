
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only prefetch critical data immediately
    console.log('Prefetching only critical data...');
    
    // Prefetch shows list (essential for /shows page)
    queryClient.prefetchQuery({
      queryKey: ['shows'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        if (error) throw error;
        return data;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes - increased
      gcTime: 60 * 60 * 1000, // 1 hour - increased
    });

    // Prefetch courses in parallel (essential for /courses page)
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
      staleTime: 60 * 60 * 1000, // 1 hour - increased
      gcTime: 2 * 60 * 60 * 1000, // 2 hours - increased
    });

    // Remove aggressive prefetching of all show details
    // This was causing massive performance issues
    console.log('Prefetching strategy optimized - removed aggressive show details prefetching');
  }, [queryClient]);
};

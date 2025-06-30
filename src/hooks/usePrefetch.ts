
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch shows (list) - more aggressive
    queryClient.prefetchQuery({
      queryKey: ['shows'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        if (error) throw error;
        return data;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes - increased from 15
      gcTime: 90 * 60 * 1000, // 90 minutes - increased from 45
    });

    // Prefetch courses (parallel) - more aggressive
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
      staleTime: 45 * 60 * 1000, // 45 minutes - increased from 20
      gcTime: 120 * 60 * 1000, // 120 minutes - increased from 60
    });

    // Prefetch individual course data immediately
    queryClient.prefetchQuery({
      queryKey: ['courses'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-courses');
        if (error) throw error;
        return data;
      },
      staleTime: 45 * 60 * 1000, // 45 minutes
      gcTime: 120 * 60 * 1000, // 120 minutes
    });

    // Fetch all shows immediately, then prefetch details for each show (by slug)
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        if (error) return;
        // In Strapi v4, array is at data.data
        const showList = data?.data || [];
        const showSlugs = showList.map((show: any) => show.attributes?.slug).filter(Boolean);

        // Limit to first 5 shows to avoid too many requests
        const limitedSlugs = showSlugs.slice(0, 5);

        await Promise.all(
          limitedSlugs.map((slug: string) =>
            queryClient.prefetchQuery({
              queryKey: ['show', slug],
              queryFn: async () => {
                const { data, error } = await supabase.functions.invoke('strapi-shows', {
                  body: { slug },
                });
                if (error) throw error;
                return data;
              },
              staleTime: 60 * 60 * 1000, // 60 minutes - increased from 30
              gcTime: 180 * 60 * 1000, // 180 minutes - increased from 90
            })
          )
        );
      } catch (err) {
        // Safe to ignore errors in background prefetch
      }
    })();

    console.log('Prefetching critical data with hyper-aggressive caching...');
  }, [queryClient]);
};

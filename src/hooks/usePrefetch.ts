
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch shows data
    queryClient.prefetchQuery({
      queryKey: ['shows'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        if (error) throw error;
        return data;
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 45 * 60 * 1000, // 45 minutes
    })
    .then(async (showsData) => {
      // Prefetch details for each show (by slug), if we got any
      const showSlugs =
        showsData?.data?.data?.map((show: any) => show.attributes?.slug).filter(Boolean) || [];
      await Promise.all(
        showSlugs.map((slug: string) =>
          queryClient.prefetchQuery({
            queryKey: ['show', slug],
            // Fetch details for each show
            queryFn: async () => {
              const { data, error } = await supabase.functions.invoke('strapi-shows', {
                body: { slug },
              });
              if (error) throw error;
              return data;
            },
            staleTime: 30 * 60 * 1000, // 30 minutes
            gcTime: 90 * 60 * 1000, // 90 minutes
          })
        )
      );
    })
    .catch(() => { /* Safe to ignore for background prefetch */ });

    // Prefetch courses data (parallel)
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
      staleTime: 20 * 60 * 1000, // 20 minutes
      gcTime: 60 * 60 * 1000, // 60 minutes
    });

    console.log('Prefetching critical data (shows/courses and single show details) in background...');
  }, [queryClient]);
};

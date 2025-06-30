
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Phase 3A: Implementing batch-optimized prefetching...');
    
    // Prefetch batched homepage data - denna kombinerar flera anrop
    queryClient.prefetchQuery({
      queryKey: ['batched-homepage-data'],
      queryFn: async () => {
        console.log('Prefetching batched homepage data...');
        const startTime = performance.now();
        
        const [showsResponse, heroImageResponse, siteSettingsResponse] = await Promise.all([
          supabase.functions.invoke('strapi-shows'),
          supabase.functions.invoke('strapi-site-content', {
            body: { type: 'hero-image' }
          }),
          supabase.functions.invoke('strapi-site-content', {
            body: { type: 'site-settings' }
          })
        ]);

        const endTime = performance.now();
        console.log(`Batched homepage prefetch took ${endTime - startTime} milliseconds`);

        if (showsResponse.error) throw showsResponse.error;
        if (heroImageResponse.error) throw heroImageResponse.error;
        if (siteSettingsResponse.error) throw siteSettingsResponse.error;

        return {
          showsData: showsResponse.data,
          heroImageData: heroImageResponse.data,
          siteSettingsData: siteSettingsResponse.data
        };
      },
      staleTime: 20 * 60 * 1000, // 20 minutes
      gcTime: 40 * 60 * 1000, // 40 minutes
      retry: 2,
    });

    // Prefetch courses med den redan optimerade parallel-strategin
    queryClient.prefetchQuery({
      queryKey: ['courses-parallel'],
      queryFn: async () => {
        console.log('Prefetching parallel courses data...');
        const startTime = performance.now();
        
        const [coursesResponse, mainInfoResponse] = await Promise.all([
          supabase.functions.invoke('strapi-courses'),
          supabase.functions.invoke('strapi-site-content', {
            body: { type: 'course-main-info' }
          })
        ]);

        const endTime = performance.now();
        console.log(`Parallel courses prefetch took ${endTime - startTime} milliseconds`);

        if (coursesResponse.error) throw coursesResponse.error;
        if (mainInfoResponse.error) throw mainInfoResponse.error;

        return {
          coursesData: coursesResponse.data,
          mainInfoData: mainInfoResponse.data
        };
      },
      staleTime: 90 * 60 * 1000, // 1.5 hours
      gcTime: 6 * 60 * 60 * 1000, // 6 hours
      retry: 2,
    });

    // Prefetch kritiska content-typer med förbättrad felhantering
    const criticalContentTypes = ['about', 'private-party'];
    
    criticalContentTypes.forEach(contentType => {
      queryClient.prefetchQuery({
        queryKey: ['site-content', contentType],
        queryFn: async () => {
          console.log(`Prefetching ${contentType} content...`);
          const startTime = performance.now();
          
          const { data, error } = await supabase.functions.invoke('strapi-site-content', {
            body: { type: contentType }
          });
          
          const endTime = performance.now();
          console.log(`${contentType} prefetch took ${endTime - startTime} milliseconds`);
          
          if (error) {
            console.warn(`Prefetch error for ${contentType}:`, error);
            // Returnera fallback data istället för att throwa
            return { data: null };
          }
          return data;
        },
        staleTime: 4 * 60 * 60 * 1000, // 4 hours
        gcTime: 8 * 60 * 60 * 1000, // 8 hours
        retry: 1, // Minska retry för prefetch
      });
    });

    console.log('Phase 3A: Batch-optimized prefetching strategy implemented');
  }, [queryClient]);
};

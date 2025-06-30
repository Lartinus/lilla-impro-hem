
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Batch multiple API requests into a single optimized call
export const useBatchedHomePageData = () => {
  return useQuery({
    queryKey: ['batched-homepage-data'],
    queryFn: async () => {
      console.log('useBatchedHomePageData: Starting batched fetch...');
      const startTime = performance.now();
      
      // Execute all homepage-critical requests in parallel
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
      console.log(`useBatchedHomePageData: Batched API calls took ${endTime - startTime} milliseconds`);

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
    refetchOnWindowFocus: false,
  });
};

// Batch content requests for pages that need multiple content types
export const useBatchedPageContent = (contentTypes: string[]) => {
  return useQuery({
    queryKey: ['batched-page-content', contentTypes.sort().join(',')],
    queryFn: async () => {
      console.log(`useBatchedPageContent: Fetching ${contentTypes.length} content types in parallel...`);
      const startTime = performance.now();
      
      const requests = contentTypes.map(type => 
        supabase.functions.invoke('strapi-site-content', {
          body: { type }
        })
      );

      const responses = await Promise.all(requests);
      
      const endTime = performance.now();
      console.log(`useBatchedPageContent: Parallel fetch took ${endTime - startTime} milliseconds`);

      // Check for errors
      responses.forEach((response, index) => {
        if (response.error) {
          console.error(`Error fetching ${contentTypes[index]}:`, response.error);
          throw response.error;
        }
      });

      // Create result object with content type as key
      const result: Record<string, any> = {};
      contentTypes.forEach((type, index) => {
        result[type] = responses[index].data;
      });

      return result;
    },
    enabled: contentTypes.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

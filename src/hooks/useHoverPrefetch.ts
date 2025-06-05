
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHoverPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchShows = () => {
    queryClient.prefetchQuery({
      queryKey: ['shows'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-shows');
        if (error) throw error;
        return data;
      },
      staleTime: 15 * 60 * 1000,
    });
  };

  const prefetchCourses = () => {
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
      staleTime: 20 * 60 * 1000,
    });
  };

  const prefetchPrivateParty = () => {
    queryClient.prefetchQuery({
      queryKey: ['private-party'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-site-content', {
          body: { type: 'private-party' }
        });
        if (error) throw error;
        return data;
      },
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  };

  return {
    prefetchShows,
    prefetchCourses,
    prefetchPrivateParty,
  };
};

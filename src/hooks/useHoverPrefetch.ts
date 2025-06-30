
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
      staleTime: 6 * 60 * 60 * 1000, // 6 hours - increased from 4
    });
  };

  const prefetchCourses = () => {
    // Prefetch both individual courses and parallel data
    queryClient.prefetchQuery({
      queryKey: ['courses'],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-courses');
        if (error) throw error;
        return data;
      },
      staleTime: 6 * 60 * 60 * 1000, // 6 hours - increased from 4
    });

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
      staleTime: 6 * 60 * 60 * 1000, // 6 hours - increased from 4
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
      staleTime: 6 * 60 * 60 * 1000, // 6 hours - increased from 4
    });
  };

  return {
    prefetchShows,
    prefetchCourses,
    prefetchPrivateParty,
  };
};

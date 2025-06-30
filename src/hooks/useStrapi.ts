import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShows = () => {
  return useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - drastically increased
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased from 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useShow = (slug: string) => {
  return useQuery({
    queryKey: ['show', slug],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-shows', {
        body: { slug }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours - drastically increased
    gcTime: 12 * 60 * 60 * 1000, // 12 hours - increased from 1.5 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Optimized parallel courses query with better caching
export const useCoursesParallel = () => {
  return useQuery({
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
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - drastically increased
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased from 4 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Keep for backward compatibility
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-courses');
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - drastically increased
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased from 4 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCourseMainInfo = () => {
  return useQuery({
    queryKey: ['course-main-info'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'course-main-info' }
      });
      if (error) throw error;
      return data;
    },
    staleTime: 8 * 60 * 60 * 1000, // 8 hours - drastically increased
    gcTime: 16 * 60 * 60 * 1000, // 16 hours - increased from 8 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePrivateParty = () => {
  return useQuery({
    queryKey: ['private-party'],
    queryFn: async () => {
      console.log('=== STARTING PRIVATE PARTY QUERY ===');
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'private-party' }
      });
      console.log('Private party response:', { data, error });
      if (error) {
        console.error('Private party error:', error);
        throw error;
      }
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - increased from 2 hours
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased from 4 hours
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAboutPageContent = () => {
  return useQuery({
    queryKey: ['about-page-content'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'about' }
      });
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - increased from 2 hours
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased from 4 hours
    refetchOnWindowFocus: false,
  });
};

export const useSiteContent = (contentType: string = 'site-settings') => {
  return useQuery({
    queryKey: ['site-content', contentType],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: contentType }
      });
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - increased from 2 hours
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased from 4 hours
    refetchOnWindowFocus: false,
  });
};

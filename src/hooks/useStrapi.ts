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
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 45 * 60 * 1000, // 45 minutes
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
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
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
    staleTime: 30 * 60 * 1000, // 30 minutes - increased cache time
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
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
    staleTime: 30 * 60 * 1000, // 30 minutes - increased cache
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
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
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - much longer cache for static content
    gcTime: 4 * 60 * 60 * 1000, // 4 hours
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
    staleTime: 60 * 60 * 1000, // 1 hour - increased cache time
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
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
    staleTime: 60 * 60 * 1000, // 1 hour - increased cache time
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
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
    staleTime: 60 * 60 * 1000, // 1 hour - increased cache
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
  });
};

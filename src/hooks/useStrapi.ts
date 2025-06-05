import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShows = () => {
  return useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      console.log('Fetching shows data...');
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      
      if (error) {
        console.error('Shows fetch error:', error);
        throw error;
      }
      
      console.log('Shows data received:', data);
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - longer cache
    gcTime: 45 * 60 * 1000, // 45 minutes
    retry: (failureCount, error) => {
      // Only retry network errors, not API errors
      if (failureCount < 2 && error?.message?.includes('network')) {
        return true;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists
  });
};

export const useShow = (slug: string) => {
  return useQuery({
    queryKey: ['show', slug],
    queryFn: async () => {
      console.log('Fetching individual show:', slug);
      const { data, error } = await supabase.functions.invoke('strapi-shows', {
        body: { slug }
      });
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 20 * 60 * 1000, // 20 minutes for individual shows
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('Fetching courses data...');
      const { data, error } = await supabase.functions.invoke('strapi-courses');
      
      if (error) {
        console.error('Courses fetch error:', error);
        throw error;
      }
      
      console.log('Courses data received:', data);
      return data;
    },
    staleTime: 20 * 60 * 1000, // 20 minutes - courses change less frequently
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: (failureCount, error) => {
      // Only retry network errors, not API errors
      if (failureCount < 2 && error?.message?.includes('network')) {
        return true;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists
  });
};

export const useCourseMainInfo = () => {
  return useQuery({
    queryKey: ['course-main-info'],
    queryFn: async () => {
      console.log('Fetching course main info...');
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'course-main-info' }
      });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000, // 60 minutes - static content changes rarely
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePrivateParty = () => {
  return useQuery({
    queryKey: ['private-party'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'private-party' }
      });
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

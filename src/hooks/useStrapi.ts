
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
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-courses');
      if (error) throw error;
      return data;
    },
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
  });
};

export const useAboutPageContent = () => {
  return useQuery({
    queryKey: ['about-page-content'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'about-page' }
      });
      if (error) throw error;
      return data;
    },
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
  });
};

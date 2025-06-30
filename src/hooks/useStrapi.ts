import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShows = () => {
  return useQuery({
    queryKey: ['shows'],
    queryFn: async () => {
      console.log('useShows: Fetching shows...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-shows');
      const endTime = performance.now();
      console.log(`useShows: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - increased
    gcTime: 60 * 60 * 1000, // 1 hour - increased
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useShow = (slug: string) => {
  return useQuery({
    queryKey: ['show', slug],
    queryFn: async () => {
      console.log(`useShow: Fetching show details for slug: ${slug}`);
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-shows', {
        body: { slug }
      });
      const endTime = performance.now();
      console.log(`useShow: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 60 * 60 * 1000, // 1 hour - increased
    gcTime: 2 * 60 * 60 * 1000, // 2 hours - increased
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Ultra-optimized parallel courses query
export const useCoursesParallel = () => {
  return useQuery({
    queryKey: ['courses-parallel'],
    queryFn: async () => {
      console.log('useCoursesParallel: Starting parallel fetch...');
      const startTime = performance.now();
      
      const [coursesResponse, mainInfoResponse] = await Promise.all([
        supabase.functions.invoke('strapi-courses'),
        supabase.functions.invoke('strapi-site-content', {
          body: { type: 'course-main-info' }
        })
      ]);

      const endTime = performance.now();
      console.log(`useCoursesParallel: Parallel API calls took ${endTime - startTime} milliseconds`);

      if (coursesResponse.error) throw coursesResponse.error;
      if (mainInfoResponse.error) throw mainInfoResponse.error;

      return {
        coursesData: coursesResponse.data,
        mainInfoData: mainInfoResponse.data
      };
    },
    staleTime: 60 * 60 * 1000, // 1 hour - increased
    gcTime: 4 * 60 * 60 * 1000, // 4 hours - increased
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Keep for backward compatibility
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('useCourses: Fetching courses...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-courses');
      const endTime = performance.now();
      console.log(`useCourses: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - increased
    gcTime: 4 * 60 * 60 * 1000, // 4 hours - increased
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCourseMainInfo = () => {
  return useQuery({
    queryKey: ['course-main-info'],
    queryFn: async () => {
      console.log('useCourseMainInfo: Fetching course main info...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'course-main-info' }
      });
      const endTime = performance.now();
      console.log(`useCourseMainInfo: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - increased
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - increased
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePrivateParty = () => {
  return useQuery({
    queryKey: ['private-party'],
    queryFn: async () => {
      console.log('usePrivateParty: Fetching private party content...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'private-party' }
      });
      const endTime = performance.now();
      console.log(`usePrivateParty: API call took ${endTime - startTime} milliseconds`);
      if (error) {
        console.error('Private party error:', error);
        throw error;
      }
      return data;
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - increased
    gcTime: 4 * 60 * 60 * 1000, // 4 hours - increased
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAboutPageContent = () => {
  return useQuery({
    queryKey: ['about-page-content'],
    queryFn: async () => {
      console.log('useAboutPageContent: Fetching about page content...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'about' }
      });
      const endTime = performance.now();
      console.log(`useAboutPageContent: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - increased
    gcTime: 4 * 60 * 60 * 1000, // 4 hours - increased
    refetchOnWindowFocus: false,
  });
};

export const useSiteContent = (contentType: string = 'site-settings') => {
  return useQuery({
    queryKey: ['site-content', contentType],
    queryFn: async () => {
      console.log(`useSiteContent: Fetching ${contentType} content...`);
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: contentType }
      });
      const endTime = performance.now();
      console.log(`useSiteContent: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - increased
    gcTime: 4 * 60 * 60 * 1000, // 4 hours - increased
    refetchOnWindowFocus: false,
  });
};

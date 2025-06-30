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
    staleTime: 45 * 60 * 1000, // 45 minutes - Phase 2 increase
    gcTime: 90 * 60 * 1000, // 1.5 hours - Phase 2 increase
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
    staleTime: 90 * 60 * 1000, // 1.5 hours - Phase 2 increase
    gcTime: 3 * 60 * 60 * 1000, // 3 hours - Phase 2 increase
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Ultra-optimized parallel courses query - Phase 2 enhanced
export const useCoursesParallel = () => {
  return useQuery({
    queryKey: ['courses-parallel'],
    queryFn: async () => {
      console.log('useCoursesParallel: Starting ultra-optimized parallel fetch...');
      const startTime = performance.now();
      
      const [coursesResponse, mainInfoResponse] = await Promise.all([
        supabase.functions.invoke('strapi-courses'),
        supabase.functions.invoke('strapi-site-content', {
          body: { type: 'course-main-info' }
        })
      ]);

      const endTime = performance.now();
      console.log(`useCoursesParallel: Ultra-optimized parallel API calls took ${endTime - startTime} milliseconds`);

      if (coursesResponse.error) throw coursesResponse.error;
      if (mainInfoResponse.error) throw mainInfoResponse.error;

      return {
        coursesData: coursesResponse.data,
        mainInfoData: mainInfoResponse.data
      };
    },
    staleTime: 90 * 60 * 1000, // 1.5 hours - Phase 2 increase
    gcTime: 6 * 60 * 60 * 1000, // 6 hours - Phase 2 increase
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Keep for backward compatibility but with Phase 2 optimizations
export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('useCourses: Fetching courses with Phase 2 optimizations...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-courses');
      const endTime = performance.now();
      console.log(`useCourses: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 90 * 60 * 1000, // 1.5 hours - Phase 2 increase
    gcTime: 6 * 60 * 60 * 1000, // 6 hours - Phase 2 increase
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCourseMainInfo = () => {
  return useQuery({
    queryKey: ['course-main-info'],
    queryFn: async () => {
      console.log('useCourseMainInfo: Fetching course main info with Phase 2 optimizations...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'course-main-info' }
      });
      const endTime = performance.now();
      console.log(`useCourseMainInfo: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours - Phase 2 increase
    gcTime: 12 * 60 * 60 * 1000, // 12 hours - Phase 2 increase
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePrivateParty = () => {
  return useQuery({
    queryKey: ['private-party'],
    queryFn: async () => {
      console.log('usePrivateParty: Fetching private party content with Phase 2 optimizations...');
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
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - Phase 2 increase
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - Phase 2 increase
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useAboutPageContent = () => {
  return useQuery({
    queryKey: ['about-page-content'],
    queryFn: async () => {
      console.log('useAboutPageContent: Fetching about page content with Phase 2 optimizations...');
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'about' }
      });
      const endTime = performance.now();
      console.log(`useAboutPageContent: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - Phase 2 increase
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - Phase 2 increase
    refetchOnWindowFocus: false,
  });
};

export const useSiteContent = (contentType: string = 'site-settings') => {
  return useQuery({
    queryKey: ['site-content', contentType],
    queryFn: async () => {
      console.log(`useSiteContent: Fetching ${contentType} content with Phase 2 optimizations...`);
      const startTime = performance.now();
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: contentType }
      });
      const endTime = performance.now();
      console.log(`useSiteContent: API call took ${endTime - startTime} milliseconds`);
      if (error) throw error;
      return data;
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours - Phase 2 increase
    gcTime: 8 * 60 * 60 * 1000, // 8 hours - Phase 2 increase
    refetchOnWindowFocus: false,
  });
};

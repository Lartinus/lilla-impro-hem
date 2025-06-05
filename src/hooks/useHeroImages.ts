
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHeroImages = () => {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      console.log('=== FETCHING HERO IMAGES ===');
      const { data, error } = await supabase.functions.invoke('strapi-site-content', {
        body: { type: 'hero-image' }
      });
      console.log('Hero images response:', { data, error });
      if (error) {
        console.error('Hero images error:', error);
        throw error;
      }
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

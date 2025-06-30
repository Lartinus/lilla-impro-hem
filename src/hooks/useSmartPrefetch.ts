
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSmartPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchShowOnHover = (slug: string) => {
    // Only prefetch if not already cached
    const existingData = queryClient.getQueryData(['show', slug]);
    if (existingData) return;

    queryClient.prefetchQuery({
      queryKey: ['show', slug],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-shows', {
          body: { slug },
        });
        if (error) throw error;
        return data;
      },
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
    });
  };

  const prefetchPageContent = (contentType: string) => {
    const existingData = queryClient.getQueryData(['site-content', contentType]);
    if (existingData) return;

    queryClient.prefetchQuery({
      queryKey: ['site-content', contentType],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('strapi-site-content', {
          body: { type: contentType }
        });
        if (error) throw error;
        return data;
      },
      staleTime: 2 * 60 * 60 * 1000, // 2 hours
      gcTime: 4 * 60 * 60 * 1000, // 4 hours
    });
  };

  return {
    prefetchShowOnHover,
    prefetchPageContent,
  };
};

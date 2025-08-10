
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Venue, Actor, ShowTemplate, ShowTag } from '@/types/showManagement';

// Separate hooks for different data types to enable selective loading
export const useVenuesOptimized = () => {
  return useQuery({
    queryKey: ['venues-optimized'],
    queryFn: async (): Promise<Venue[]> => {
      console.log('🏢 Fetching optimized venues...');
      
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, address, maps_url, is_active, sort_order')
        .order('sort_order');
      
      if (error) throw error;
      console.log(`🏢 Fetched ${data?.length || 0} venues`);
      return data as Venue[] || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - venues change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useActorsOptimized = () => {
  return useQuery({
    queryKey: ['actors-optimized'],
    queryFn: async (): Promise<Actor[]> => {
      console.log('🎭 Fetching optimized actors...');
      
      const { data, error } = await supabase
        .from('actors')
        .select('id, name, bio, image_url, is_active')
        .order('name');
      
      if (error) throw error;
      console.log(`🎭 Fetched ${data?.length || 0} actors`);
      return data as Actor[] || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useShowTemplatesOptimized = () => {
  return useQuery({
    queryKey: ['show-templates-optimized'],
    queryFn: async (): Promise<ShowTemplate[]> => {
      console.log('📋 Fetching optimized show templates...');
      
      const { data, error } = await supabase
        .from('show_templates')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      console.log(`📋 Fetched ${data?.length || 0} show templates`);
      return data as ShowTemplate[] || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - templates change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useShowTagsOptimized = () => {
  return useQuery({
    queryKey: ['show-tags-optimized'],
    queryFn: async (): Promise<ShowTag[]> => {
      console.log('🏷️ Fetching optimized show tags...');
      
      const { data, error } = await supabase
        .from('show_tags')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      console.log(`🏷️ Fetched ${data?.length || 0} show tags`);
      return data as ShowTag[] || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - tags change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Combined hook that only loads what's needed
export const useShowManagementData = (options?: {
  loadVenues?: boolean;
  loadActors?: boolean;
  loadTemplates?: boolean;
  loadTags?: boolean;
}) => {
  const {
    loadVenues = false,
    loadActors = false,
    loadTemplates = false,
    loadTags = false
  } = options || {};

  const venuesQuery = useVenuesOptimized();
  const actorsQuery = useActorsOptimized();
  const templatesQuery = useShowTemplatesOptimized();
  const tagsQuery = useShowTagsOptimized();

  return {
    venues: loadVenues ? venuesQuery.data : undefined,
    venuesLoading: loadVenues ? venuesQuery.isLoading : false,
    actors: loadActors ? actorsQuery.data : undefined,
    actorsLoading: loadActors ? actorsQuery.isLoading : false,
    showTemplates: loadTemplates ? templatesQuery.data : undefined,
    templatesLoading: loadTemplates ? templatesQuery.isLoading : false,
    showTags: loadTags ? tagsQuery.data : undefined,
    tagsLoading: loadTags ? tagsQuery.isLoading : false,
  };
};

// Main export for backward compatibility
export const useOptimizedShowData = (shouldLoad = false) => {
  const venuesQuery = useVenuesOptimized();
  const actorsQuery = useActorsOptimized();
  const templatesQuery = useShowTemplatesOptimized();
  const tagsQuery = useShowTagsOptimized();

  return {
    venues: shouldLoad ? venuesQuery.data : undefined,
    performers: shouldLoad ? actorsQuery.data : undefined,
    showTemplates: shouldLoad ? templatesQuery.data : undefined,
    showTags: shouldLoad ? tagsQuery.data : undefined,
    isLoading: shouldLoad ? (venuesQuery.isLoading || actorsQuery.isLoading || templatesQuery.isLoading || tagsQuery.isLoading) : false,
  };
};

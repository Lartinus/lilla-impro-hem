import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AdminShowWithPerformers, ShowTemplate, Venue, Actor, ShowTag } from '@/types/showManagement';

export const useShowData = (showCompleted: boolean = false) => {
  const showsQuery = useQuery({
    queryKey: ['admin-shows', showCompleted],
    queryFn: async () => {
      let query = supabase
        .from('admin_shows')
        .select(`
          *,
          show_performers (
            actors (
              id,
              name,
              bio,
              image_url
            )
          ),
          show_tags (
            id,
            name,
            color,
            description,
            is_active,
            sort_order
          )
        `);

      if (showCompleted) {
        // Show past shows, sorted by date DESC (newest first)
        query = query.lt('show_date', new Date().toISOString().split('T')[0])
                    .order('show_date', { ascending: false });
      } else {
        // Show current and future shows, sorted by manual sort order
        query = query.gte('show_date', new Date().toISOString().split('T')[0])
                    .order('sort_order', { ascending: true });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(show => ({
        ...show,
        performers: show.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || [],
        show_tag: show.show_tags || null
      })) as AdminShowWithPerformers[];
    }
  });

  const venuesQuery = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as Venue[] || [];
    }
  });

  const actorsQuery = useQuery({
    queryKey: ['actors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Actor[] || [];
    }
  });

  const showTemplatesQuery = useQuery({
    queryKey: ['show-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('show_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as ShowTemplate[] || [];
    }
  });

  const showTagsQuery = useQuery({
    queryKey: ['show-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('show_tags')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as ShowTag[] || [];
    }
  });

  return {
    shows: showsQuery.data,
    showsLoading: showsQuery.isLoading,
    venues: venuesQuery.data,
    actors: actorsQuery.data,
    showTemplates: showTemplatesQuery.data,
    showTags: showTagsQuery.data
  };
};
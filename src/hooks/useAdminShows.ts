import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AdminShowWithPerformers } from '@/types/showManagement';

export const useAdminShows = () => {
  return useQuery({
    queryKey: ['admin-shows-public'],
    queryFn: async () => {
      console.log('🎭 Fetching admin shows...');
      
      const { data, error } = await supabase
        .from('admin_shows')
        .select(`
          id,
          title,
          slug, 
          image_url,
          show_date,
          show_time,
          venue,
          venue_address,
          venue_maps_url,
          description,
          regular_price,
          discount_price,
          max_tickets,
          is_active,
          sort_order,
          tag_id,
          created_at,
          updated_at,
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
            description,
            color,
            is_active,
            sort_order
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      console.log('🎭 Admin shows query result:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching admin shows:', error);
        throw error;
      }
      
      const formattedData = (data || []).map(show => ({
        ...show,
        performers: show.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || [],
        show_tag: show.show_tags || null
      })) as AdminShowWithPerformers[];
      
      console.log('🎭 Formatted admin shows:', formattedData);
      return formattedData;
    }
  });
};

// Format admin show data for compatibility with existing ShowCardSimple
export const formatAdminShowForCard = (show: AdminShowWithPerformers) => ({
  id: show.id,
  title: show.title,
  date: show.show_date,
  time: show.show_time,
  location: show.venue,
  slug: show.slug,
  image: show.image_url,
  totalTickets: show.max_tickets || 100,
  description: show.description,
  tag: show.show_tag ? {
    name: show.show_tag.name,
    color: show.show_tag.color
  } : null
});
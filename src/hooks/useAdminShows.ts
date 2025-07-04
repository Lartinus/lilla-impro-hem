import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminShow {
  id: string;
  title: string;
  slug: string;
  image_url?: string | null;
  show_date: string;
  show_time: string;
  venue: string;
  venue_address?: string | null;
  venue_maps_url?: string | null;
  description?: string | null;
  regular_price: number;
  discount_price: number;
  max_tickets?: number;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  performers: Array<{
    id: string;
    name: string;
    bio?: string | null;
    image_url?: string | null;
  }>;
}

export const useAdminShows = () => {
  return useQuery({
    queryKey: ['admin-shows-public'],
    queryFn: async () => {
      const { data, error } = await supabase
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
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(show => ({
        ...show,
        performers: show.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || []
      })) as AdminShow[];
    }
  });
};

// Format admin show data for compatibility with existing ShowCardSimple
export const formatAdminShowForCard = (show: AdminShow) => ({
  id: parseInt(show.id.slice(-8), 16), // Convert UUID to number for compatibility
  title: show.title,
  date: show.show_date + 'T' + show.show_time, // Combine date and time
  time: show.show_time,
  location: show.venue,
  slug: show.slug,
  image: show.image_url ? {
    data: {
      attributes: {
        url: show.image_url.startsWith('http') ? show.image_url.replace(/^https?:\/\/[^\/]+/, '') : show.image_url
      }
    }
  } : null,
  totalTickets: show.max_tickets || 100
});
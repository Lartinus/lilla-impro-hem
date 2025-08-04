
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Lightweight interface for show cards - only essential data
interface ShowCardData {
  id: string;
  title: string;
  slug: string;
  show_date: string;
  show_time: string;
  venue: string;
  venue_address?: string | null;
  venue_maps_url?: string | null;
  description?: string | null;
  regular_price: number;
  discount_price: number;
  max_tickets?: number;
  image_url?: string | null;
  is_active: boolean;
  sort_order?: number;
  tag_id?: string | null;
  created_at: string;
  updated_at: string;
  performers: Array<{
    id: string;
    name: string;
    bio: string;
    image_url?: string | null;
  }>;
  show_tag?: {
    name: string;
    color: string;
  } | null;
}

// Full show data for detail views
interface FullShowData extends ShowCardData {
  performers: Array<{
    id: string;
    name: string;
    bio: string;
    image_url?: string | null;
  }>;
}

// Optimized hook for show cards - fetches minimal data
export const useAdminShowCards = (showCompleted: boolean = false) => {
  return useQuery({
    queryKey: ['admin-show-cards', showCompleted],
    queryFn: async (): Promise<ShowCardData[]> => {
      console.log('🎭 Fetching optimized show cards...');
      
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
            name,
            color
          )
        `);
        // Note: For admin view, we don't filter by is_active to allow editing of hidden shows

      if (showCompleted) {
        query = query.lt('show_date', new Date().toISOString().split('T')[0])
                    .order('show_date', { ascending: false });
      } else {
        query = query.gte('show_date', new Date().toISOString().split('T')[0])
                    .order('sort_order', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching show cards:', error);
        throw error;
      }
      
      const formattedData = (data || []).map(show => ({
        ...show,
        performers: show.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || [],
        show_tag: show.show_tags || null
      })) as ShowCardData[];
      
      console.log(`🎭 Fetched ${formattedData.length} optimized show cards`);
      return formattedData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for full show details - only when needed
export const useAdminShowDetails = (showId?: string) => {
  return useQuery({
    queryKey: ['admin-show-details', showId],
    queryFn: async (): Promise<FullShowData> => {
      if (!showId) throw new Error('Show ID required');
      
      console.log(`🎭 Fetching full show details for ${showId}...`);
      
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
          ),
          show_tags (
            id,
            name,
            color,
            description,
            is_active,
            sort_order
          )
        `)
        .eq('id', showId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching show details:', error);
        throw error;
      }
      
      const formattedShow = {
        ...data,
        performers: data.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || [],
        show_tag: data.show_tags || null
      } as FullShowData;
      
      console.log(`🎭 Fetched full details for show: ${formattedShow.title}`);
      return formattedShow;
    },
    enabled: !!showId,
    staleTime: 5 * 60 * 1000, // 5 minutes for details
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

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
          admin_show_tags (
            show_tags (
              id,
              name,
              description,
              color,
              is_active,
              sort_order
            )
          )
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      console.log('🎭 Admin shows query result:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching admin shows:', error);
        throw error;
      }
      
      // Fetch tags for all shows (separate queries since no DB relation is defined)
      const showsArr = data || [];
      const showIds = showsArr.map((s: any) => s.id);
      let tagRelations: Array<{ show_id: string; tag_id: string }> = [];
      let tagsList: any[] = [];
      if (showIds.length > 0) {
        const { data: rels } = await (supabase as any)
          .from('admin_show_tags')
          .select('show_id, tag_id')
          .in('show_id', showIds);
        tagRelations = rels || [];

        const { data: tags } = await supabase
          .from('show_tags')
          .select('*')
          .eq('is_active', true);
        tagsList = tags || [];
      }

      const tagById = new Map(tagsList.map((t: any) => [t.id, t]));
      const tagsByShow = new Map<string, any[]>();
      for (const rel of tagRelations) {
        const t = tagById.get(rel.tag_id);
        if (t) {
          const arr = tagsByShow.get(rel.show_id) || [];
          arr.push(t);
          tagsByShow.set(rel.show_id, arr);
        }
      }
      
      const formattedData = (showsArr).map((show: any) => ({
        ...show,
        performers: (show.show_performers || []).map((sp: any) => sp.actors).filter(Boolean) || [],
        show_tags: tagsByShow.get(show.id) || []
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
  tags: (show.show_tags || []).map(t => t.name),
  tagsDetailed: (show.show_tags || []).map(t => ({ name: t.name, color: t.color })),
  tag: (show.show_tags && show.show_tags.length > 0) ? {
    name: show.show_tags[0].name,
    color: show.show_tags[0].color
  } : null
});
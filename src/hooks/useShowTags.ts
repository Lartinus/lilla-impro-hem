import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ShowTag } from '@/types/showManagement';

export const useShowTags = () => {
  return useQuery({
    queryKey: ['show-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('show_tags')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ShowTag[] || [];
    }
  });
};
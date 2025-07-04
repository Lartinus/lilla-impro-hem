import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InterestSignup {
  id: string;
  title: string;
  subtitle?: string | null;
  information?: string | null;
  is_visible: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export const useInterestSignups = () => {
  return useQuery({
    queryKey: ['interest-signups-public'],
    queryFn: async (): Promise<InterestSignup[]> => {
      const { data, error } = await supabase
        .from('interest_signups')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
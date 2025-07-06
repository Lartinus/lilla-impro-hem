import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactActivity {
  activity_type: string;
  activity_title: string;
  activity_date: string;
  details: any;
}

export const useContactActivities = (email: string) => {
  return useQuery({
    queryKey: ['contact-activities', email],
    queryFn: async (): Promise<ContactActivity[]> => {
      const { data, error } = await supabase.rpc('get_contact_activities', {
        contact_email: email
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!email,
    staleTime: 30 * 1000, // 30 seconds
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableTickets = (showSlug: string, totalTickets: number) => {
  return useQuery({
    queryKey: ['available-tickets', showSlug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_tickets', {
        show_slug_param: showSlug,
        total_tickets: totalTickets
      });
      
      if (error) {
        console.error('Error fetching available tickets:', error);
        return totalTickets; // Fallback to total if error
      }
      
      return data || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time sync
  });
};

export const useTicketPurchases = (showSlug?: string) => {
  return useQuery({
    queryKey: ['ticket-purchases', showSlug],
    queryFn: async () => {
      let query = supabase
        .from('ticket_purchases')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });
      
      if (showSlug) {
        query = query.eq('show_slug', showSlug);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!showSlug, // Only run if showSlug is provided
  });
};

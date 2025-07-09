
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableTickets = (showSlug: string, totalTickets: number) => {
  return useQuery({
    queryKey: ['available-tickets', showSlug, totalTickets],
    queryFn: async () => {
      console.log(`🎫 Calculating available tickets for ${showSlug}:`);
      console.log(`  - Total tickets: ${totalTickets}`);
      
      // Critical validation: totalTickets must be provided and valid
      if (totalTickets === undefined || totalTickets === null || totalTickets < 0) {
        console.error(`❌ CRITICAL: Invalid totalTickets value: ${totalTickets}`);
        console.error(`  - This value must be configured in the show settings`);
        console.error(`  - Cannot calculate availability without total tickets`);
        return 0; // Return 0 to prevent ticket sales
      }
      
      const { data, error } = await supabase.rpc('get_available_tickets_with_bookings', {
        show_slug_param: showSlug,
        total_tickets: totalTickets
      });
      
      if (error) {
        console.error('❌ Error fetching available tickets:', error);
        console.log(`🔄 Database error - returning 0 available tickets for safety`);
        return 0; // Return 0 for safety when there's an error
      }
      
      const availableTickets = data || 0;
      console.log(`✅ Ticket calculation complete for ${showSlug}:`);
      console.log(`  - Total tickets: ${totalTickets}`);
      console.log(`  - Available tickets: ${availableTickets}`);
      console.log(`  - Sold/booked tickets: ${totalTickets - availableTickets}`);
      
      return availableTickets;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time sync
    enabled: totalTickets !== undefined && totalTickets !== null && totalTickets >= 0,
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

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalCourseBookings: number;
  soldTickets: number;
  activeCourses: number;
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Get course instances
      const { data: courseInstances } = await supabase
        .from('course_instances')
        .select('table_name, is_active')
        .eq('is_active', true);

      // Get total course bookings by counting all course booking tables
      let totalCourseBookings = 0;
      if (courseInstances) {
        for (const course of courseInstances) {
          try {
            const { data } = await supabase.rpc('get_course_booking_count', {
              table_name: course.table_name
            });
            totalCourseBookings += data || 0;
          } catch (error) {
            console.warn(`Failed to get booking count for ${course.table_name}:`, error);
          }
        }
      }

      // Get sold tickets
      const { data: ticketPurchases } = await supabase
        .from('ticket_purchases')
        .select('regular_tickets, discount_tickets')
        .eq('payment_status', 'paid');

      const soldTickets = ticketPurchases?.reduce((total, purchase) => 
        total + purchase.regular_tickets + purchase.discount_tickets, 0
      ) || 0;

      return {
        totalCourseBookings,
        soldTickets,
        activeCourses: courseInstances?.filter(c => c.is_active).length || 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
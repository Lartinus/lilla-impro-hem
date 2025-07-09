import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  avgCourseParticipants: number;
  avgSoldTicketsPerShow: number;
  activeCourses: number;
  nextShowDate: string | null;
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
      const activeCourseCount = courseInstances?.length || 0;
      
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

      // Get sold tickets and active shows
      const { data: ticketPurchases } = await supabase
        .from('ticket_purchases')
        .select('regular_tickets, discount_tickets')
        .eq('payment_status', 'paid');

      const { data: activeShows } = await supabase
        .from('admin_shows')
        .select('show_date')
        .eq('is_active', true);

      // Get next show date
      const { data: nextShow } = await supabase
        .from('admin_shows')
        .select('show_date')
        .eq('is_active', true)
        .gte('show_date', new Date().toISOString().split('T')[0])
        .order('show_date', { ascending: true })
        .limit(1)
        .single();

      const soldTickets = ticketPurchases?.reduce((total, purchase) => 
        total + purchase.regular_tickets + purchase.discount_tickets, 0
      ) || 0;

      const activeShowCount = activeShows?.length || 0;

      return {
        avgCourseParticipants: activeCourseCount > 0 ? Number((totalCourseBookings / activeCourseCount).toFixed(1)) : 0,
        avgSoldTicketsPerShow: activeShowCount > 0 ? Number((soldTickets / activeShowCount).toFixed(1)) : 0,
        activeCourses: activeCourseCount,
        nextShowDate: nextShow?.show_date || null
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
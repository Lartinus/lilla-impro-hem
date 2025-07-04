import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminCourse {
  id: string;
  course_title: string;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  table_name: string;
  is_active: boolean;
  created_at: string;
  instructor?: string;
  description?: string;
  subtitle?: string;
  available: boolean;
  showButton: boolean;
  buttonText: string;
  practicalInfo?: string[];
  course_info?: string;
  practical_info?: string;
}

export const useAdminCourses = () => {
  return useQuery({
    queryKey: ['admin-courses-formatted'],
    queryFn: async (): Promise<AdminCourse[]> => {
      const { data: courseInstances, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format course instances to match the CourseCard interface
      return (courseInstances || []).map(instance => ({
        ...instance,
        instructor: 'Kursledare från admin',
        description: instance.course_info || `${instance.course_title} - skapat från administratörspanelen.`,
        subtitle: instance.start_date ? `Startar ${new Date(instance.start_date).toLocaleDateString('sv-SE')}` : '',
        available: true,
        showButton: true,
        buttonText: 'Anmäl dig',
        practicalInfo: instance.practical_info ? [instance.practical_info] : []
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
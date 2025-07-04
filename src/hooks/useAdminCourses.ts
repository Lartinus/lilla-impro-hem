import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminCourse {
  id: string;
  course_title: string;
  subtitle?: string | null;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  table_name: string;
  is_active: boolean;
  created_at: string;
  instructor?: string;
  description?: string;
  available: boolean;
  showButton: boolean;
  buttonText: string;
  practicalInfo?: string[];
  course_info?: string;
  practical_info?: string;
  teacher?: {
    id: string;
    name: string;
    image: string | null;
    bio: string;
  } | null;
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

      // Get all performers for lookup
      const { data: performers, error: performersError } = await supabase
        .from('performers')
        .select('*')
        .eq('is_active', true);

      if (performersError) throw performersError;

      // Format course instances to match the CourseCard interface
      return (courseInstances || []).map(instance => {
        // Find the instructor in performers by name (only if instructor is not the default text)
        const instructorName = (instance as any).instructor;
        const instructor = instructorName && instructorName !== 'Kursledare från admin' 
          ? performers?.find(p => p.name === instructorName)
          : null;
        
        return {
          ...instance,
          instructor: instructorName || 'Kursledare från admin',
          description: instance.course_info || `${instance.course_title} - skapat från administratörspanelen.`,
          subtitle: instance.subtitle || (instance.start_date ? `Startar ${new Date(instance.start_date).toLocaleDateString('sv-SE')}` : ''),
          available: true,
          showButton: true,
          buttonText: 'Anmäl dig',
          practicalInfo: instance.practical_info ? [instance.practical_info] : [],
          teacher: instructor ? {
            id: instructor.id,
            name: instructor.name,
            image: instructor.image_url,
            bio: instructor.bio || ''
          } : null
        };
      });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
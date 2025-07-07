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
  instructor_id_1?: string | null;
  instructor_id_2?: string | null;
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
  teachers?: Array<{
    id: string;
    name: string;
    image: string | null;
    bio: string;
  }>;
}

export const useAdminCourses = () => {
  return useQuery({
    queryKey: ['admin-courses-formatted'],
    queryFn: async (): Promise<AdminCourse[]> => {
      const { data: courseInstances, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get all performers for lookup
      const { data: performers, error: performersError } = await supabase
        .from('performers')
        .select('*')
        .eq('is_active', true);

      if (performersError) throw performersError;

      // Format course instances to match the CourseCard interface and filter out helgworkshops
      return (courseInstances || [])
        .map(instance => {
          // Find instructors by their IDs
          const instructor1 = instance.instructor_id_1 
            ? performers?.find(p => p.id === instance.instructor_id_1)
            : null;
          const instructor2 = instance.instructor_id_2 
            ? performers?.find(p => p.id === instance.instructor_id_2)
            : null;

          // Create teachers array with both instructors if they exist
          const teachers = [instructor1, instructor2].filter(Boolean).map(instructor => ({
            id: instructor.id,
            name: instructor.name,
            image: instructor.image_url?.replace('public/', '/'),
            bio: instructor.bio || ''
          }));

          // Use first teacher as primary teacher for backward compatibility
          const primaryTeacher = teachers.length > 0 ? teachers[0] : null;
          
          return {
            ...instance,
            instructor: teachers.map(t => t.name).join(', ') || 'Kursledare från admin',
            description: instance.course_info || `${instance.course_title} - skapat från administratörspanelen.`,
            subtitle: instance.subtitle || (instance.start_date ? `Startar ${new Date(instance.start_date).toLocaleDateString('sv-SE')}` : ''),
            available: true,
            showButton: true,
            buttonText: 'Anmäl dig',
            practicalInfo: instance.practical_info ? [instance.practical_info] : [],
            teacher: primaryTeacher,
            teachers: teachers
          };
        })
        .filter(course => {
          // Filter out helgworkshops & specialkurser
          const title = course.course_title.toLowerCase();
          return !title.includes('helgworkshop') && 
                 !title.includes('specialkurs') && 
                 !title.includes('helgworkshops') &&
                 !title.includes('specialkurser');
        });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
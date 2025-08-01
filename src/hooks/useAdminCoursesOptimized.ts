
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Lightweight interface for course cards
interface CourseCardData {
  id: string;
  course_title: string;
  subtitle?: string | null;
  start_date: string | null;
  table_name: string;
  is_active: boolean;
  available: boolean;
  showButton: boolean;
  buttonText: string;
  price?: number | null;
  discount_price?: number | null;
  teacher?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

// Full course data for detail views
interface FullCourseData extends CourseCardData {
  end_date: string | null;
  max_participants: number | null;
  instructor_id_1?: string | null;
  instructor_id_2?: string | null;
  description?: string;
  practicalInfo?: string[];
  course_info?: string;
  practical_info?: string;
  start_time?: string | null;
  sessions?: number | null;
  hours_per_session?: number | null;
  teachers?: Array<{
    id: string;
    name: string;
    image: string | null;
    bio: string;
  }>;
}

// Optimized hook for course cards
export const useAdminCourseCards = () => {
  return useQuery({
    queryKey: ['admin-course-cards'],
    queryFn: async (): Promise<CourseCardData[]> => {
      console.log('📚 Fetching optimized course cards...');
      
      const { data: courseInstances, error } = await supabase
        .from('course_instances')
        .select(`
          id,
          course_title,
          subtitle,
          start_date,
          table_name,
          is_active,
          price,
          discount_price,
          instructor_id_1,
          sort_order
        `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get minimal performer data for primary instructors only
      const instructorIds = courseInstances
        ?.map(c => c.instructor_id_1)
        .filter(Boolean) || [];

      const { data: performers } = instructorIds.length > 0 
        ? await supabase
            .from('performers')
            .select('id, name, image_url')
            .in('id', instructorIds)
            .eq('is_active', true)
        : { data: [] };

      const formattedCourses = (courseInstances || [])
        .map(instance => {
          const instructor = instance.instructor_id_1 
            ? performers?.find(p => p.id === instance.instructor_id_1)
            : null;

          const teacher = instructor ? {
            id: instructor.id,
            name: instructor.name,
            image: instructor.image_url?.replace('public/', '/') || null,
          } : null;

          return {
            ...instance,
            available: true,
            showButton: true,
            buttonText: 'Anmäl dig',
            teacher
          };
        })
        .filter(course => {
          const title = course.course_title.toLowerCase();
          return !title.includes('helgworkshop') && 
                 !title.includes('specialkurs') && 
                 !title.includes('helgworkshops') &&
                 !title.includes('specialkurser');
        });

      console.log(`📚 Fetched ${formattedCourses.length} optimized course cards`);
      return formattedCourses;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for full course details
export const useAdminCourseDetails = (courseId?: string) => {
  return useQuery({
    queryKey: ['admin-course-details', courseId],
    queryFn: async (): Promise<FullCourseData> => {
      if (!courseId) throw new Error('Course ID required');
      
      console.log(`📚 Fetching full course details for ${courseId}...`);
      
      const { data: instance, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      // Get full performer data for both instructors
      const instructorIds = [instance.instructor_id_1, instance.instructor_id_2].filter(Boolean);
      const { data: performers } = instructorIds.length > 0
        ? await supabase
            .from('performers')
            .select('id, name, image_url, bio')
            .in('id', instructorIds)
            .eq('is_active', true)
        : { data: [] };

      const teachers = instructorIds.map(id => {
        const performer = performers?.find(p => p.id === id);
        return performer ? {
          id: performer.id,
          name: performer.name,
          image: performer.image_url?.replace('public/', '/') || null,
          bio: performer.bio || ''
        } : null;
      }).filter(Boolean);

      const primaryTeacher = teachers.length > 0 ? teachers[0] : null;

      // Create detailed subtitle with schedule info
      let subtitle = instance.subtitle || '';
      if (instance.start_date && instance.start_time) {
        const startDate = new Date(instance.start_date);
        const weekdays = ['söndagar', 'måndagar', 'tisdagar', 'onsdagar', 'torsdagar', 'fredagar', 'lördagar'];
        const weekday = weekdays[startDate.getDay()];
        const time = instance.start_time.substring(0, 5);
        subtitle = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${time}, startdatum ${startDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}`;
      }

      const fullCourse = {
        ...instance,
        subtitle,
        description: instance.course_info || `${instance.course_title} - skapat från administratörspanelen.`,
        available: true,
        showButton: true,
        buttonText: 'Anmäl dig',
        practicalInfo: instance.practical_info ? [instance.practical_info] : [],
        teacher: primaryTeacher,
        teachers
      };

      console.log(`📚 Fetched full details for course: ${fullCourse.course_title}`);
      return fullCourse;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes for details
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

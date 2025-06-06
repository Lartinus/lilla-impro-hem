
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CourseInstance {
  id: string;
  course_title: string;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  table_name: string;
  is_active: boolean;
  created_at: string;
}

export const useCourseInstances = (courseTitle: string) => {
  return useQuery({
    queryKey: ['course-instances', courseTitle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('course_title', courseTitle)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching course instances:', error);
        throw error;
      }

      return data as CourseInstance[];
    },
  });
};

export const createCourseInstance = async (courseTitle: string) => {
  // Generate a unique table name using course title and timestamp
  const timestamp = Date.now();
  const sanitizedTitle = courseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  const tableName = `course_${sanitizedTitle}_${timestamp}`;

  // First create the course instance record
  const { data: instanceData, error: instanceError } = await supabase
    .from('course_instances')
    .insert({
      course_title: courseTitle,
      table_name: tableName,
      max_participants: 12,
      is_active: true
    })
    .select()
    .single();

  if (instanceError) {
    console.error('Error creating course instance:', instanceError);
    throw instanceError;
  }

  // Then create the actual booking table
  const { error: tableError } = await supabase.rpc('create_course_booking_table', {
    table_name: tableName
  });

  if (tableError) {
    console.error('Error creating course booking table:', tableError);
    throw tableError;
  }

  return instanceData;
};

export const getCurrentCourseBookings = async (tableName: string) => {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error getting course bookings count:', error);
    throw error;
  }

  return count || 0;
};

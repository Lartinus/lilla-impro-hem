
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
  try {
    const { data, error } = await supabase.rpc('get_course_booking_count', {
      table_name: tableName
    });

    if (error) {
      console.error('Error getting course bookings count:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in getCurrentCourseBookings:', error);
    return 0;
  }
};

export const checkDuplicateBooking = async (email: string, tableName: string) => {
  try {
    const { data, error } = await supabase.rpc('check_duplicate_course_booking', {
      table_name: tableName,
      email_address: email.toLowerCase()
    });

    if (error) {
      console.error('Error checking duplicate booking:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in checkDuplicateBooking:', error);
    return false;
  }
};

export const insertCourseBooking = async (tableName: string, bookingData: any) => {
  try {
    const { error } = await supabase.rpc('insert_course_booking', {
      table_name: tableName,
      booking_name: bookingData.name,
      booking_phone: bookingData.phone,
      booking_email: bookingData.email,
      booking_address: bookingData.address || '',
      booking_postal_code: bookingData.postal_code || '',
      booking_city: bookingData.city || '',
      booking_message: bookingData.message || ''
    });

    if (error) {
      console.error('Error inserting course booking:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in insertCourseBooking:', error);
    throw error;
  }
};

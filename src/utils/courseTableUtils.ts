import { supabase } from '@/integrations/supabase/client';

export const generateTableName = (courseTitle: string) => {
  const timestamp = Date.now();
  const sanitizedTitle = courseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  return `course_${sanitizedTitle}_${timestamp}`;
};

export const ensureCourseTableExists = async (courseTitle: string) => {
  try {
    // Generate a consistent table name
    const timestamp = Date.now();
    const sanitizedTitle = courseTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
    
    const tableName = `course_${sanitizedTitle}_${timestamp}`;

    // Check if we already have an active instance for this course
    const { data: existingInstances } = await supabase
      .from('course_instances')
      .select('*')
      .eq('course_title', courseTitle)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingInstances && existingInstances.length > 0) {
      console.log('Found existing course instance:', existingInstances[0]);
      return existingInstances[0];
    }

    // Create new course instance
    console.log('Creating new course instance for:', courseTitle);
    
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

    // Create the actual booking table
    const { error: tableError } = await supabase.rpc('create_course_booking_table', {
      table_name: tableName
    });

    if (tableError) {
      console.error('Error creating course booking table:', tableError);
      throw tableError;
    }

    console.log('Successfully created course table:', tableName);
    return instanceData;
  } catch (error) {
    console.error('Error in ensureCourseTableExists:', error);
    throw error;
  }
};

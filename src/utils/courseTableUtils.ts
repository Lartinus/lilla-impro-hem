
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

const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('table_exists', {
      table_name: tableName
    });

    if (error) {
      console.error('Error checking table existence:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkTableExists:', error);
    return false;
  }
};

export const ensureCourseTableExists = async (courseTitle: string) => {
  try {
    console.log('🔍 Looking for existing course instance for:', courseTitle);
    
    // First, check if we already have an active instance for this course
    const { data: existingInstances, error: fetchError } = await supabase
      .from('course_instances')
      .select('*')
      .eq('course_title', courseTitle)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing course instances:', fetchError);
      throw new Error(`Failed to fetch course instances: ${fetchError.message}`);
    }

    if (existingInstances && existingInstances.length > 0) {
      const existingInstance = existingInstances[0];
      console.log('✅ Found existing course instance:', existingInstance);
      
      // Verify that the table actually exists
      const tableExists = await checkTableExists(existingInstance.table_name);
      console.log('🔍 Table exists check for', existingInstance.table_name, ':', tableExists);

      if (!tableExists) {
        console.log('🔧 Table missing, recreating:', existingInstance.table_name);
        
        // Create the missing table using the fixed function
        const { error: createTableError } = await supabase.rpc('create_course_booking_table', {
          table_name: existingInstance.table_name
        });

        if (createTableError) {
          console.error('❌ Error creating missing course booking table:', createTableError);
          throw new Error(`Failed to create course table: ${createTableError.message}`);
        }
        
        console.log('✅ Successfully recreated missing table:', existingInstance.table_name);
      } else {
        console.log('✅ Table exists, checking booking count...');
        
        // Table exists, get booking count safely
        try {
          const { data: bookingCount, error: countError } = await supabase.rpc('get_course_booking_count', {
            table_name: existingInstance.table_name
          });

          if (countError) {
            console.error('⚠️ Error getting booking count:', countError);
          } else {
            console.log('📊 Table has', bookingCount, 'bookings');
          }
        } catch (countError) {
          console.error('⚠️ Failed to get booking count:', countError);
          // Don't fail the whole process for this
        }
      }
      
      return existingInstance;
    }

    // No existing active instance found, create a new one
    console.log('🆕 No existing course instance found, creating new one for:', courseTitle);
    
    const tableName = generateTableName(courseTitle);
    console.log('📋 Generated table name:', tableName);

    // Create new course instance
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
      console.error('❌ Error creating course instance:', instanceError);
      throw new Error(`Failed to create course instance: ${instanceError.message}`);
    }

    console.log('✅ Successfully created course instance:', instanceData);

    // Create the actual booking table using the fixed function
    const { error: tableError } = await supabase.rpc('create_course_booking_table', {
      table_name: tableName
    });

    if (tableError) {
      console.error('❌ Error creating course booking table:', tableError);
      
      // Try to clean up the instance we just created
      try {
        await supabase
          .from('course_instances')
          .delete()
          .eq('id', instanceData.id);
      } catch (cleanupError) {
        console.error('⚠️ Failed to clean up course instance after table creation failure:', cleanupError);
      }
      
      throw new Error(`Failed to create course booking table: ${tableError.message}`);
    }

    console.log('✅ Successfully created course table:', tableName);
    
    // Verify the table was actually created
    const finalTableCheck = await checkTableExists(tableName);
    if (!finalTableCheck) {
      console.error('❌ Table creation succeeded but table still not found');
      throw new Error('Table creation verification failed');
    }
    
    return instanceData;
    
  } catch (error) {
    console.error('❌ Error in ensureCourseTableExists:', error);
    
    // Re-throw with more context if it's not already a descriptive error
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Course table setup failed: ${String(error)}`);
    }
  }
};

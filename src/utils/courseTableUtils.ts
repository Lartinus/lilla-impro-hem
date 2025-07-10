
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
    
    // Map table names to proper course titles to fix the existing data issue
    const tableNameToCourseTitle: { [key: string]: string } = {
      'course_niv__1_1752147042033': 'Nivå 1 – Improv Comedy: Scenarbete',
      'course_niv_1_scenarbete_improv_comedy_1749454350362': 'Nivå 1 – Improv Comedy: Scenarbete',
      'course_niv_2_l_ngform_improviserad_komik_1749806847850': 'Nivå 2 – Improv Comedy: Långform'
    };
    
    // If courseTitle looks like a table name, map it to the proper title
    let searchTitle = courseTitle;
    if (courseTitle.startsWith('course_') && tableNameToCourseTitle[courseTitle]) {
      searchTitle = tableNameToCourseTitle[courseTitle];
      console.log('🔄 Mapped table name to course title:', courseTitle, '->', searchTitle);
    }
    
    // First, check if we already have an active instance for this course
    const { data: existingInstances, error: fetchError } = await supabase
      .from('course_instances')
      .select('*')
      .or(`course_title.eq.${searchTitle},table_name.eq.${courseTitle}`)
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
      
      // For courses with empty table_name, leave them as is - they'll use course_bookings table
      if (!existingInstance.table_name || existingInstance.table_name.trim() === '') {
        console.log('📋 Course has empty table_name, will use course_bookings table as fallback');
        return existingInstance;
      }
      
      // Check if the table actually exists in the database
      const tableExists = await checkTableExists(existingInstance.table_name);
      if (!tableExists) {
        console.log('⚠️ Table does not exist:', existingInstance.table_name, 'Setting table_name to empty for fallback');
        
        // Update the instance to have empty table_name so it uses course_bookings table
        const { data: updatedInstance, error: updateError } = await supabase
          .from('course_instances')
          .update({ table_name: '' })
          .eq('id', existingInstance.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('❌ Failed to update table_name to empty:', updateError);
          // Return original instance with empty table_name for fallback
          return { ...existingInstance, table_name: '' };
        }
        
        console.log('✅ Updated instance to use course_bookings table fallback');
        return updatedInstance;
      }
      
      // For existing instances with valid table names that exist, trust they're working
      console.log('✅ Using existing instance with verified table');
      
      return existingInstance;
    }

    // No existing active instance found, create a new one
    console.log('🆕 No existing course instance found, creating new one for:', courseTitle);
    
    const tableName = generateTableName(courseTitle);
    console.log('📋 Generated table name:', tableName);

    // Create new course instance first
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
        console.log('🧹 Cleaned up failed course instance');
      } catch (cleanupError) {
        console.error('⚠️ Failed to clean up course instance after table creation failure:', cleanupError);
      }
      
      throw new Error(`Failed to create course booking table: ${tableError.message}`);
    }

    console.log('✅ Successfully created course table:', tableName);
    
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

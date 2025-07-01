
import { supabase } from '@/integrations/supabase/client';

export const useCourseSync = () => {

  const syncCourses = async () => {
    try {
      console.log('Triggering course sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-courses');
      
      if (error) {
        console.error('Error syncing courses:', error);
        throw error;
      }
      
      console.log('Course sync result:', data);
      
      // Removed toast notification - sync should be silent
      
      return data;
    } catch (error) {
      console.error('Failed to sync courses (silent):', error);
      
      // Removed toast notification - errors should also be silent for background sync
      
      throw error;
    }
  };

  return { syncCourses };
};

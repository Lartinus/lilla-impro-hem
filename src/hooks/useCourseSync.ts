
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCourseSync = () => {
  const { toast } = useToast();

  const syncCourses = async () => {
    try {
      console.log('Triggering course sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-courses');
      
      if (error) {
        console.error('Error syncing courses:', error);
        throw error;
      }
      
      console.log('Course sync result:', data);
      
      toast({
        title: "Kurser synkroniserade",
        description: "Alla kurser från Strapi har synkroniserats och kurstabeller har skapats.",
      });
      
      return data;
    } catch (error) {
      console.error('Failed to sync courses:', error);
      
      toast({
        title: "Synkroniseringsfel",
        description: "Det gick inte att synkronisera kurserna. Försök igen senare.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { syncCourses };
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CourseWithBookings, NewCourseForm, CourseTemplate, Performer } from '@/types/courseManagement';
import { generateCourseTitle, generateTableName } from '@/utils/courseTemplateHelpers';

export const useCourseManagementMutations = (
  sortedCourses: CourseWithBookings[],
  courseTemplates: CourseTemplate[],
  performers: Performer[] | undefined
) => {
  const queryClient = useQueryClient();

  // Move course up mutation
  const moveCourseUpMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const currentIndex = sortedCourses.findIndex(c => c.id === course.id);
      if (currentIndex > 0) {
        const prevCourse = sortedCourses[currentIndex - 1];
        const currentSortOrder = course.sort_order || 0;
        const prevSortOrder = prevCourse.sort_order || 0;
        
        await Promise.all([
          supabase.from('course_instances').update({ sort_order: prevSortOrder }).eq('id', course.id),
          supabase.from('course_instances').update({ sort_order: currentSortOrder }).eq('id', prevCourse.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta kursen: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Move course down mutation
  const moveCourseDownMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const currentIndex = sortedCourses.findIndex(c => c.id === course.id);
      if (currentIndex < sortedCourses.length - 1) {
        const nextCourse = sortedCourses[currentIndex + 1];
        const currentSortOrder = course.sort_order || 0;
        const nextSortOrder = nextCourse.sort_order || 0;
        
        await Promise.all([
          supabase.from('course_instances').update({ sort_order: nextSortOrder }).eq('id', course.id),
          supabase.from('course_instances').update({ sort_order: currentSortOrder }).eq('id', nextCourse.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta kursen: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      // Delete the booking table first
      await supabase.rpc('drop_course_booking_table', {
        table_name: course.table_name
      });

      // Delete the course instance
      const { error } = await supabase
        .from('course_instances')
        .delete()
        .eq('id', course.id);

      if (error) throw error;

      // Reorder the remaining courses to have sequential sort_order (1, 2, 3, etc.)
      const { data: remainingCourses, error: fetchError } = await supabase
        .from('course_instances')
        .select('id, sort_order')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Update sort_order to be sequential starting from 1
      if (remainingCourses && remainingCourses.length > 0) {
        const updates = remainingCourses.map((course, index) => 
          supabase
            .from('course_instances')
            .update({ sort_order: index + 1 })
            .eq('id', course.id)
        );

        await Promise.all(updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Kurs raderad",
        description: "Kursen har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle course status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const { error } = await supabase
        .from('course_instances')
        .update({ is_active: !course.is_active })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Status uppdaterad",
        description: "Kursstatus har ändrats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte ändra kursstatus: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mark course as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const { error } = await supabase
        .from('course_instances')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: "Kurs markerad som genomförd",
        description: "Kursen har flyttats till arkivet",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte markera kurs som genomförd: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Restore course from completed to active mutation
  const restoreCourseMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const { error } = await supabase
        .from('course_instances')
        .update({ completed_at: null })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Kurs återställd",
        description: "Kursen har flyttats tillbaka till aktiva kurser",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte återställa kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (courseData: { course: CourseWithBookings; formData: NewCourseForm }) => {
      const { course, formData } = courseData;
      
      const { error } = await supabase
        .from('course_instances')
        .update({
          course_title: (() => {
            // Check if it's a template
            const template = courseTemplates.find(t => t.id === formData.courseType);
            if (template) {
              return template.title_template || formData.customName || course.course_title;
            }
            
            // Handle legacy course types
            switch (formData.courseType) {
              case 'custom':
              case 'helgworkshop':
                return formData.customName;
              case 'niv1':
                return 'Nivå 1 - Scenarbete & Improv Comedy';
              case 'niv2':
                return 'Nivå 2 - Långform improviserad komik';
              case 'houseteam':
                return 'House Team & fortsättning';
              default:
                return course.course_title;
            }
          })(),
          subtitle: formData.subtitle,
          start_date: formData.startDate?.toISOString().split('T')[0],
          start_time: formData.startTime,
          max_participants: formData.maxParticipants,
          course_info: formData.courseInfo,
          practical_info: formData.practicalInfo,
          instructor_id_1: formData.instructor1 ? performers?.find(p => p.id === formData.instructor1)?.id || null : null,
          instructor_id_2: formData.instructor2 ? performers?.find(p => p.id === formData.instructor2)?.id || null : null,
          price: formData.price,
          discount_price: formData.discountPrice,
          sessions: formData.sessions,
          hours_per_session: formData.hoursPerSession,
        })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Kurs uppdaterad",
        description: "Kursen har uppdaterats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: NewCourseForm) => {
      // Get the highest sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('course_instances')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;

      // Generate course title and table name
      const courseTitle = generateCourseTitle(courseData, courseTemplates);
      const tableName = generateTableName(courseData, courseTemplates);

      // Create course instance
      const { data: courseInstance, error: courseError } = await supabase
        .from('course_instances')
        .insert({
          course_title: courseTitle,
          subtitle: courseData.subtitle,
          table_name: tableName,
          start_date: courseData.startDate?.toISOString().split('T')[0],
          start_time: courseData.startTime,
          max_participants: courseData.maxParticipants,
          course_info: courseData.courseInfo,
          practical_info: courseData.practicalInfo,
          instructor_id_1: courseData.instructor1 ? performers?.find(p => p.id === courseData.instructor1)?.id || null : null,
          instructor_id_2: courseData.instructor2 ? performers?.find(p => p.id === courseData.instructor2)?.id || null : null,
          price: courseData.price,
          discount_price: courseData.discountPrice,
          sessions: courseData.sessions,
          hours_per_session: courseData.hoursPerSession,
          sort_order: nextSortOrder,
          is_active: false
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create the booking table
      await supabase.rpc('create_course_booking_table', {
        table_name: tableName
      });

      return courseInstance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Kurs skapad",
        description: "Kursen har skapats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skapa kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    moveCourseUpMutation,
    moveCourseDownMutation,
    deleteCourseMutation,
    toggleStatusMutation,
    markCompletedMutation,
    restoreCourseMutation,
    updateCourseMutation,
    createCourseMutation
  };
};
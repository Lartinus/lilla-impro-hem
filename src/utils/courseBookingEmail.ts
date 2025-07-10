import { supabase } from '@/integrations/supabase/client';
import type { CourseBookingData } from '@/schemas/courseBookingSchemas';

interface CourseInstance {
  course_title: string;
  start_date?: string | null;
  start_time?: string | null;
}

export const sendConfirmationEmail = async (
  formData: CourseBookingData,
  courseTitle: string,
  courseInstance: CourseInstance
): Promise<void> => {
  try {
    const isHouseTeamsOrContinuation = courseTitle.includes("House teams") || courseTitle.includes("fortsättning");
    
    console.log('📧 Sending confirmation email for course:', courseTitle);
    console.log('📧 Email data:', { name: formData.name, email: formData.email, isAvailable: !isHouseTeamsOrContinuation });
    
    // Check if courseTitle looks like a table name and fix it
    let actualCourseTitle = courseTitle;
    if (courseTitle.startsWith('course_')) {
      console.log('⚠️ Course title looks like table name, trying to get real title from instance');
      actualCourseTitle = courseInstance.course_title || courseTitle;
    }
    
    const emailPayload = {
      name: formData.name,
      email: formData.email,
      courseTitle: actualCourseTitle,
      isAvailable: !isHouseTeamsOrContinuation,
      courseStartDate: courseInstance.start_date,
      courseStartTime: courseInstance.start_time
    };
    
    console.log('📧 Calling edge function with payload:', emailPayload);
    console.log('📧 DEBUG: formData.name value:', formData.name);
    console.log('📧 DEBUG: formData.name type:', typeof formData.name);
    console.log('📧 DEBUG: formData.name length:', formData.name ? formData.name.length : 'undefined');
    
    const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-course-confirmation', {
      body: emailPayload
    });

    if (emailError) {
      console.error('⚠️ Error sending confirmation email:', emailError);
      console.error('⚠️ Email error details:', JSON.stringify(emailError, null, 2));
      // Don't fail the booking just because email failed
    } else {
      console.log('📧 Confirmation email sent successfully');
      console.log('📧 Email response:', emailResponse);
    }
  } catch (emailError) {
    console.error('⚠️ Exception while sending confirmation email:', emailError);
    // Don't fail the booking just because email failed
  }
};
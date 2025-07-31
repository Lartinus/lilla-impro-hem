import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ensureCourseTableExists } from '@/utils/courseTableUtils';
import { sendConfirmationEmail } from '@/utils/courseBookingEmail';
import { checkDuplicateBooking, insertBooking } from '@/utils/courseBookingDatabase';
import { getBookingErrorMessage, type BookingResult } from '@/utils/courseBookingErrors';
import type { CourseBookingData } from '@/schemas/courseBookingSchemas';

export const useCourseBooking = (courseTitle: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmails, setSubmittedEmails] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSubmit = async (values: CourseBookingData): Promise<BookingResult> => {
    // Prevent duplicate submissions for the same email
    const emailKey = `${values.email}-${courseTitle}`;
    if (submittedEmails.has(emailKey)) {
      console.log('🛑 Duplicate submission prevented for:', emailKey);
      return { success: false, error: 'duplicate_submission' };
    }

    setIsSubmitting(true);
    setSubmittedEmails(prev => new Set(prev.add(emailKey)));
    
    try {
      console.log('🎯 Starting course booking process for:', courseTitle);
      console.log('📝 Booking data:', values);
      
      // Ensure the course table exists - now with better error handling
      let courseInstance;
      try {
        courseInstance = await ensureCourseTableExists(courseTitle);
        console.log('✅ Using course instance:', courseInstance);
      } catch (tableError) {
        console.error('❌ Failed to ensure course table exists:', tableError);
        toast({ 
          title: "Systemfel", 
          description: "Anmälningssystemet är tillfälligt otillgängligt. Försök igen om en stund eller kontakta oss direkt.",
          variant: "destructive" 
        });
        return { success: false, error: 'table_creation_failed' };
      }
      
      // Handle courses with empty table_name (fallback to course_bookings table)
      const tableName = courseInstance.table_name && courseInstance.table_name.trim() !== '' 
        ? courseInstance.table_name 
        : 'course_bookings';
        
      console.log('📋 Using table for booking:', tableName);
      
      // Check for duplicate booking
      const isDuplicate = await checkDuplicateBooking(values.email, courseTitle, tableName);
      
      if (isDuplicate) {
        toast({ 
          title: "Redan anmäld", 
          description: "Du har redan anmält dig till denna kurs med den e-postadressen.",
          variant: "destructive" 
        });
        return { success: false, error: 'duplicate' };
      }
      
      // Insert the booking
      try {
        await insertBooking(values, courseTitle, tableName);
      } catch (insertError: any) {
        console.error('❌ Database error during booking:', insertError);
        
        const errorMessage = getBookingErrorMessage(insertError);
        
        toast({ 
          title: "Anmälan misslyckades", 
          description: errorMessage,
          variant: "destructive" 
        });
        
        return { success: false, error: insertError };
      }
      
      // Send confirmation email
      await sendConfirmationEmail(values, courseTitle, courseInstance);
      
      toast({ 
        title: "Anmälan skickad!", 
        description: "Vi återkommer till dig så snart som möjligt. Du kommer även få en bekräftelse via e-post." 
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Unexpected error in course booking:', error);
      
      toast({ 
        title: "Oväntat fel", 
        description: "Ett oväntat fel inträffade. Försök igen eller kontakta oss direkt.", 
        variant: "destructive" 
      });
      
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
      // Remove email from submitted set after a short delay to allow for proper completion
      setTimeout(() => {
        setSubmittedEmails(prev => {
          const newSet = new Set(prev);
          newSet.delete(`${values.email}-${courseTitle}`);
          return newSet;
        });
      }, 5000);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};
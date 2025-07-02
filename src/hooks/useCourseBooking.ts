
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ensureCourseTableExists } from '@/utils/courseTableUtils';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får vara max 100 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string()
    .min(6, 'Telefonnummer måste vara minst 6 tecken')
    .max(20, 'Telefonnummer får vara max 20 tecken')
    .regex(/^[+0-9\s\-()]+$/, 'Telefonnummer får endast innehålla siffror, +, -, (), och mellanslag'),
  address: z.string().min(1, 'Adress är obligatorisk'),
  postalCode: z.string().min(1, 'Postnummer är obligatoriskt'),
  city: z.string().min(1, 'Stad är obligatorisk'),
});

const houseTeamsSchema = z.object({
  name: z.string()
    .min(2, 'Namn måste vara minst 2 tecken')
    .max(100, 'Namn får vara max 100 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string()
    .min(6, 'Telefonnummer måste vara minst 6 tecken')
    .max(20, 'Telefonnummer får vara max 20 tecken')
    .regex(/^[+0-9\s\-()]+$/, 'Telefonnummer får endast innehålla siffror, +, -, (), och mellanslag'),
  message: z.string().optional(),
});

export const useCourseBooking = (courseTitle: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: z.infer<typeof formSchema> | z.infer<typeof houseTeamsSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('🎯 Starting course booking process for:', courseTitle);
      console.log('📝 Booking data:', values);
      
      // Ensure the course table exists
      let courseInstance;
      try {
        courseInstance = await ensureCourseTableExists(courseTitle);
        console.log('✅ Using course instance:', courseInstance);
      } catch (tableError) {
        console.error('❌ Failed to ensure course table exists:', tableError);
        toast({ 
          title: "Systemfel", 
          description: "Kunde inte förbereda anmälan. Försök igen om en stund.",
          variant: "destructive" 
        });
        return { success: false, error: 'table_creation_failed' };
      }
      
      // Verify table exists
      try {
        const { data: tableExists, error: tableCheckError } = await supabase.rpc('table_exists', {
          table_name: courseInstance.table_name
        });

        if (tableCheckError) {
          console.error('⚠️ Error checking table existence:', tableCheckError);
        } else {
          console.log('🔍 Table exists check result:', tableExists);
          if (!tableExists) {
            console.error('❌ Table does not exist after creation attempt');
            toast({ 
              title: "Systemfel", 
              description: "Anmälningssystemet är inte tillgängligt just nu. Försök igen senare.",
              variant: "destructive" 
            });
            return { success: false, error: 'table_missing' };
          }
        }
      } catch (verifyError) {
        console.error('❌ Failed to verify table existence:', verifyError);
        // Continue anyway - the booking might still work
      }
      
      // Check for duplicate booking
      try {
        const { data: isDuplicate, error: duplicateCheckError } = await supabase.rpc('check_duplicate_course_booking', {
          table_name: courseInstance.table_name,
          email_address: values.email.toLowerCase()
        });
        
        if (duplicateCheckError) {
          console.error('⚠️ Error checking for duplicate booking:', duplicateCheckError);
          // Continue with booking attempt - don't block on this check
        } else if (isDuplicate) {
          toast({ 
            title: "Redan anmäld", 
            description: "Du har redan anmält dig till denna kurs med den e-postadressen.",
            variant: "destructive" 
          });
          return { success: false, error: 'duplicate' };
        }
      } catch (duplicateError) {
        console.error('⚠️ Duplicate check failed:', duplicateError);
        // Continue anyway
      }
      
      // Insert the booking
      console.log('💾 Attempting to insert booking...');
      try {
        const { error: insertError } = await supabase.rpc('insert_course_booking', {
          table_name: courseInstance.table_name,
          booking_name: values.name,
          booking_phone: values.phone,
          booking_email: values.email,
          booking_address: 'address' in values ? values.address || '' : '',
          booking_postal_code: 'postalCode' in values ? values.postalCode || '' : '',
          booking_city: 'city' in values ? values.city || '' : '',
          booking_message: 'message' in values ? values.message || '' : ''
        });
        
        if (insertError) {
          console.error('❌ Database error during booking:', insertError);
          
          // Handle specific database validation errors
          let errorMessage = "Något gick fel vid anmälan. Kontrollera dina uppgifter och försök igen.";
          
          if (insertError.message.includes('Ogiltig e-postadress')) {
            errorMessage = "Ogiltig e-postadress. Kontrollera att du har angett rätt format.";
          } else if (insertError.message.includes('Ogiltigt telefonnummer')) {
            errorMessage = "Ogiltigt telefonnummer. Ange ett nummer mellan 6-20 tecken.";
          } else if (insertError.message.includes('Namn får inte vara tomt')) {
            errorMessage = "Namn är obligatoriskt och får inte vara tomt.";
          } else if (insertError.message.includes('Namn är för långt')) {
            errorMessage = "Namn är för långt. Maximalt 100 tecken tillåtet.";
          } else if (insertError.message.includes('duplicate key') || insertError.message.includes('unique constraint')) {
            errorMessage = "Du har redan anmält dig till denna kurs med den e-postadressen.";
          } else if (insertError.message.includes('permission denied')) {
            errorMessage = "Åtkomst nekad. Kontakta support om problemet kvarstår.";
          }
          
          toast({ 
            title: "Anmälan misslyckades", 
            description: errorMessage,
            variant: "destructive" 
          });
          
          return { success: false, error: insertError };
        }
      } catch (insertError) {
        console.error('❌ Failed to insert booking:', insertError);
        toast({ 
          title: "Anmälan misslyckades", 
          description: "Kunde inte skicka anmälan. Kontrollera din internetanslutning och försök igen.",
          variant: "destructive" 
        });
        return { success: false, error: insertError };
      }
      
      console.log('✅ Course booking submitted successfully to table:', courseInstance.table_name);
      
      // Send confirmation email
      try {
        const isHouseTeamsOrContinuation = courseTitle.includes("House teams") || courseTitle.includes("fortsättning");
        
        console.log('📧 Sending confirmation email...');
        const { error: emailError } = await supabase.functions.invoke('send-course-confirmation', {
          body: {
            name: values.name,
            email: values.email,
            courseTitle: courseTitle,
            isAvailable: !isHouseTeamsOrContinuation
          }
        });

        if (emailError) {
          console.error('⚠️ Error sending confirmation email:', emailError);
          // Don't fail the booking just because email failed
        } else {
          console.log('📧 Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('⚠️ Error sending confirmation email:', emailError);
        // Don't fail the booking just because email failed
      }
      
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
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
};

export { formSchema, houseTeamsSchema };

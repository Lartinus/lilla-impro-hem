
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
      console.log('Submitting course booking for:', courseTitle);
      console.log('Booking data:', values);
      
      const courseInstance = await ensureCourseTableExists(courseTitle);
      console.log('Course instance:', courseInstance);
      
      const { error } = await supabase.rpc('insert_course_booking', {
        table_name: courseInstance.table_name,
        booking_name: values.name,
        booking_phone: values.phone,
        booking_email: values.email,
        booking_address: 'address' in values ? values.address || '' : '',
        booking_postal_code: 'postalCode' in values ? values.postalCode || '' : '',
        booking_city: 'city' in values ? values.city || '' : '',
        booking_message: 'message' in values ? values.message || '' : ''
      });
      
      if (error) {
        console.error('Database error:', error);
        
        // Handle specific database validation errors with Swedish messages
        let errorMessage = "Något gick fel vid anmälan. Försök igen.";
        
        if (error.message.includes('Ogiltig e-postadress')) {
          errorMessage = "Ogiltig e-postadress. Kontrollera att du har angett rätt format.";
        } else if (error.message.includes('Ogiltigt telefonnummer')) {
          errorMessage = "Ogiltigt telefonnummer. Ange ett nummer mellan 6-20 tecken.";
        } else if (error.message.includes('Namn får inte vara tomt')) {
          errorMessage = "Namn är obligatoriskt och får inte vara tomt.";
        } else if (error.message.includes('Namn är för långt')) {
          errorMessage = "Namn är för långt. Maximalt 100 tecken tillåtet.";
        } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          errorMessage = "Du har redan anmält dig till denna kurs med den e-postadressen.";
        }
        
        toast({ 
          title: "Anmälan misslyckades", 
          description: errorMessage,
          variant: "destructive" 
        });
        
        throw error;
      }
      
      console.log('Course booking submitted successfully');
      toast({ 
        title: "Anmälan skickad!", 
        description: "Vi återkommer till dig så snart som möjligt." 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting course booking:', error);
      
      // Only show generic error if we haven't already shown a specific one
      if (!error?.message?.includes('Ogiltig') && !error?.message?.includes('duplicate')) {
        toast({ 
          title: "Något gick fel", 
          description: "Försök igen eller kontakta oss direkt.", 
          variant: "destructive" 
        });
      }
      
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

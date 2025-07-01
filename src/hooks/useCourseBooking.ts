
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ensureCourseTableExists } from '@/utils/courseTableUtils';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(6, 'Telefonnummer måste vara minst 6 tecken'),
  address: z.string().min(1, 'Adress är obligatorisk'),
  postalCode: z.string().min(1, 'Postnummer är obligatoriskt'),
  city: z.string().min(1, 'Stad är obligatorisk'),
});

const houseTeamsSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(6, 'Telefonnummer måste vara minst 6 tecken'),
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
      toast({ 
        title: "Något gick fel", 
        description: "Försök igen eller kontakta oss direkt.", 
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

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WaitlistBookingData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface WaitlistBookingResult {
  success: boolean;
  message: string;
}

export function useWaitlistBooking(courseInstanceId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmails] = useState(new Set<string>());

  const handleSubmit = async (values: WaitlistBookingData): Promise<WaitlistBookingResult> => {
    if (isSubmitting) {
      return { success: false, message: "Väntelista-anmälan pågår redan..." };
    }

    // Prevent immediate duplicate submissions
    if (submittedEmails.has(values.email.toLowerCase())) {
      return { success: false, message: "Du har redan anmält dig till väntelistan för denna kurs." };
    }

    setIsSubmitting(true);

    try {
      // Add to waitlist using RPC function
      const { data, error } = await supabase.rpc('add_to_waitlist', {
        course_instance_id_param: courseInstanceId,
        name_param: values.name,
        email_param: values.email,
        phone_param: values.phone,
        message_param: values.message || ''
      });

      if (error) {
        console.error('Waitlist booking error:', error);
        
        if (error.message.includes('duplicate key value violates unique constraint')) {
          return { success: false, message: "Du står redan på väntelistan för denna kurs." };
        }
        
        return { success: false, message: "Ett fel uppstod vid anmälan till väntelistan. Försök igen." };
      }

      // Track submitted email to prevent immediate duplicates
      submittedEmails.add(values.email.toLowerCase());

      toast.success("Du har lagts till på väntelistan!", {
        description: "Vi kontaktar dig om en plats blir ledig."
      });

      return { success: true, message: "Anmälan till väntelistan lyckades!" };
    } catch (error) {
      console.error('Unexpected error:', error);
      return { success: false, message: "Ett oväntat fel uppstod. Försök igen senare." };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitWaitlistBooking: handleSubmit,
    isSubmitting
  };
}
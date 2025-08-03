import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourseOfferData {
  courseInstanceId: string;
  courseTitle: string;
  courseTableName: string;
  coursePrice: number;
  waitlistEmail: string;
  waitlistName: string;
  waitlistPhone?: string;
  waitlistMessage?: string;
}

export function useCourseOffers() {
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  const sendCourseOffer = async (offerData: CourseOfferData): Promise<boolean> => {
    if (isSendingOffer) return false;

    setIsSendingOffer(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-course-offer', {
        body: offerData
      });

      if (error) {
        console.error('Course offer error:', error);
        toast.error('Kunde inte skicka kurserbjudande. Försök igen.');
        return false;
      }

      if (data?.success) {
        toast.success('Kurserbjudande skickat!', {
          description: `Ett mejl har skickats till ${offerData.waitlistEmail}`
        });
        return true;
      } else {
        toast.error('Kunde inte skicka kurserbjudande. Försök igen.');
        return false;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ett oväntat fel uppstod. Försök igen.');
      return false;
    } finally {
      setIsSendingOffer(false);
    }
  };

  return {
    sendCourseOffer,
    isSendingOffer
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WaitlistEntry {
  id: string;
  course_instance_id: string;
  name: string;
  email: string;
  message?: string;
  position_in_queue: number;
  created_at: string;
}

export const useWaitlistManagement = (courseInstanceId?: string) => {
  const queryClient = useQueryClient();

  // Fetch waitlist entries for a specific course
  const {
    data: waitlistEntries = [],
    isLoading: isLoadingWaitlist,
    error: waitlistError
  } = useQuery({
    queryKey: ['waitlist', courseInstanceId],
    queryFn: async () => {
      if (!courseInstanceId) return [];
      
      const { data, error } = await supabase
        .from('course_waitlist')
        .select('*')
        .eq('course_instance_id', courseInstanceId)
        .order('position_in_queue');
      
      if (error) {
        console.error('Error fetching waitlist:', error);
        throw error;
      }
      
      return data as WaitlistEntry[];
    },
    enabled: !!courseInstanceId,
  });

  // Get waitlist count for a course
  const {
    data: waitlistCount = 0,
    isLoading: isLoadingCount
  } = useQuery({
    queryKey: ['waitlist-count', courseInstanceId],
    queryFn: async () => {
      if (!courseInstanceId) return 0;
      
      const { data, error } = await supabase
        .rpc('get_waitlist_count', { course_instance_id_param: courseInstanceId });
      
      if (error) {
        console.error('Error fetching waitlist count:', error);
        return 0;
      }
      
      return data || 0;
    },
    enabled: !!courseInstanceId,
  });

  // Move person from waitlist to course
  const moveFromWaitlistMutation = useMutation({
    mutationFn: async ({ 
      courseInstanceId, 
      email, 
      courseTableName,
      coursePrice = 0
    }: { 
      courseInstanceId: string; 
      email: string; 
      courseTableName: string; 
      coursePrice?: number;
    }) => {
      // Get the waitlist entry to get person's details
      const { data: waitlistEntry, error: getError } = await supabase
        .from('course_waitlist')
        .select('*')
        .eq('course_instance_id', courseInstanceId)
        .eq('email', email)
        .single();
      
      if (getError || !waitlistEntry) {
        throw new Error('Could not find waitlist entry');
      }

      // If course has a price, trigger payment flow
      if (coursePrice > 0) {
        // Get course details for payment
        const { data: courseInstance, error: courseError } = await supabase
          .from('course_instances')
          .select('*')
          .eq('id', courseInstanceId)
          .single();

        if (courseError || !courseInstance) {
          throw new Error('Could not find course details');
        }

        // Create checkout session for waitlist participant
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-course-checkout', {
          body: {
            courseInstanceId,
            courseTitle: courseInstance.course_title,
            courseTableName,
            price: courseInstance.price,
            discountPrice: courseInstance.discount_price,
            buyerName: waitlistEntry.name,
            buyerEmail: waitlistEntry.email,
            buyerPhone: '', // Phone not required for waitlist
            buyerAddress: '',
            buyerPostalCode: '',
            buyerCity: '',
            buyerMessage: waitlistEntry.message || '',
            useDiscountPrice: false
          }
        });

        if (checkoutError || !checkoutData?.url) {
          throw new Error('Failed to create payment session');
        }

        // Open payment in new tab
        window.open(checkoutData.url, '_blank');

        // Remove from waitlist after payment session is created
        const { error: removeError } = await supabase.rpc('remove_from_waitlist', {
          course_instance_id_param: courseInstanceId,
          email_param: email
        });

        if (removeError) {
          console.error('Warning: Failed to remove from waitlist:', removeError);
        }

        return { success: true, requiresPayment: true };
      } else {
        // Free course - add directly to course
        const { error: addError } = await supabase.rpc('add_course_participant', {
          table_name: courseTableName,
          participant_name: waitlistEntry.name,
          participant_email: waitlistEntry.email,
          participant_phone: '', // Phone not required for waitlist
          participant_address: '',
          participant_postal_code: '',
          participant_city: '',
          participant_message: waitlistEntry.message || ''
        });

        if (addError) {
          throw new Error(`Failed to add to course: ${addError.message}`);
        }

        // Remove from waitlist
        const { error: removeError } = await supabase.rpc('remove_from_waitlist', {
          course_instance_id_param: courseInstanceId,
          email_param: email
        });

        if (removeError) {
          throw new Error(`Failed to remove from waitlist: ${removeError.message}`);
        }

        return { success: true, requiresPayment: false };
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-count'] });
      queryClient.invalidateQueries({ queryKey: ['course-participants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      
      if (data.requiresPayment) {
        toast.success('Betalningslänk öppnad! Personen läggs till kursen när betalningen är klar.');
      } else {
        toast.success('Person moved from waitlist to course successfully!');
      }
    },
    onError: (error: any) => {
      console.error('Error moving from waitlist:', error);
      toast.error(`Failed to move from waitlist: ${error.message}`);
    },
  });

  // Remove person from waitlist
  const removeFromWaitlistMutation = useMutation({
    mutationFn: async ({ courseInstanceId, email }: { courseInstanceId: string; email: string }) => {
      const { error } = await supabase.rpc('remove_from_waitlist', {
        course_instance_id_param: courseInstanceId,
        email_param: email
      });

      if (error) {
        throw new Error(`Failed to remove from waitlist: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-count'] });
      
      toast.success('Person removed from waitlist successfully!');
    },
    onError: (error: any) => {
      console.error('Error removing from waitlist:', error);
      toast.error(`Failed to remove from waitlist: ${error.message}`);
    },
  });

  return {
    waitlistEntries,
    waitlistCount,
    isLoadingWaitlist,
    isLoadingCount,
    waitlistError,
    moveFromWaitlist: moveFromWaitlistMutation.mutate,
    removeFromWaitlist: removeFromWaitlistMutation.mutate,
    isMoving: moveFromWaitlistMutation.isPending,
    isRemoving: removeFromWaitlistMutation.isPending,
  };
};
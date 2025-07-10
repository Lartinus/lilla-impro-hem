import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { InterestSignupWithSubmissions, InterestSubmission } from '@/types/interestSignupManagement';

export const useInterestSignupData = () => {
  const interestSignupsQuery = useQuery({
    queryKey: ['interest-signups'],
    queryFn: async (): Promise<InterestSignupWithSubmissions[]> => {
      const { data: signups, error } = await supabase
        .from('interest_signups')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get submission counts for each signup
      const signupsWithCounts = await Promise.all(
        (signups || []).map(async (signup) => {
          const { data: submissions, error: submissionsError } = await supabase
            .from('interest_signup_submissions')
            .select('id')
            .eq('interest_signup_id', signup.id);

          if (submissionsError) {
            console.warn(`Failed to get submission count for ${signup.title}:`, submissionsError);
          }

          return {
            ...signup,
            submissionCount: submissions?.length || 0
          };
        })
      );

      return signupsWithCounts;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    interestSignups: interestSignupsQuery.data,
    isLoading: interestSignupsQuery.isLoading
  };
};

export const fetchSubmissions = async (interestSignupId: string): Promise<InterestSubmission[]> => {
  const { data: submissions, error } = await supabase
    .from('interest_signup_submissions')
    .select('*')
    .eq('interest_signup_id', interestSignupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return submissions || [];
};
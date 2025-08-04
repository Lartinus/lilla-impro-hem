import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SentEmail {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  sender_email: string;
  subject: string;
  content?: string;
  html_content?: string;
  email_type: string;
  source_function: string;
  resend_id?: string;
  status: string;
  error_message?: string;
  sent_at: string;
  created_at: string;
}

export const useSentEmails = () => {
  return useQuery({
    queryKey: ['sent-emails'],
    queryFn: async () => {
      console.log('📧 Fetching sent emails...');
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .order('sent_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching sent emails:', error);
        throw error;
      }
      
      console.log('✅ Fetched sent emails:', data?.length || 0);
      return data as SentEmail[];
    },
  });
};

export const useDeleteSentEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emailId: string) => {
      console.log('🗑️ Deleting sent email:', emailId);
      const { error } = await supabase
        .from('sent_emails')
        .delete()
        .eq('id', emailId);
      
      if (error) {
        console.error('❌ Error deleting sent email:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
      toast.success('Email raderat');
    },
    onError: (error) => {
      console.error('❌ Failed to delete sent email:', error);
      toast.error('Kunde inte radera email');
    },
  });
};

export const useDeleteMultipleSentEmails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emailIds: string[]) => {
      console.log('🗑️ Deleting multiple sent emails:', emailIds.length);
      const { error } = await supabase
        .from('sent_emails')
        .delete()
        .in('id', emailIds);
      
      if (error) {
        console.error('❌ Error deleting multiple sent emails:', error);
        throw error;
      }
    },
    onSuccess: (_, emailIds) => {
      queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
      toast.success(`${emailIds.length} email raderade`);
    },
    onError: (error) => {
      console.error('❌ Failed to delete multiple sent emails:', error);
      toast.error('Kunde inte radera email');
    },
  });
};
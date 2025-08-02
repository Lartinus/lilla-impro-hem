import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TicketPurchase {
  id: string;
  show_title: string;
  show_date: string;
  show_location: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  regular_tickets: number;
  discount_tickets: number;
  total_amount: number;
  payment_status: string;
  ticket_code: string;
  created_at: string;
  refund_status: string;
  refund_date: string | null;
  refund_reason: string | null;
}

export const useTicketManagement = () => {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async (): Promise<TicketPurchase[]> => {
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const markRefundedMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('ticket_purchases')
        .update({
          refund_status: 'processed',
          refund_date: new Date().toISOString(),
          refund_reason: reason
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success('Biljett markerad som återbetald');
    },
    onError: (error) => {
      toast.error('Kunde inte markera biljett som återbetald');
      console.error('Error marking ticket as refunded:', error);
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ticket_purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success('Biljett raderad');
    },
    onError: (error) => {
      toast.error('Kunde inte radera biljett');
      console.error('Error deleting ticket:', error);
    },
  });

  return {
    tickets,
    isLoading,
    markRefunded: markRefundedMutation.mutate,
    deleteTicket: deleteTicketMutation.mutate,
    isMarkingRefunded: markRefundedMutation.isPending,
    isDeletingTicket: deleteTicketMutation.isPending,
  };
};
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

  const exportTicketsMutation = useMutation({
    mutationFn: async (showTitle: string) => {
      if (!tickets) return;
      
      const showTickets = tickets.filter(ticket => ticket.show_title === showTitle);
      
      const csvHeaders = ['Namn', 'E-post', 'Telefon', 'Antal biljetter', 'Biljettkod', 'Belopp', 'Datum'];
      const csvData = showTickets.map(ticket => [
        ticket.buyer_name,
        ticket.buyer_email,
        ticket.buyer_phone,
        (ticket.regular_tickets + ticket.discount_tickets).toString(),
        ticket.ticket_code,
        `${(ticket.total_amount / 100).toFixed(0)} kr`,
        new Date(ticket.created_at).toLocaleDateString('sv-SE')
      ]);
      
      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `biljetter-${showTitle.replace(/[^a-zA-Z0-9]/g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onSuccess: (_, showTitle) => {
      toast.success(`Biljettlista för "${showTitle}" exporterad`);
    },
    onError: (error) => {
      toast.error('Kunde inte exportera biljettlista');
      console.error('Error exporting tickets:', error);
    },
  });

  return {
    tickets,
    isLoading,
    markRefunded: markRefundedMutation.mutate,
    deleteTicket: deleteTicketMutation.mutate,
    exportTickets: exportTicketsMutation.mutate,
    isMarkingRefunded: markRefundedMutation.isPending,
    isDeletingTicket: deleteTicketMutation.isPending,
    isExporting: exportTicketsMutation.isPending,
  };
};
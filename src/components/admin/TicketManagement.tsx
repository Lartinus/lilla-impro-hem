import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Ticket } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
}

export const TicketManagement = () => {
  const isMobile = useIsMobile();
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async (): Promise<TicketPurchase[]> => {
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Biljetthantering</h2>
          <p className="text-muted-foreground">Läser in biljetter...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Betald</Badge>;
      case 'pending':
        return <Badge variant="secondary">Väntande</Badge>;
      case 'failed':
        return <Badge variant="destructive">Misslyckad</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Biljetthantering</h2>
        <p className="text-muted-foreground">
          Översikt över alla biljettköp och betalningar
        </p>
      </div>
      
      {!tickets || tickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga biljetter hittades</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Inga biljetter har köpts än.
          </p>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{ticket.show_title}</h4>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.show_date).toLocaleDateString('sv-SE')}
                  </div>
                  <div className="mt-1">
                    <div className="font-medium text-sm">{ticket.buyer_name}</div>
                    <div className="text-xs text-muted-foreground">{ticket.buyer_email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{ticket.total_amount} kr</div>
                  <div className="mt-1">{getStatusBadge(ticket.payment_status)}</div>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                {ticket.regular_tickets > 0 && (
                  <div className="text-sm">Ordinarie: {ticket.regular_tickets}</div>
                )}
                {ticket.discount_tickets > 0 && (
                  <div className="text-sm">Rabatt: {ticket.discount_tickets}</div>
                )}
                <div className="text-sm">
                  Kod: <code className="text-xs bg-muted px-2 py-1 rounded ml-1">
                    {ticket.ticket_code}
                  </code>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-1" />
                Visa detaljer
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Föreställning</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Köpare</TableHead>
              <TableHead>Biljetter</TableHead>
              <TableHead>Belopp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Biljettkod</TableHead>
              <TableHead>Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.show_title}</TableCell>
                <TableCell>
                  {new Date(ticket.show_date).toLocaleDateString('sv-SE')}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.buyer_name}</div>
                    <div className="text-sm text-muted-foreground">{ticket.buyer_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {ticket.regular_tickets > 0 && <div>Ordinarie: {ticket.regular_tickets}</div>}
                    {ticket.discount_tickets > 0 && <div>Rabatt: {ticket.discount_tickets}</div>}
                  </div>
                </TableCell>
                <TableCell>{ticket.total_amount} kr</TableCell>
                <TableCell>{getStatusBadge(ticket.payment_status)}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {ticket.ticket_code}
                  </code>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Detaljer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
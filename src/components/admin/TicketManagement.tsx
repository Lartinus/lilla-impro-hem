import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Ticket } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>Biljetthantering</CardTitle>
          <CardDescription>Läser in biljetter...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Biljetthantering</CardTitle>
        <CardDescription>
          Översikt över alla biljettköp och betalningar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga biljetter hittades</h3>
            <p className="text-muted-foreground">
              Inga biljetter har köpts än.
            </p>
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
      </CardContent>
    </Card>
  );
};
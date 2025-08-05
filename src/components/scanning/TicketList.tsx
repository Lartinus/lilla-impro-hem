import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Users, Search, Filter, Ticket, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface TicketPurchase {
  id: string;
  show_title: string;
  show_date: string;
  show_location: string;
  buyer_name: string;
  buyer_email: string;
  regular_tickets: number;
  discount_tickets: number;
  total_amount: number;
  scanned_status: boolean;
  scanned_at: string | null;
  payment_status: string;
}

export const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShow, setSelectedShow] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch all paid ticket purchases
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['ticket-purchases-for-scanning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TicketPurchase[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get unique shows for filter
  const shows = React.useMemo(() => {
    const uniqueShows = tickets.reduce((acc, ticket) => {
      const showKey = `${ticket.show_title}-${ticket.show_date}`;
      if (!acc.some(show => show.key === showKey)) {
        acc.push({
          key: showKey,
          title: ticket.show_title,
          date: ticket.show_date,
          display: `${ticket.show_title} (${format(new Date(ticket.show_date), 'd MMM', { locale: sv })})`
        });
      }
      return acc;
    }, [] as any[]);
    
    return uniqueShows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tickets]);

  // Filter tickets
  const filteredTickets = React.useMemo(() => {
    let filtered = tickets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.buyer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Show filter
    if (selectedShow !== 'all') {
      const [showTitle, showDate] = selectedShow.split('-');
      filtered = filtered.filter(ticket =>
        ticket.show_title === showTitle && ticket.show_date === showDate
      );
    }

    // Status filter
    if (statusFilter === 'scanned') {
      filtered = filtered.filter(ticket => ticket.scanned_status);
    } else if (statusFilter === 'not-scanned') {
      filtered = filtered.filter(ticket => !ticket.scanned_status);
    }

    return filtered;
  }, [tickets, searchTerm, selectedShow, statusFilter]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const scannedCount = filteredTickets.filter(t => t.scanned_status).length;
    const totalCount = filteredTickets.length;
    const totalTickets = filteredTickets.reduce((sum, t) => sum + t.regular_tickets + t.discount_tickets, 0);
    const scannedTickets = filteredTickets
      .filter(t => t.scanned_status)
      .reduce((sum, t) => sum + t.regular_tickets + t.discount_tickets, 0);

    return {
      scannedPurchases: scannedCount,
      totalPurchases: totalCount,
      scannedTickets,
      totalTickets,
      percentage: totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0
    };
  }, [filteredTickets]);

  // Toggle scan status mutation
  const toggleScanMutation = useMutation({
    mutationFn: async ({ ticketId, scanned }: { ticketId: string; scanned: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('update_ticket_scan_status', {
        ticket_id_param: ticketId,
        scanned_param: scanned,
        admin_user_id_param: user.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { scanned }) => {
      toast.success(scanned ? 'Biljett markerad som scannad' : 'Scanning återställd');
      queryClient.invalidateQueries({ queryKey: ['ticket-purchases-for-scanning'] });
    },
    onError: (error) => {
      console.error('Error updating scan status:', error);
      toast.error('Fel vid uppdatering av scanstatus');
    }
  });

  const handleToggleScan = (ticket: TicketPurchase) => {
    toggleScanMutation.mutate({
      ticketId: ticket.id,
      scanned: !ticket.scanned_status
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Inscanningsöversikt
          </h3>
          <Badge variant="outline">
            {stats.scannedPurchases}/{stats.totalPurchases}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Inscannade köp</span>
            <span className="font-medium">{stats.scannedPurchases} av {stats.totalPurchases}</span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Inscannade biljetter: {stats.scannedTickets}/{stats.totalTickets}</span>
            <span>{stats.percentage}%</span>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filter och sök
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök på namn eller e-post..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select value={selectedShow} onValueChange={setSelectedShow}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj föreställning" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla föreställningar</SelectItem>
                  {shows.map(show => (
                    <SelectItem key={show.key} value={show.key}>
                      {show.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="scanned">Inscannade</SelectItem>
                  <SelectItem value="not-scanned">Ej scannade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card className="p-6 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {tickets.length === 0 ? 'Inga biljetter hittades' : 'Inga biljetter matchar filtren'}
            </p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={ticket.scanned_status}
                  onCheckedChange={() => handleToggleScan(ticket)}
                  disabled={toggleScanMutation.isPending}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{ticket.buyer_name}</h4>
                    <Badge variant={ticket.scanned_status ? 'default' : 'secondary'} className="ml-2">
                      {ticket.scanned_status ? 'Scannad' : 'Väntande'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="truncate">{ticket.buyer_email}</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ticket.show_title}
                      </span>
                      <span>
                        {ticket.regular_tickets + ticket.discount_tickets} biljetter
                      </span>
                    </div>
                    {ticket.scanned_at && (
                      <p className="text-xs">
                        Scannad: {format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
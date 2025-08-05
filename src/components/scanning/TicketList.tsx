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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveTable, ResponsiveTableContent } from '@/components/ui/responsive-table';
import { Users, Search, Filter, Ticket, Calendar, AlertCircle } from 'lucide-react';
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
  scanned_tickets: number;
  partial_scan: boolean;
  payment_status: string;
}

export const TicketList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShow, setSelectedShow] = useState<string>('');
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
      const showKey = `${ticket.show_title}|||${ticket.show_date}`;
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
    // Don't filter if no show is selected
    if (!selectedShow) return [];
    
    let filtered = tickets;

    // Show filter - must have a show selected
    const [showTitle, showDate] = selectedShow.split('|||');
    filtered = filtered.filter(ticket =>
      ticket.show_title === showTitle && ticket.show_date === showDate
    );

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.buyer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'scanned') {
      filtered = filtered.filter(ticket => ticket.scanned_status);
    } else if (statusFilter === 'not-scanned') {
      filtered = filtered.filter(ticket => !ticket.scanned_status && !ticket.partial_scan);
    } else if (statusFilter === 'partial') {
      filtered = filtered.filter(ticket => ticket.partial_scan);
    }

    return filtered;
  }, [tickets, searchTerm, selectedShow, statusFilter]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const scannedCount = filteredTickets.filter(t => t.scanned_status).length;
    const totalCount = filteredTickets.length;
    const totalTickets = filteredTickets.reduce((sum, t) => sum + t.regular_tickets + t.discount_tickets, 0);
    const scannedTickets = filteredTickets
      .reduce((sum, t) => sum + (t.scanned_tickets || 0), 0);

    // Get selected show info
    const selectedShowInfo = selectedShow ? shows.find(show => show.key === selectedShow) : null;

    return {
      scannedPurchases: scannedCount,
      totalPurchases: totalCount,
      scannedTickets,
      totalTickets,
      percentage: totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0,
      selectedShow: selectedShowInfo
    };
  }, [filteredTickets, selectedShow, shows]);

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
    <div className="space-y-6">
      {/* Statistics - only show when a show is selected */}
      {selectedShow && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inscanningsöversikt - {stats.selectedShow?.title}
            </h3>
            <Badge variant="outline">
              {stats.scannedPurchases}/{stats.totalPurchases}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              {format(new Date(stats.selectedShow?.date || ''), 'd MMMM yyyy', { locale: sv })}
            </div>
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
      )}

      {/* Filters */}
      <Card className="p-6">
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
                  <SelectItem value="scanned">Alla här</SelectItem>
                  <SelectItem value="partial">Delvis här</SelectItem>
                  <SelectItem value="not-scanned">Ingen här</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Show selection prompt */}
      {!selectedShow && (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Välj en föreställning</h3>
          <p className="text-muted-foreground">
            Du måste först välja en föreställning för att se inscanningsöversikten och biljettlistan.
          </p>
        </Card>
      )}

      {/* Ticket List - Table view */}
      {selectedShow && (
        <Card className="p-6">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Inga biljetter matchar filtren för denna föreställning
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden md:block">
                <ResponsiveTable>
                  <ResponsiveTableContent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Namn</TableHead>
                        <TableHead>E-post</TableHead>
                        <TableHead className="text-center">Biljetter</TableHead>
                        <TableHead className="text-center">Inscannat</TableHead>
                        <TableHead>Senast uppdaterad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.buyer_name}</TableCell>
                          <TableCell className="text-muted-foreground">{ticket.buyer_email}</TableCell>
                          <TableCell className="text-center">
                            {ticket.regular_tickets + ticket.discount_tickets}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                ticket.scanned_status ? 'bg-green-500' : 
                                ticket.partial_scan ? 'bg-yellow-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-sm font-medium">
                                {ticket.scanned_tickets || 0}/{ticket.regular_tickets + ticket.discount_tickets}
                              </span>
                              <Badge variant={
                                ticket.scanned_status ? 'default' : 
                                ticket.partial_scan ? 'secondary' : 'outline'
                              }>
                                {ticket.scanned_status ? 'Alla' : 
                                 ticket.partial_scan ? 'Delvis' : 'Ingen'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ticket.scanned_at ? 
                              format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv }) : 
                              '-'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </ResponsiveTableContent>
                </ResponsiveTable>
              </div>

              {/* Mobile compact cards */}
              <div className="md:hidden space-y-3">
                {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{ticket.buyer_name}</h4>
                          <Badge variant={
                            ticket.scanned_status ? 'default' : 
                            ticket.partial_scan ? 'secondary' : 'outline'
                          } className="ml-2">
                            {ticket.scanned_status ? 'Alla här' : 
                             ticket.partial_scan ? 'Delvis här' : 'Ingen här'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="truncate">{ticket.buyer_email}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            ticket.scanned_status ? 'bg-green-500' : 
                            ticket.partial_scan ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} />
                          <span>{ticket.scanned_tickets || 0} av {ticket.regular_tickets + ticket.discount_tickets} personer</span>
                        </div>
                        {ticket.scanned_at && (
                          <span className="text-xs">
                            {format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Search, Filter, Ticket, Calendar, AlertCircle, Edit, Eye, Phone, Mail, MapPin, MessageSquare, Plus, Minus } from 'lucide-react';
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
  buyer_phone: string;
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
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [adjustingTicketId, setAdjustingTicketId] = useState<string | null>(null);
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

  // Partial scan adjustment mutation
  const adjustPartialScanMutation = useMutation({
    mutationFn: async ({ ticketId, scannedTickets }: { ticketId: string; scannedTickets: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('update_partial_ticket_scan', {
        ticket_id_param: ticketId,
        scanned_tickets_param: scannedTickets,
        admin_user_id_param: user.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Biljettantal uppdaterat');
      queryClient.invalidateQueries({ queryKey: ['ticket-purchases-for-scanning'] });
    },
    onError: (error) => {
      console.error('Error adjusting ticket count:', error);
      toast.error('Fel vid justering av biljettantal');
    }
  });

  const handleToggleScan = (ticket: TicketPurchase) => {
    toggleScanMutation.mutate({
      ticketId: ticket.id,
      scanned: !ticket.scanned_status
    });
  };

  const handleAdjustScannedTickets = (ticket: TicketPurchase, change: number) => {
    const currentScanned = ticket.scanned_tickets || 0;
    const totalTickets = ticket.regular_tickets + ticket.discount_tickets;
    const newScannedCount = Math.max(0, Math.min(totalTickets, currentScanned + change));
    
    if (newScannedCount !== currentScanned) {
      adjustPartialScanMutation.mutate({
        ticketId: ticket.id,
        scannedTickets: change
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedTicket = selectedTicketId ? filteredTickets.find(t => t.id === selectedTicketId) : null;

  return (
    <div className="space-y-6">
      {/* Show Selection Card */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Välj föreställning
          </div>
          
          <Select value={selectedShow} onValueChange={setSelectedShow}>
            <SelectTrigger>
              <SelectValue placeholder="Välj föreställning att scanna för" />
            </SelectTrigger>
            <SelectContent>
              {shows.map(show => (
                <SelectItem key={show.key} value={show.key}>
                  {show.display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Search and Filter */}
      {selectedShow && (
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Sök och filtrera
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
        </Card>
      )}

      {/* Compact Ticket List */}
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
            <div className="space-y-2">
              <div className="text-sm font-medium mb-3">
                {filteredTickets.length} biljetter
              </div>
              
              {filteredTickets.map((ticket) => (
                <Dialog key={ticket.id}>
                  <DialogTrigger asChild>
                    <div className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            ticket.scanned_status ? 'bg-green-500' : 
                            ticket.partial_scan ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{ticket.buyer_name}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-medium">
                            {ticket.scanned_tickets || 0}/{ticket.regular_tickets + ticket.discount_tickets}
                          </span>
                          <Badge variant={
                            ticket.scanned_status ? 'default' : 
                            ticket.partial_scan ? 'secondary' : 'outline'
                          } className="text-xs">
                            {ticket.scanned_status ? 'Alla' : 
                             ticket.partial_scan ? 'Delvis' : 'Ingen'}
                          </Badge>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        Biljettinformation
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{ticket.buyer_name}</div>
                            <div className="text-sm text-muted-foreground">{ticket.buyer_email}</div>
                          </div>
                        </div>
                        
                        {ticket.buyer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">{ticket.buyer_phone}</div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">{ticket.show_location}</div>
                        </div>
                      </div>

                      {/* Ticket Status */}
                      <div className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Inscanningsstatus</span>
                          <Badge variant={
                            ticket.scanned_status ? 'default' : 
                            ticket.partial_scan ? 'secondary' : 'outline'
                          }>
                            {ticket.scanned_status ? 'Alla här' : 
                             ticket.partial_scan ? 'Delvis här' : 'Ingen här'}
                          </Badge>
                        </div>
                        
                         <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                             <span>Antal biljetter:</span>
                             <span className="font-medium">{ticket.regular_tickets + ticket.discount_tickets}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                             <span>Inscannade:</span>
                             <div className="flex items-center gap-2">
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="h-6 w-6 p-0"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleAdjustScannedTickets(ticket, -1);
                                 }}
                                 disabled={adjustPartialScanMutation.isPending || (ticket.scanned_tickets || 0) <= 0}
                               >
                                 <Minus className="h-3 w-3" />
                               </Button>
                               <span className="font-medium w-8 text-center">{ticket.scanned_tickets || 0}</span>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="h-6 w-6 p-0"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleAdjustScannedTickets(ticket, 1);
                                 }}
                                 disabled={adjustPartialScanMutation.isPending || (ticket.scanned_tickets || 0) >= (ticket.regular_tickets + ticket.discount_tickets)}
                               >
                                 <Plus className="h-3 w-3" />
                               </Button>
                             </div>
                           </div>
                           {ticket.scanned_at && (
                             <div className="flex justify-between text-sm">
                               <span>Senast scannad:</span>
                               <span className="font-medium">
                                 {format(new Date(ticket.scanned_at), 'HH:mm dd/MM', { locale: sv })}
                               </span>
                             </div>
                           )}
                         </div>
                       </div>

                       {/* Ticket Adjustment Controls */}
                       {!ticket.scanned_status && (
                         <div className="border rounded-lg p-3 bg-blue-50/50">
                           <div className="text-sm font-medium mb-2">Justera antal inscannade</div>
                           <div className="flex items-center justify-center gap-3">
                             <Button
                               size="sm"
                               variant="outline"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleAdjustScannedTickets(ticket, -1);
                               }}
                               disabled={adjustPartialScanMutation.isPending || (ticket.scanned_tickets || 0) <= 0}
                             >
                               <Minus className="h-4 w-4 mr-1" />
                               -1 person
                             </Button>
                             <span className="text-sm font-medium">
                               {ticket.scanned_tickets || 0} av {ticket.regular_tickets + ticket.discount_tickets}
                             </span>
                             <Button
                               size="sm" 
                               variant="outline"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleAdjustScannedTickets(ticket, 1);
                               }}
                               disabled={adjustPartialScanMutation.isPending || (ticket.scanned_tickets || 0) >= (ticket.regular_tickets + ticket.discount_tickets)}
                             >
                               <Plus className="h-4 w-4 mr-1" />
                               +1 person
                             </Button>
                           </div>
                         </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleToggleScan(ticket)}
                          variant={ticket.scanned_status ? "destructive" : "default"}
                          size="sm"
                          className="flex-1"
                          disabled={toggleScanMutation.isPending}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {ticket.scanned_status ? 'Återställ scanning' : 'Markera som scannad'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
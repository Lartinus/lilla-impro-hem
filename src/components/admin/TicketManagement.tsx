import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, List, Grid, ArrowUpDown, RefreshCw, Trash2, Ticket, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTicketManagement } from '@/hooks/useTicketManagement';

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

type SortField = 'show_title' | 'buyer_name' | 'created_at' | 'total_amount';
type SortDirection = 'asc' | 'desc';

export const TicketManagement = () => {
  const isMobile = useIsMobile();
  const { tickets, isLoading, markRefunded, deleteTicket, exportTickets } = useTicketManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isListView, setIsListView] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Filter and sort tickets
  const filteredAndSortedTickets = useMemo(() => {
    if (!tickets) return [];
    
    // Filter by search term
    let filtered = tickets.filter(ticket => 
      ticket.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.show_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort tickets
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [tickets, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique show titles for export
  const uniqueShows = useMemo(() => {
    if (!tickets) return [];
    const showTitles = [...new Set(tickets.map(ticket => ticket.show_title))];
    return showTitles.map(title => ({
      title,
      count: tickets.filter(ticket => ticket.show_title === title).length
    }));
  }, [tickets]);

  const getTotalTickets = (ticket: TicketPurchase) => {
    return ticket.regular_tickets + ticket.discount_tickets;
  };

  const getRefundBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="secondary">Återbetald</Badge>;
      case 'requested':
        return <Badge variant="outline">Återbetalning begärd</Badge>;
      default:
        return null;
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Biljetthantering</h2>
          <p className="text-muted-foreground">
            Endast betalda biljetter visas här
          </p>
        </div>
        
        {/* Export dropdown */}
        {uniqueShows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Label className="text-sm font-medium">Exportera per föreställning:</Label>
            <div className="flex flex-wrap gap-2">
              {uniqueShows.map((show) => (
                <Button
                  key={show.title}
                  variant="outline"
                  size="sm"
                  onClick={() => exportTickets(show.title)}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  {show.title} ({show.count})
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sök på köpare eller föreställning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="list-view"
              checked={isListView}
              onCheckedChange={setIsListView}
            />
            <Label htmlFor="list-view" className="flex items-center gap-1">
              {isListView ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              {isListView ? 'Lista' : 'Tabell'}
            </Label>
          </div>
        </div>
      </div>
      
      {!tickets || filteredAndSortedTickets.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">
            {searchTerm ? 'Inga matchande biljetter' : 'Inga biljetter hittades'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchTerm ? 'Försök med andra söktermer.' : 'Inga betalda biljetter har köpts än.'}
          </p>
        </div>
      ) : isListView ? (
        /* List View */
        <div className="space-y-2">
          {filteredAndSortedTickets.map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{ticket.buyer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {getTotalTickets(ticket)} biljett{getTotalTickets(ticket) !== 1 ? 'er' : ''} • {ticket.show_title}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {ticket.ticket_code}
                  </code>
                  {getRefundBadge(ticket.refund_status)}
                  <div className="flex gap-1">
                    {ticket.refund_status === 'none' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Markera som återbetald</DialogTitle>
                            <DialogDescription>
                              Markera denna biljett som återbetald. Detta är endast för administrativt bruk.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Anledning till återbetalning (valfritt)"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                          />
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                markRefunded({ id: ticket.id, reason: refundReason });
                                setRefundReason('');
                              }}
                            >
                              Markera som återbetald
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Radera biljett</AlertDialogTitle>
                          <AlertDialogDescription>
                            Är du säker på att du vill radera denna biljett? Detta kan inte ångras.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTicket(ticket.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Radera
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isMobile ? (
        /* Mobile Cards */
        <div className="space-y-4">
          {filteredAndSortedTickets.map((ticket) => (
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
                  {getRefundBadge(ticket.refund_status)}
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="text-sm">
                  Totalt: {getTotalTickets(ticket)} biljett{getTotalTickets(ticket) !== 1 ? 'er' : ''}
                </div>
                <div className="text-sm">
                  Kod: <code className="text-xs bg-muted px-2 py-1 rounded ml-1">
                    {ticket.ticket_code}
                  </code>
                </div>
              </div>

              <div className="flex gap-2">
                {ticket.refund_status === 'none' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Återbetala
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Markera som återbetald</DialogTitle>
                        <DialogDescription>
                          Markera denna biljett som återbetald. Detta är endast för administrativt bruk.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Anledning till återbetalning (valfritt)"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            markRefunded({ id: ticket.id, reason: refundReason });
                            setRefundReason('');
                          }}
                        >
                          Markera som återbetald
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Radera biljett</AlertDialogTitle>
                      <AlertDialogDescription>
                        Är du säker på att du vill radera denna biljett? Detta kan inte ångras.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTicket(ticket.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Radera
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop Table */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('show_title')}
              >
                <div className="flex items-center gap-1">
                  Föreställning
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead>Datum</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('buyer_name')}
              >
                <div className="flex items-center gap-1">
                  Köpare
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead>Biljetter</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('total_amount')}
              >
                <div className="flex items-center gap-1">
                  Belopp
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Biljettkod</TableHead>
              <TableHead>Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTickets.map((ticket) => (
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
                  {getTotalTickets(ticket)} st
                </TableCell>
                <TableCell>{ticket.total_amount} kr</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="default">Betald</Badge>
                    {getRefundBadge(ticket.refund_status)}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {ticket.ticket_code}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {ticket.refund_status === 'none' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Markera som återbetald</DialogTitle>
                            <DialogDescription>
                              Markera denna biljett som återbetald. Detta är endast för administrativt bruk.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Anledning till återbetalning (valfritt)"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                          />
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                markRefunded({ id: ticket.id, reason: refundReason });
                                setRefundReason('');
                              }}
                            >
                              Markera som återbetald
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Radera biljett</AlertDialogTitle>
                          <AlertDialogDescription>
                            Är du säker på att du vill radera denna biljett? Detta kan inte ångras.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTicket(ticket.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Radera
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
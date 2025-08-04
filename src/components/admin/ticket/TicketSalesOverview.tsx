import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Trash2, RotateCcw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface TicketSale {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  regular_tickets: number;
  discount_tickets: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  refund_status: string;
  discount_code: string | null;
}

interface TicketSalesOverviewProps {
  showSlug: string;
  showTitle: string;
  maxTickets: number;
}

export const TicketSalesOverview = ({ showSlug, showTitle, maxTickets }: TicketSalesOverviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ticket sales for the show
  const { data: ticketSales, isLoading } = useQuery({
    queryKey: ['ticket-sales', showSlug],
    queryFn: async (): Promise<TicketSale[]> => {
      const { data, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('show_slug', showSlug)
        .in('payment_status', ['paid', 'refunded'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen,
  });

  // Function to delete a ticket sale
  const deleteTicketSale = async (ticketSaleId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_purchases')
        .delete()
        .eq('id', ticketSaleId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['ticket-sales', showSlug] });
      queryClient.invalidateQueries({ queryKey: ['admin-shows-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['available-tickets', showSlug] });
      toast.success('Biljettköpet har tagits bort');
    } catch (error) {
      console.error('Error deleting ticket sale:', error);
      toast.error('Kunde inte ta bort biljettköpet');
    }
  };

  // Function to mark as refunded
  const markAsRefunded = async (ticketSaleId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_purchases')
        .update({ 
          refund_status: 'processed',
          refund_date: new Date().toISOString() 
        })
        .eq('id', ticketSaleId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['ticket-sales', showSlug] });
      queryClient.invalidateQueries({ queryKey: ['admin-shows-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['available-tickets', showSlug] });
      toast.success('Biljettköpet har markerats som återbetalat');
    } catch (error) {
      console.error('Error marking as refunded:', error);
      toast.error('Kunde inte markera som återbetalat');
    }
  };

  // Function to export as CSV
  const exportToCSV = () => {
    if (!ticketSales || ticketSales.length === 0) {
      toast.error('Ingen data att exportera');
      return;
    }

    const headers = [
      'Köpare',
      'E-post',
      'Telefon',
      'Vanliga biljetter',
      'Rabattbiljetter',
      'Totalt antal biljetter',
      'Totalpris inkl. moms (SEK)',
      'Totalpris exkl. moms (SEK)',
      'Rabattkod',
      'Status',
      'Återbetalningsstatus',
      'Köpdatum'
    ];

    const csvData = ticketSales.map(sale => [
      sale.buyer_name,
      sale.buyer_email,
      sale.buyer_phone,
      sale.regular_tickets,
      sale.discount_tickets,
      sale.regular_tickets + sale.discount_tickets,
      (sale.total_amount / 100).toFixed(2),
      (sale.total_amount / 1.25 / 100).toFixed(2), // Assuming 25% VAT
      sale.discount_code || '',
      sale.payment_status === 'paid' ? 'Betald' : 'Återbetald',
      sale.refund_status === 'processed' ? 'Återbetald' : 'Ej återbetald',
      format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `biljettforsaljning_${showTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV-fil har exporterats');
  };

  const totalRevenue = ticketSales?.reduce((sum, sale) => 
    sale.payment_status === 'paid' && sale.refund_status !== 'processed' ? sum + sale.total_amount : sum, 0) || 0;
  const totalTickets = ticketSales?.reduce((sum, sale) => 
    sale.payment_status === 'paid' && sale.refund_status !== 'processed' ? sum + sale.regular_tickets + sale.discount_tickets : sum, 0) || 0;
  const totalPurchases = ticketSales?.filter(sale => sale.payment_status === 'paid' && sale.refund_status !== 'processed').length || 0;
  const revenueExcludingVAT = totalRevenue / 1.25; // Assuming 25% VAT

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
      >
        <Eye className="h-4 w-4 mr-2" />
        Visa försäljning
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-base lg:text-lg">Biljettförsäljning - {showTitle}</DialogTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                disabled={!ticketSales || ticketSales.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportera CSV
              </Button>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold">{totalTickets}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Sålda biljetter</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold">{(revenueExcludingVAT / 100).toFixed(2)} kr</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Total intäkt exklusive moms</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="text-xl lg:text-2xl font-bold">
                  {totalPurchases > 0 ? (totalRevenue / totalPurchases / 100).toFixed(2) : 0} kr
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">Genomsnittspris per köp</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">Laddar försäljningsdata...</div>
            ) : ticketSales && ticketSales.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Köpare</TableHead>
                      <TableHead className="min-w-[180px] hidden sm:table-cell">Kontakt</TableHead>
                      <TableHead className="min-w-[60px]">Antal</TableHead>
                      <TableHead className="min-w-[80px]">Pris</TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">Rabatt</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">Köpdatum</TableHead>
                      <TableHead className="min-w-[140px]">Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          <div className="text-sm">{sale.buyer_name}</div>
                          <div className="sm:hidden text-xs text-muted-foreground mt-1">
                            {sale.buyer_email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm">
                            <div>{sale.buyer_email}</div>
                            <div className="text-muted-foreground">{sale.buyer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div>{sale.regular_tickets + sale.discount_tickets}</div>
                            {sale.discount_tickets > 0 && (
                              <div className="text-xs text-muted-foreground">
                                ({sale.regular_tickets} + {sale.discount_tickets} rabatt)
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{(sale.total_amount / 100).toFixed(2)} kr</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {sale.discount_code ? (
                            <Badge variant="secondary" className="text-xs">
                              {sale.discount_code}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge 
                              variant={sale.payment_status === 'paid' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {sale.payment_status === 'paid' ? 'Betald' : 'Obetald'}
                            </Badge>
                            {sale.refund_status === 'processed' && (
                              <Badge variant="outline" className="text-xs">
                                Återbetald
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {format(new Date(sale.created_at), 'yyyy-MM-dd HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sale.payment_status === 'paid' && sale.refund_status !== 'processed' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Markera som återbetald</AlertDialogTitle>
                                     <AlertDialogDescription>
                                       Är du säker på att du vill markera detta biljettköp som återbetalt? 
                                       Detta kommer att lägga tillbaka {sale.regular_tickets + sale.discount_tickets} biljett(er) till tillgängliga biljetter.
                                     </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => markAsRefunded(sale.id)}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      Markera som återbetald
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ta bort biljettköp</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Är du säker på att du vill ta bort detta biljettköp permanent? 
                                    Detta kommer att lägga tillbaka {sale.regular_tickets + sale.discount_tickets} biljett(er) till tillgängliga biljetter.
                                    Denna åtgärd kan inte ångras.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteTicketSale(sale.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Ta bort
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
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Inga biljetter har sålts ännu
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
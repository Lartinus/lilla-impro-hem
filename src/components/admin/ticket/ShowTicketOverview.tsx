import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Ticket, Search } from 'lucide-react';
import { format } from 'date-fns';
import { TicketSalesOverview } from './TicketSalesOverview';

interface Show {
  id: string;
  title: string;
  slug: string;
  show_date: string;
  show_time: string;
  max_tickets: number;
  sold_tickets: number;
}

interface ShowTicketOverviewProps {
  showCompleted?: boolean;
}

export const ShowTicketOverview = ({ showCompleted = false }: ShowTicketOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Fetch shows with ticket sales data
  const { data: shows, isLoading } = useQuery({
    queryKey: ['admin-shows-tickets', showCompleted],
    queryFn: async (): Promise<Show[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      // First get all shows with max_tickets set, filtered by completion status
      let query = supabase
        .from('admin_shows')
        .select('id, title, slug, show_date, show_time, max_tickets')
        .not('max_tickets', 'is', null)
        .gt('max_tickets', 0);

      if (showCompleted) {
        query = query.lt('show_date', today);
      } else {
        query = query.gte('show_date', today);
      }

      const { data: showsData, error: showsError } = await query
        .order('show_date', { ascending: showCompleted ? false : true });

      if (showsError) throw showsError;

      // Then calculate sold tickets for each show
      const showsWithSales = await Promise.all(
        (showsData || []).map(async (show) => {
          const { data: tickets } = await supabase
            .from('ticket_purchases')
            .select('regular_tickets, discount_tickets')
            .eq('show_slug', show.slug)
            .eq('payment_status', 'paid');

          const soldTickets = tickets?.reduce(
            (sum, ticket) => sum + (ticket.regular_tickets || 0) + (ticket.discount_tickets || 0),
            0
          ) || 0;

          return {
            ...show,
            sold_tickets: soldTickets
          };
        })
      );

      return showsWithSales;
    },
  });

  // Filter shows based on search term
  const filteredShows = useMemo(() => {
    if (!shows || !searchTerm.trim()) return shows;
    return shows.filter(show => 
      show.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shows, searchTerm]);

  if (isLoading) {
    return <div>Laddar biljettöversikt...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {showCompleted ? 'Genomförda föreställningar' : 'Aktiva föreställningar'}
        </h2>
        <p className="text-muted-foreground">
          {showCompleted 
            ? 'Biljettförsäljning för genomförda föreställningar' 
            : 'Översikt över biljettförsäljning per föreställning'
          }
        </p>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök föreställning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent>
          {filteredShows && filteredShows.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Föreställning</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Biljetter sålda</TableHead>
                      <TableHead>Försäljningsgrad</TableHead>
                      <TableHead>Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShows.map((show) => {
                      const salesPercentage = show.max_tickets > 0 
                        ? ((show.sold_tickets || 0) / show.max_tickets * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <TableRow key={show.id}>
                          <TableCell className="font-medium">{show.title}</TableCell>
                          <TableCell>
                            {format(new Date(show.show_date), 'yyyy-MM-dd')} {show.show_time?.slice(0, 5)}
                          </TableCell>
                          <TableCell>
                            {show.sold_tickets || 0} / {show.max_tickets}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, parseFloat(salesPercentage))}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{salesPercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TicketSalesOverview 
                              showSlug={show.slug} 
                              showTitle={show.title}
                              maxTickets={show.max_tickets}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {filteredShows.map((show) => {
                  const salesPercentage = show.max_tickets > 0 
                    ? ((show.sold_tickets || 0) / show.max_tickets * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <Card key={show.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-sm">{show.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(show.show_date), 'yyyy-MM-dd')} {show.show_time?.slice(0, 5)}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Biljetter sålda</span>
                              <span className="text-sm font-medium">
                                {show.sold_tickets || 0} / {show.max_tickets}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Försäljningsgrad</span>
                                <span className="text-sm font-medium">{salesPercentage}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, parseFloat(salesPercentage))}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <TicketSalesOverview 
                              showSlug={show.slug} 
                              showTitle={show.title}
                              maxTickets={show.max_tickets}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm.trim() ? (
                `Inga föreställningar matchade sökningen "${searchTerm}"`
              ) : (
                showCompleted 
                  ? 'Inga genomförda föreställningar med intern biljettförsäljning hittades'
                  : 'Inga aktiva föreställningar med intern biljettförsäljning hittades'
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
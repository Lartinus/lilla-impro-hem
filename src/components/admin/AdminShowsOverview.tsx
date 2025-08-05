import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Show {
  id: string;
  title: string;
  show_date: string;
  show_time: string;
  venue: string;
  max_tickets: number;
  sold_tickets: number;
}

export const AdminShowsOverview = () => {
  const { data: shows, isLoading } = useQuery({
    queryKey: ['admin-shows-overview'],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    queryFn: async (): Promise<Show[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get upcoming shows
      const { data: showsData, error: showsError } = await supabase
        .from('admin_shows')
        .select('id, title, slug, show_date, show_time, venue, max_tickets')
        .gte('show_date', today)
        .eq('is_active', true)
        .not('max_tickets', 'is', null)
        .gt('max_tickets', 0)
        .order('show_date', { ascending: true })
        .limit(3);

      if (showsError) throw showsError;

      // Calculate sold tickets for each show
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="w-4 h-4" />
            Föreställningar
          </CardTitle>
          <CardDescription>Nästkommande föreställningar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shows || shows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="w-4 h-4" />
            Föreställningar
          </CardTitle>
          <CardDescription>Nästkommande föreställningar</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Inga kommande föreställningar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ticket className="w-4 h-4" />
          Föreställningar
        </CardTitle>
        <CardDescription>Nästkommande föreställningar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shows.map((show) => {
            const salesPercentage = Math.round((show.sold_tickets / show.max_tickets) * 100);
            
            return (
              <div key={show.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{show.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(show.show_date), 'dd MMM', { locale: sv })} {show.show_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {show.venue}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">{show.sold_tickets}/{show.max_tickets}</div>
                    <div className="text-muted-foreground">{salesPercentage}%</div>
                  </div>
                </div>
                <Progress value={salesPercentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
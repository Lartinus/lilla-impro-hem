import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Ticket, GraduationCap, TrendingUp } from 'lucide-react';

interface EconomyData {
  ticketRevenue: number;
  courseRevenue: number;
  totalRevenue: number;
}

export const AdminEconomyOverview = () => {
  const { data: economyData, isLoading } = useQuery({
    queryKey: ['admin-economy-overview'],
    queryFn: async (): Promise<EconomyData> => {
      // Fetch paid ticket purchases
      const { data: ticketPurchases, error: ticketError } = await supabase
        .from('ticket_purchases')
        .select('total_amount')
        .eq('payment_status', 'paid');

      if (ticketError) throw ticketError;

      // Fetch paid course purchases
      const { data: coursePurchases, error: courseError } = await supabase
        .from('course_purchases')
        .select('total_amount')
        .eq('payment_status', 'paid');

      if (courseError) throw courseError;

      // Calculate ticket revenue excluding 6% VAT
      const ticketRevenueWithVAT = (ticketPurchases || []).reduce(
        (sum, purchase) => sum + (purchase.total_amount || 0),
        0
      );
      const ticketRevenue = Math.round(ticketRevenueWithVAT / 1.06); // Remove 6% VAT

      // Calculate course revenue excluding 25% VAT
      const courseRevenueWithVAT = (coursePurchases || []).reduce(
        (sum, purchase) => sum + (purchase.total_amount || 0),
        0
      );
      const courseRevenue = Math.round(courseRevenueWithVAT / 1.25); // Remove 25% VAT

      const totalRevenue = ticketRevenue + courseRevenue;

      return {
        ticketRevenue,
        courseRevenue,
        totalRevenue
      };
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Convert from öre to kronor
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4" />
            Ekonomi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!economyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4" />
            Ekonomi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Kunde inte hämta ekonomidata</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="w-4 h-4" />
          Ekonomi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Ticket Revenue */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Ticket className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Föreställningar</h4>
                <p className="text-xs text-muted-foreground">Biljettintäkter (exkl. 6% moms)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">
                {formatCurrency(economyData.ticketRevenue)}
              </div>
            </div>
          </div>

          {/* Course Revenue */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Kurser</h4>
                <p className="text-xs text-muted-foreground">Intäkter från kursbokningar (exkl. 25% moms)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">
                {formatCurrency(economyData.courseRevenue)}
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-md">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Total inkomst</h4>
                <p className="text-xs text-muted-foreground">Samtliga intäkter exkl. moms</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-primary">
                {formatCurrency(economyData.totalRevenue)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
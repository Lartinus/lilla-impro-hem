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
      // Calculate date 12 months ago
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const twelveMonthsAgoISO = twelveMonthsAgo.toISOString();

      // Fetch paid ticket purchases from last 12 months, excluding refunds
      const { data: ticketPurchases, error: ticketError } = await supabase
        .from('ticket_purchases')
        .select('total_amount, refund_status')
        .eq('payment_status', 'paid')
        .gte('created_at', twelveMonthsAgoISO)
        .neq('refund_status', 'refunded');

      if (ticketError) throw ticketError;

      // Fetch paid course purchases from last 12 months
      const { data: coursePurchases, error: courseError } = await supabase
        .from('course_purchases')
        .select('total_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', twelveMonthsAgoISO);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ticket Revenue */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Föreställningar</span>
            </div>
            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi">
              {formatCurrency(economyData.ticketRevenue)}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Biljettintäkter (exkl. 6% moms)</p>
          </div>

          {/* Course Revenue */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Kurser</span>
            </div>
            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi">
              {formatCurrency(economyData.courseRevenue)}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Kursintäkter (exkl. 25% moms)</p>
          </div>

          {/* Total Revenue */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total inkomst</span>
            </div>
            <div className="text-xl md:text-2xl font-bold mb-1 font-satoshi text-primary">
              {formatCurrency(economyData.totalRevenue)}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Samtliga intäkter exkl. moms</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
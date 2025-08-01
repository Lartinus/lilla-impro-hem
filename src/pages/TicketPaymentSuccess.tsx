import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Calendar, Ticket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface TicketDetails {
  showTitle: string;
  showDate: string;
  showLocation: string;
  buyerName: string;
  totalTickets: number;
  ticketCode: string;
}

const TicketPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const { data: purchase, error } = await supabase
          .from('ticket_purchases')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .eq('payment_status', 'paid')
          .single();

        if (error || !purchase) {
          console.error('Error fetching ticket details:', error);
          setLoading(false);
          return;
        }

        setTicketDetails({
          showTitle: purchase.show_title,
          showDate: purchase.show_date,
          showLocation: purchase.show_location,
          buyerName: purchase.buyer_name,
          totalTickets: purchase.regular_tickets + purchase.discount_tickets,
          ticketCode: purchase.ticket_code,
        });
      } catch (error) {
        console.error('Error fetching ticket details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [sessionId]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EBEBEB' }}>
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-success/20 backdrop-blur-sm" style={{ backgroundColor: '#F3F3F3' }}>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <h1 className="text-3xl text-foreground mb-2">
                  Tack för ditt biljettköp!
                </h1>
                <p className="text-muted-foreground">
                  Din betalning har genomförts och dina biljetter är reserverade.
                </p>
              </div>

              <div className="bg-success/5 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-foreground mb-4">
                  Nästa steg
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Du kommer att få dina biljetter via email inom kort</li>
                  <li>Kom gärna 15 minuter innan föreställningen börjar</li>
                  <li>Hör av dig till oss om du har några frågor</li>
                </ul>
              </div>

              {loading ? (
                <div className="bg-background/50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-muted-foreground">Laddar biljettinformation...</p>
                </div>
              ) : ticketDetails ? (
                <div className="bg-background/50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-foreground mb-3">Biljettdetaljer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ticket className="w-3 h-3" />
                      <span>{ticketDetails.totalTickets} biljetter till {ticketDetails.showTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Föreställning: {ticketDetails.showDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Beställningsdatum: {new Date().toLocaleDateString('sv-SE')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-background/50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-foreground mb-3">Biljettdetaljer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ticket className="w-3 h-3" />
                      <span>Biljetter bokade</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Beställningsdatum: {new Date().toLocaleDateString('sv-SE')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/shows">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tillbaka till föreställningar
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Hem</Link>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Har du frågor? Kontakta oss på{' '}
                  <a href="mailto:kontakt@improteatern.se" className="text-primary hover:underline">
                    kontakt@improteatern.se
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TicketPaymentSuccess;
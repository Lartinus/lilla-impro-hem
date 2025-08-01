
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface StripeCheckoutProps {
  showSlug: string;
  showTitle: string;
  showDate: string;
  showLocation: string;
  regularTickets: number;
  discountTickets: number;
  discountCode: string;
  ticketPrice: number;
  discountPrice: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  onBack: () => void;
}

const StripeCheckout = ({
  showSlug,
  showTitle,
  showDate,
  showLocation,
  regularTickets,
  discountTickets,
  discountCode,
  ticketPrice,
  discountPrice,
  buyerName,
  buyerEmail,
  buyerPhone,
  onBack
}: StripeCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          showSlug,
          showTitle,
          showDate,
          showLocation,
          regularTickets,
          discountTickets,
          discountCode,
          ticketPrice,
          discountPrice,
          buyerName,
          buyerEmail,
          buyerPhone
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Ett fel uppstod vid betalning. Försök igen.');
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = (window as any).Stripe('pk_test_51RqtrcH7tQohrnzpqLDJ7ZJC2a6OPKZwUHGzNNqBrTJkPuSbF6CjYGCkOsC97IVG7NzIuMhb4vq9OpIIADdwgLzE00bsWQDUF3');
      if (!stripe) {
        throw new Error('Stripe kunde inte laddas');
      }
      await stripe.redirectToCheckout({ sessionId: data.sessionId });

    } catch (error) {
      console.error('Payment error:', error);
      alert('Ett fel uppstod vid betalning. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Bekräfta betalning</h3>
        <p className="text-sm text-gray-600">
          Du kommer att omdirigeras till Stripe för säker betalning.
        </p>
      </div>
      
      <div className="flex space-x-4">
        <Button 
          onClick={onBack}
          variant="outline"
          className="rounded-none"
          disabled={isLoading}
        >
          Tillbaka
        </Button>
        <Button 
          onClick={handlePayment}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
          disabled={isLoading}
        >
          {isLoading ? 'Bearbetar...' : 'Betala med Stripe →'}
        </Button>
      </div>
    </div>
  );
};

export default StripeCheckout;

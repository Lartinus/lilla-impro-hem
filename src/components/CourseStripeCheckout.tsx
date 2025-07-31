import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface CourseStripeCheckoutProps {
  courseInstanceId: string;
  courseTitle: string;
  courseTableName: string;
  price: number;
  discountPrice: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress?: string;
  buyerPostalCode?: string;
  buyerCity?: string;
  buyerMessage?: string;
  useDiscountPrice: boolean;
  onBack: () => void;
}

const CourseStripeCheckout = ({
  courseInstanceId,
  courseTitle,
  courseTableName,
  price,
  discountPrice,
  buyerName,
  buyerEmail,
  buyerPhone,
  buyerAddress,
  buyerPostalCode,
  buyerCity,
  buyerMessage,
  useDiscountPrice,
  onBack
}: CourseStripeCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const totalAmount = useDiscountPrice ? discountPrice : price;
  const priceType = useDiscountPrice ? "Studentpris" : "Ordinarie pris";

  const handlePayment = async () => {
    setIsLoading(true);
    console.log('=== FRONTEND PAYMENT START ===');
    
    const requestBody = {
      courseInstanceId,
      courseTitle,
      courseTableName,
      price,
      discountPrice,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      buyerPostalCode,
      buyerCity,
      buyerMessage,
      useDiscountPrice
    };
    
    console.log('Sending request body:', requestBody);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-course-checkout', {
        body: requestBody
      });

      console.log('Response from edge function:', { data, error });
      
      if (error) {
        console.error('=== EDGE FUNCTION ERROR ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        alert(`Fel vid betalning: ${error.message || 'Okänt fel'}`);
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe URL:', data.url);
        window.location.href = data.url;
      } else {
        console.error('=== NO URL IN RESPONSE ===');
        console.error('Full response data:', data);
        alert('Ingen betalnings-URL mottogs från servern. Försök igen.');
      }

    } catch (error) {
      console.error('=== FRONTEND PAYMENT ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);
      alert(`Fel vid betalning: ${error.message || 'Okänt fel'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Bekräfta betalning</h3>
        <div className="bg-gray-50 p-4 rounded border space-y-2">
          <div><strong>Kurs:</strong> {courseTitle}</div>
          <div><strong>Namn:</strong> {buyerName}</div>
          <div><strong>E-post:</strong> {buyerEmail}</div>
          <div><strong>Telefon:</strong> {buyerPhone}</div>
          <div><strong>Pris:</strong> {totalAmount} kr ({priceType})</div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
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

export default CourseStripeCheckout;
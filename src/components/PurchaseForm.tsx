import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseFormProps {
  ticketCount: number;
  discountTickets: number;
  discountCode: string;
  discountValidation?: { valid: boolean; discountAmount: number; error?: string };
  showTitle: string;
  showSlug: string;
  showDate: string;
  showLocation: string;
  ticketPrice: number;
  discountPrice: number;
  onBack: () => void;
  onComplete: (data: { name: string; email: string; phone: string }) => void;
}

const PurchaseForm = ({ 
  ticketCount, 
  discountTickets, 
  discountCode,
  discountValidation: preValidatedDiscount,
  showTitle,
  showSlug,
  showDate,
  showLocation,
  ticketPrice,
  discountPrice,
  onBack, 
  onComplete 
}: PurchaseFormProps) => {
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    phone: '',
    email: ''
  });

  const [touched, setTouched] = useState({
    phone: false,
    email: false
  });

  // Calculate total with show prices
  const regularTotal = ticketCount * ticketPrice;
  const discountTotal = discountTickets * discountPrice;
  const baseTotal = regularTotal + discountTotal;
  
  // Use pre-validated discount data or default values
  const discountValidation = preValidatedDiscount || { valid: false, discountAmount: 0 };

  // Calculate final total with discount
  let finalTotal = baseTotal;
  let discountAmount = 0;
  
  if (discountValidation.valid) {
    discountAmount = discountValidation.discountAmount;
    finalTotal = baseTotal - discountAmount;
  }

  // Calculate VAT (moms) using correct formula: [totalpris] - ([totalpris]/1,06)
  const vatAmount = finalTotal - (finalTotal / 1.06);

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 0) return '';
    if (digitsOnly.length !== 10) {
      return `Telefonnummer måste vara exakt 10 siffror (du har skrivit ${digitsOnly.length})`;
    }
    return '';
  };

  const validateEmail = (email: string) => {
    if (email.length === 0) return '';
    if (!email.includes('@')) {
      return 'E-post måste innehålla @';
    }
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPurchaseData({...purchaseData, phone: value});
    // Update error state but don't show until touched
    setErrors({...errors, phone: validatePhone(value)});
  };

  const handlePhoneBlur = () => {
    setTouched({...touched, phone: true});
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPurchaseData({...purchaseData, email: value});
    // Update error state but don't show until touched
    setErrors({...errors, email: validateEmail(value)});
  };

  const handleEmailBlur = () => {
    setTouched({...touched, email: true});
  };

  const isFormValid = () => {
    const phoneError = validatePhone(purchaseData.phone);
    const emailError = validateEmail(purchaseData.email);
    
    return purchaseData.name && 
           purchaseData.email && 
           purchaseData.phone && 
           !phoneError && 
           !emailError;
  };

  const handleCompletePurchase = async () => {
    // Final validation before submission
    const phoneError = validatePhone(purchaseData.phone);
    const emailError = validateEmail(purchaseData.email);
    
    if (phoneError || emailError) {
      setErrors({
        phone: phoneError,
        email: emailError
      });
      setTouched({
        phone: true,
        email: true
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          showSlug,
          showTitle,
          showDate,
          showLocation,
          regularTickets: ticketCount,
          discountTickets: discountTickets,
          discountCode,
          ticketPrice,
          discountPrice,
          buyerName: purchaseData.name,
          buyerEmail: purchaseData.email,
          buyerPhone: purchaseData.phone
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        alert('Ett fel uppstod vid betalning. Försök igen.');
        return;
      }

      // For free tickets, redirect directly to success page, otherwise to Stripe
      if (!data?.url) {
        throw new Error('Ingen checkout-URL mottogs');
      }
      window.location.href = data.url;

    } catch (error) {
      console.error('Payment error:', error);
      alert('Ett fel uppstod vid betalning. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if this is a free show
  const isFreeShow = finalTotal === 0;

  return (
    <div className="mb-6">
      <h2 className="mb-4">Sammanfattning</h2>
      
      {/* Order Summary */}
      <div className="mb-6">
        {ticketCount > 0 && (
          <p>
            Ordinarie biljetter: {ticketCount} × {ticketPrice}kr = {regularTotal}kr
          </p>
        )}
        {discountTickets > 0 && (
          <p>
            Rabatterade biljetter: {discountTickets} × {discountPrice}kr = {discountTotal}kr
          </p>
        )}
        {discountValidation.valid && discountAmount > 0 && (
          <p className="text-green-600">
            Rabatt ({discountCode}): -{discountAmount.toFixed(2).replace(/\.?0+$/, '')}kr
          </p>
        )}
        {discountValidation.error && (
          <p className="text-red-600 text-sm">
            {discountValidation.error}
          </p>
        )}
        <p className="font-bold text-base mt-2">
          Totalt: {finalTotal}kr
        </p>
        <p className="text-xs">
          Varav {vatAmount.toFixed(2)}kr moms
        </p>
      </div>
      
      <div className="space-y-4 mb-6 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
          <Input
            value={purchaseData.name}
            onChange={(e) => setPurchaseData({...purchaseData, name: e.target.value})}
            className="rounded-none text-gray-900"
            placeholder="Ditt namn"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-post (hit skickas biljetterna)</label>
          <Input
            type="email"
            value={purchaseData.email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className="rounded-none text-gray-900"
            placeholder="din@email.se"
          />
          {touched.email && errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
          <Input
            type="tel"
            value={purchaseData.phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            className="rounded-none text-gray-900"
            placeholder="070-123 45 67"
          />
          {touched.phone && errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button 
          onClick={onBack}
          variant="outline"
          className="rounded-none border-gray-400 text-gray-700 hover:bg-gray-50"
        >
          Tillbaka
        </Button>
        <Button 
          onClick={handleCompletePurchase}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Bearbetar...' : (isFreeShow ? 'Boka biljetterna' : 'Betala med Stripe →')}
        </Button>
      </div>
    </div>
  );
};

export default PurchaseForm;

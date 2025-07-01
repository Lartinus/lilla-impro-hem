import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PurchaseFormProps {
  ticketCount: number;
  discountTickets: number;
  discountCode: string;
  showTitle: string;
  ticketPrice: number;  // Add this prop
  discountPrice: number;  // Add this prop
  onBack: () => void;
  onComplete: (data: { name: string; email: string; phone: string }) => void;
}

const PurchaseForm = ({ 
  ticketCount, 
  discountTickets, 
  discountCode, 
  showTitle, 
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

  const [errors, setErrors] = useState({
    phone: '',
    email: ''
  });

  const [touched, setTouched] = useState({
    phone: false,
    email: false
  });

  // Calculate total with prices from Strapi
  const regularTotal = ticketCount * ticketPrice;
  const discountTotal = discountTickets * discountPrice;
  let finalTotal = regularTotal + discountTotal;
  
  // Apply discount code logic if needed (example: 10% off with "RABATT10")
  let discountAmount = 0;
  if (discountCode.toLowerCase() === 'rabatt10') {
    discountAmount = Math.round(finalTotal * 0.1);
    finalTotal = finalTotal - discountAmount;
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

  const handleCompletePurchase = () => {
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

    console.log('Purchase data:', {
      ...purchaseData,
      regularTickets: ticketCount,
      discountTickets: discountTickets,
      discountCode: discountCode,
      show: showTitle
    });
    alert('Köp genomfört! (Stripe-integration kommer här)');
    onComplete(purchaseData);
  };

  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-4">Slutför köp</h4>
      
      {/* Order Summary */}
      <div className="mb-6">
        <h5 className="font-medium text-gray-800 mb-2">Sammanfattning</h5>
        {ticketCount > 0 && (
          <div className="text-gray-700">
            Ordinarie biljetter: {ticketCount} × {ticketPrice}kr = {regularTotal}kr
          </div>
        )}
        {discountTickets > 0 && (
          <div className="text-gray-700">
            Rabatterade biljetter: {discountTickets} × {discountPrice}kr = {discountTotal}kr
          </div>
        )}
        {discountAmount > 0 && (
          <div className="text-green-600">
            Rabatt ({discountCode}): -{discountAmount}kr
          </div>
        )}
        <div className="font-bold text-gray-800 text-lg mt-2">
          Totalt: {finalTotal}kr
        </div>
        <div className="text-gray-600 text-sm mt-1">
          Varav {vatAmount.toFixed(2)}kr moms
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
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
          disabled={!isFormValid()}
        >
          Betala med Stripe →
        </Button>
      </div>
    </div>
  );
};

export default PurchaseForm;

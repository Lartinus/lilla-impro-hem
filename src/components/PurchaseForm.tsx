
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PurchaseFormProps {
  ticketCount: number;
  discountTickets: number;
  discountCode: string;
  showTitle: string;
  onBack: () => void;
  onComplete: (data: { name: string; email: string; phone: string }) => void;
}

const PurchaseForm = ({ ticketCount, discountTickets, discountCode, showTitle, onBack, onComplete }: PurchaseFormProps) => {
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Calculate total with potential discount
  const regularTotal = ticketCount * 175;
  const discountTotal = discountTickets * 145;
  let finalTotal = regularTotal + discountTotal;
  
  // Apply discount code logic if needed (example: 10% off with "RABATT10")
  let discountAmount = 0;
  if (discountCode.toLowerCase() === 'rabatt10') {
    discountAmount = Math.round(finalTotal * 0.1);
    finalTotal = finalTotal - discountAmount;
  }

  // Calculate VAT (moms) using correct formula: [totalpris] - ([totalpris]/1,06)
  const vatAmount = finalTotal - (finalTotal / 1.06);

  const handleCompletePurchase = () => {
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
            Ordinarie biljetter: {ticketCount} × 175kr = {regularTotal}kr
          </div>
        )}
        {discountTickets > 0 && (
          <div className="text-gray-700">
            Rabatterade biljetter: {discountTickets} × 145kr = {discountTotal}kr
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
            onChange={(e) => setPurchaseData({...purchaseData, email: e.target.value})}
            className="rounded-none text-gray-900"
            placeholder="din@email.se"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
          <Input
            type="tel"
            value={purchaseData.phone}
            onChange={(e) => setPurchaseData({...purchaseData, phone: e.target.value})}
            className="rounded-none text-gray-900"
            placeholder="070-123 45 67"
          />
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
          disabled={!purchaseData.name || !purchaseData.email || !purchaseData.phone}
        >
          Betala med Stripe →
        </Button>
      </div>
    </div>
  );
};

export default PurchaseForm;

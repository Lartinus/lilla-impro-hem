
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PurchaseFormProps {
  ticketCount: number;
  discountTickets: number;
  showTitle: string;
  onBack: () => void;
  onComplete: (data: { name: string; email: string; phone: string }) => void;
}

const PurchaseForm = ({ ticketCount, discountTickets, showTitle, onBack, onComplete }: PurchaseFormProps) => {
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleCompletePurchase = () => {
    console.log('Purchase data:', {
      ...purchaseData,
      regularTickets: ticketCount,
      discountTickets: discountTickets,
      show: showTitle
    });
    alert('Köp genomfört! (Stripe-integration kommer här)');
    onComplete(purchaseData);
  };

  return (
    <div className="mb-6">
      <h4 className="text-gray-800 font-bold mb-4">Slutför köp</h4>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
          <Input
            value={purchaseData.name}
            onChange={(e) => setPurchaseData({...purchaseData, name: e.target.value})}
            className="rounded-none"
            placeholder="Ditt namn"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
          <Input
            type="email"
            value={purchaseData.email}
            onChange={(e) => setPurchaseData({...purchaseData, email: e.target.value})}
            className="rounded-none"
            placeholder="din@email.se"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer</label>
          <Input
            type="tel"
            value={purchaseData.phone}
            onChange={(e) => setPurchaseData({...purchaseData, phone: e.target.value})}
            className="rounded-none"
            placeholder="070-123 45 67"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-none mb-4 border border-gray-300">
        <h5 className="font-medium mb-2">Sammanfattning</h5>
        {ticketCount > 0 && <p>Ordinarie biljetter: {ticketCount} × 175kr = {ticketCount * 175}kr</p>}
        {discountTickets > 0 && <p>Rabatterade biljetter: {discountTickets} × 145kr = {discountTickets * 145}kr</p>}
        <p className="font-bold">Totalt: {(ticketCount * 175) + (discountTickets * 145)}kr</p>
      </div>

      <div className="flex space-x-4">
        <Button 
          onClick={onBack}
          variant="outline"
          className="rounded-none"
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


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAvailableTickets } from '@/hooks/useTicketSync';
import TicketPurchase from './TicketPurchase';
import PurchaseForm from './PurchaseForm';
import StripeCheckout from './StripeCheckout';

interface TicketPurchaseCompleteProps {
  onPurchase: (data: { regularTickets: number; discountTickets: number; discountCode: string }) => void;
  ticketPrice?: number;
  discountPrice?: number;
  totalTickets?: number;
  showSlug: string;
  showTitle: string;
  showDate: string;
  showLocation: string;
}

const TicketPurchaseComplete = ({ 
  onPurchase, 
  ticketPrice = 175, 
  discountPrice = 145, 
  totalTickets = 100,
  showSlug,
  showTitle,
  showDate,
  showLocation
}: TicketPurchaseCompleteProps) => {
  const [currentStep, setCurrentStep] = useState<'purchase' | 'form' | 'checkout'>('purchase');
  const [ticketData, setTicketData] = useState({
    regularTickets: 0,
    discountTickets: 0,
    discountCode: ''
  });
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const { data: availableTickets = totalTickets } = useAvailableTickets(showSlug, totalTickets);

  const handleTicketPurchase = (data: { regularTickets: number; discountTickets: number; discountCode: string }) => {
    setTicketData(data);
    setCurrentStep('form');
  };

  const handleFormComplete = (formData: { name: string; email: string; phone: string }) => {
    setPurchaseData(formData);
    setCurrentStep('checkout');
  };

  const handleBackToTickets = () => {
    setCurrentStep('purchase');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  if (currentStep === 'checkout') {
    return (
      <StripeCheckout
        showSlug={showSlug}
        showTitle={showTitle}
        showDate={showDate}
        showLocation={showLocation}
        regularTickets={ticketData.regularTickets}
        discountTickets={ticketData.discountTickets}
        discountCode={ticketData.discountCode}
        ticketPrice={ticketPrice}
        discountPrice={discountPrice}
        buyerName={purchaseData.name}
        buyerEmail={purchaseData.email}
        buyerPhone={purchaseData.phone}
        onBack={handleBackToForm}
      />
    );
  }

  if (currentStep === 'form') {
    return (
      <PurchaseForm
        ticketCount={ticketData.regularTickets}
        discountTickets={ticketData.discountTickets}
        discountCode={ticketData.discountCode}
        showTitle={showTitle}
        ticketPrice={ticketPrice}
        discountPrice={discountPrice}
        onBack={handleBackToTickets}
        onComplete={handleFormComplete}
      />
    );
  }

  return (
    <TicketPurchase
      onPurchase={handleTicketPurchase}
      ticketPrice={ticketPrice}
      discountPrice={discountPrice}
      availableTickets={availableTickets}
    />
  );
};

export default TicketPurchaseComplete;

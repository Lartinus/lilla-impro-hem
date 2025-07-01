
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAvailableTickets } from '@/hooks/useTicketSync';
import { useTicketBooking } from '@/hooks/useTicketBooking';
import TicketPurchase from './TicketPurchase';
import PurchaseForm from './PurchaseForm';
import StripeCheckout from './StripeCheckout';
import TicketCountdown from './TicketCountdown';

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
  const { booking, timeLeft, createBooking, clearBooking, hasActiveBooking } = useTicketBooking();

  const handleTicketPurchase = async (data: { regularTickets: number; discountTickets: number; discountCode: string }) => {
    try {
      // Create booking for the selected tickets
      await createBooking(showSlug, data.regularTickets, data.discountTickets);
      
      setTicketData(data);
      setCurrentStep('form');
    } catch (error) {
      console.error('Failed to book tickets:', error);
      alert('Kunde inte reservera biljetterna. Försök igen.');
    }
  };

  const handleFormComplete = (formData: { name: string; email: string; phone: string }) => {
    setPurchaseData(formData);
    setCurrentStep('checkout');
  };

  const handleBackToTickets = () => {
    clearBooking();
    setCurrentStep('purchase');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleBookingExpired = () => {
    alert('Din reservation har gått ut. Vänligen välj biljetter igen.');
    setCurrentStep('purchase');
  };

  if (currentStep === 'checkout') {
    return (
      <div className="space-y-4">
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
        {hasActiveBooking && (
          <TicketCountdown 
            timeLeft={timeLeft} 
            onExpired={handleBookingExpired}
          />
        )}
      </div>
    );
  }

  if (currentStep === 'form') {
    return (
      <div className="space-y-4">
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
        {hasActiveBooking && (
          <TicketCountdown 
            timeLeft={timeLeft} 
            onExpired={handleBookingExpired}
          />
        )}
      </div>
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


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
      console.log('Starting ticket purchase process...');
      
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

  const handleBackToTickets = async () => {
    console.log('Going back to ticket selection...');
    // Clear the booking to release the tickets
    await clearBooking();
    setCurrentStep('purchase');
    // Reset ticket data to allow new booking
    setTicketData({
      regularTickets: 0,
      discountTickets: 0,
      discountCode: ''
    });
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleBookingExpired = async () => {
    console.log('Booking expired, clearing and resetting...');
    alert('Din reservation har gått ut. Vänligen välj biljetter igen.');
    await clearBooking();
    setCurrentStep('purchase');
    // Reset ticket data when booking expires
    setTicketData({
      regularTickets: 0,
      discountTickets: 0,
      discountCode: ''
    });
  };

  if (currentStep === 'checkout') {
    return (
      <div className={`space-y-4 ${hasActiveBooking ? 'mb-8' : ''}`}>
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
      <div className={`space-y-4 ${hasActiveBooking ? 'mb-8' : ''}`}>
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

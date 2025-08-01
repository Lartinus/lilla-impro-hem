
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAvailableTickets } from '@/hooks/useTicketSync';
import { useTicketBooking } from '@/hooks/useTicketBooking';
import TicketPurchase from './TicketPurchase';
import PurchaseForm from './PurchaseForm';
// Removed StripeCheckout import as payment is now handled directly in PurchaseForm
import TicketCountdown from './TicketCountdown';
import SoldOut from './SoldOut';

interface TicketPurchaseCompleteProps {
  onPurchase: (data: { regularTickets: number; discountTickets: number; discountCode: string }) => void;
  ticketPrice?: number;
  discountPrice?: number;
  totalTickets: number; // Now required - no fallback
  showSlug: string;
  showTitle: string;
  showDate: string;
  showLocation: string;
}

const TicketPurchaseComplete = ({ 
  onPurchase, 
  ticketPrice = 175, 
  discountPrice = 145, 
  totalTickets, // No fallback value
  showSlug,
  showTitle,
  showDate,
  showLocation
}: TicketPurchaseCompleteProps) => {
  const [currentStep, setCurrentStep] = useState<'purchase' | 'form'>('purchase');
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

  // Critical error handling: if totalTickets is not provided, we cannot proceed
  if (totalTickets === undefined || totalTickets === null) {
    console.error(`❌ CRITICAL ERROR: No totalTickets provided for show ${showSlug}`);
    console.error(`  - This value must be configured in the show settings`);
    console.error(`  - Show will be displayed as sold out until this is fixed`);
    
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
        <h4 className="text-red-800 font-bold mb-2">Biljettkonfiguration saknas</h4>
        <p className="text-red-700 text-sm">
          Totalt antal biljetter har inte konfigurerats för denna föreställning. 
          Kontakta administratören för att lösa detta problem.
        </p>
      </div>
    );
  }

  const { data: availableTickets } = useAvailableTickets(showSlug, totalTickets);
  const { booking, timeLeft, createBooking, clearBooking, hasActiveBooking } = useTicketBooking();

  // Add detailed logging for debugging
  console.log(`🎭 TicketPurchaseComplete for ${showSlug}:`);
  console.log(`  - totalTickets: ${totalTickets}`);
  console.log(`  - availableTickets (computed): ${availableTickets}`);
  console.log(`  - hasActiveBooking: ${hasActiveBooking}`);
  console.log(`  - Calculation: ${totalTickets} total - sold - booked = ${availableTickets} available`);

  const handleTicketPurchase = async (data: { regularTickets: number; discountTickets: number; discountCode: string }) => {
    try {
      console.log('🎫 Starting ticket purchase process...');
      console.log(`  - Regular tickets: ${data.regularTickets}`);
      console.log(`  - Discount tickets: ${data.discountTickets}`);
      console.log(`  - Total requested: ${data.regularTickets + data.discountTickets}`);
      console.log(`  - Available tickets: ${availableTickets}`);
      
      // Check if enough tickets are available
      const totalRequested = data.regularTickets + data.discountTickets;
      if (availableTickets !== undefined && totalRequested > availableTickets) {
        console.error(`❌ Not enough tickets available. Requested: ${totalRequested}, Available: ${availableTickets}`);
        alert(`Endast ${availableTickets} biljetter tillgängliga. Du försöker köpa ${totalRequested} biljetter.`);
        return;
      }
      
      // Create booking for the selected tickets
      await createBooking(showSlug, data.regularTickets, data.discountTickets);
      
      setTicketData(data);
      setCurrentStep('form');
    } catch (error) {
      console.error('❌ Failed to book tickets:', error);
      alert('Kunde inte reservera biljetterna. Försök igen.');
    }
  };

  const handleFormComplete = (formData: { name: string; email: string; phone: string }) => {
    setPurchaseData(formData);
    // Form completion now handles payment directly, no need to set checkout step
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

  // Removed handleBackToForm as we no longer have a checkout step

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

  // Removed checkout step - payment now handled directly in PurchaseForm

  if (currentStep === 'form') {
    return (
      <div className={`space-y-4 ${hasActiveBooking ? 'mb-8' : ''}`}>
        <PurchaseForm
          ticketCount={ticketData.regularTickets}
          discountTickets={ticketData.discountTickets}
          discountCode={ticketData.discountCode}
          showTitle={showTitle}
          showSlug={showSlug}
          showDate={showDate}
          showLocation={showLocation}
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

  // Check if sold out before showing ticket purchase
  if (availableTickets !== undefined && availableTickets <= 0) {
    return <SoldOut />;
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


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAvailableTickets } from '@/hooks/useTicketSync';
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
  const [ticketCount, setTicketCount] = useState(1);
  const [discountTickets, setDiscountTickets] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const { data: availableTickets = totalTickets } = useAvailableTickets(showSlug, totalTickets);

  const [errors, setErrors] = useState({
    phone: '',
    email: ''
  });

  const [touched, setTouched] = useState({
    phone: false,
    email: false
  });

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
    setErrors({...errors, phone: validatePhone(value)});
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPurchaseData({...purchaseData, email: value});
    setErrors({...errors, email: validateEmail(value)});
  };

  const handlePhoneBlur = () => setTouched({...touched, phone: true});
  const handleEmailBlur = () => setTouched({...touched, email: true});

  const isFormValid = () => {
    const phoneError = validatePhone(purchaseData.phone);
    const emailError = validateEmail(purchaseData.email);
    
    return purchaseData.name && 
           purchaseData.email && 
           purchaseData.phone && 
           !phoneError && 
           !emailError &&
           (ticketCount > 0 || discountTickets > 0);
  };

  const handleContinue = () => {
    if (!isFormValid()) return;
    setShowCheckout(true);
  };

  if (showCheckout) {
    return (
      <StripeCheckout
        showSlug={showSlug}
        showTitle={showTitle}
        showDate={showDate}
        showLocation={showLocation}
        regularTickets={ticketCount}
        discountTickets={discountTickets}
        discountCode={discountCode}
        ticketPrice={ticketPrice}
        discountPrice={discountPrice}
        buyerName={purchaseData.name}
        buyerEmail={purchaseData.email}
        buyerPhone={purchaseData.phone}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-content-primary font-bold mb-4">Köp biljetter</h4>
      
      {availableTickets <= 20 && availableTickets > 0 && (
        <div className="mb-4 text-accent-text text-sm">
          Endast {availableTickets} biljetter kvar!
        </div>
      )}

      {availableTickets === 0 && (
        <div className="mb-4 text-red-600 font-bold">
          Tyvärr är denna föreställning slutsåld!
        </div>
      )}
      
      <div className="mb-4">
        <div className="font-medium text-content-primary mb-3">Pris {ticketPrice}kr</div>
        <div className="flex items-center space-x-4">
          <div className="relative w-24 border border-red-800 bg-white">
            <div className="h-8 flex items-center justify-center text-center text-form-text pr-8">
              {ticketCount}
            </div>
            <div className="absolute right-0 top-0 h-full w-6 flex flex-col">
              <button
                onClick={() => setTicketCount(ticketCount + 1)}
                className="h-4 flex items-center justify-center hover:bg-gray-100 border-b border-red-800"
                disabled={ticketCount + discountTickets >= availableTickets}
              >
                <ChevronUp size={10} className="text-form-text-muted" />
              </button>
              <button
                onClick={() => setTicketCount(Math.max(0, ticketCount - 1))}
                className="h-4 flex items-center justify-center hover:bg-gray-100"
              >
                <ChevronDown size={10} className="text-form-text-muted" />
              </button>
            </div>
          </div>
          <div className="w-32 border border-red-800 bg-white">
            <Input
              placeholder="Ev. rabattkod"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="rounded-none border-0 text-form-text text-sm h-8 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder-form-placeholder"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-medium text-content-primary mb-3">Student/pensionär/kursare {discountPrice}kr</div>
        <div className="relative w-24 border border-red-800 bg-white">
          <div className="h-8 flex items-center justify-center text-center text-form-text pr-8">
            {discountTickets}
          </div>
          <div className="absolute right-0 top-0 h-full w-6 flex flex-col">
            <button
              onClick={() => setDiscountTickets(discountTickets + 1)}
              className="h-4 flex items-center justify-center hover:bg-gray-100 border-b border-red-800"
              disabled={ticketCount + discountTickets >= availableTickets}
            >
              <ChevronUp size={10} className="text-form-text-muted" />
            </button>
            <button
              onClick={() => setDiscountTickets(Math.max(0, discountTickets - 1))}
              className="h-4 flex items-center justify-center hover:bg-gray-100"
            >
              <ChevronDown size={10} className="text-form-text-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* Purchase form */}
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
      
      <Button 
        onClick={handleContinue}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none text-sm"
        disabled={!isFormValid() || availableTickets === 0}
      >
        Fortsätt till betalning →
      </Button>
    </div>
  );
};

export default TicketPurchaseComplete;

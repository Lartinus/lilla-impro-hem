
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TicketPurchaseProps {
  onPurchase: (data: { regularTickets: number; discountTickets: number; discountCode: string }) => void;
  ticketPrice?: number;
  discountPrice?: number;
  availableTickets?: number;
}

const TicketPurchase = ({ 
  onPurchase, 
  ticketPrice = 175, 
  discountPrice = 145, 
  availableTickets = 100 
}: TicketPurchaseProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [discountTickets, setDiscountTickets] = useState(0);
  const [discountCode, setDiscountCode] = useState('');

  const handlePurchase = () => {
    if (ticketCount === 0 && discountTickets === 0) return;
    onPurchase({
      regularTickets: ticketCount,
      discountTickets: discountTickets,
      discountCode: discountCode
    });
  };

  return (
    <div className="mb-6">
      <h4 className="text-content-primary font-bold mb-4">Köp biljetter</h4>
      
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

      {availableTickets <= 20 && (
        <div className="mb-4 text-accent-text text-sm">
          Endast {availableTickets} biljetter kvar!
        </div>
      )}
      
      <Button 
        onClick={handlePurchase}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none text-sm"
        disabled={ticketCount === 0 && discountTickets === 0}
      >
        Fortsätt →
      </Button>
    </div>
  );
};

export default TicketPurchase;

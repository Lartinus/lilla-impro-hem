
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TicketPurchaseProps {
  onPurchase: (data: { regularTickets: number; discountTickets: number; discountCode: string }) => void;
}

const TicketPurchase = ({ onPurchase }: TicketPurchaseProps) => {
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
      <h4 className="text-gray-800 font-bold mb-4">Köp biljetter</h4>
      
      <div className="mb-4">
        <div className="font-medium text-gray-800 mb-3">Pris 175kr</div>
        <div className="flex items-center space-x-4">
          <div className="w-20 border border-gray-300 rounded-none bg-white">
            <div className="flex flex-col">
              <button
                onClick={() => setTicketCount(ticketCount + 1)}
                className="h-4 flex items-center justify-center hover:bg-gray-100 border-b border-gray-300"
              >
                <ChevronUp size={12} />
              </button>
              <div className="h-8 flex items-center justify-center text-center">
                {ticketCount}
              </div>
              <button
                onClick={() => setTicketCount(Math.max(0, ticketCount - 1))}
                className="h-4 flex items-center justify-center hover:bg-gray-100 border-t border-gray-300"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Ev. rabattkod"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="rounded-none border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-medium text-gray-800 mb-3">Student/pensionär/kursare 145kr</div>
        <div className="w-20 border border-gray-300 rounded-none bg-white">
          <div className="flex flex-col">
            <button
              onClick={() => setDiscountTickets(discountTickets + 1)}
              className="h-4 flex items-center justify-center hover:bg-gray-100 border-b border-gray-300"
            >
              <ChevronUp size={12} />
            </button>
            <div className="h-8 flex items-center justify-center text-center">
              {discountTickets}
            </div>
            <button
              onClick={() => setDiscountTickets(Math.max(0, discountTickets - 1))}
              className="h-4 flex items-center justify-center hover:bg-gray-100 border-t border-gray-300"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>
      
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


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TicketPurchaseProps {
  onPurchase: (data: { regularTickets: number; discountTickets: number; discountCode: string; discountValidation?: { valid: boolean; discountAmount: number; error?: string } }) => void;
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
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    discountAmount: number;
    error?: string;
  }>({ valid: false, discountAmount: 0 });
  const [isValidating, setIsValidating] = useState(false);

  const validateDiscountCode = async (code: string) => {
    const baseTotal = (ticketCount * ticketPrice) + (discountTickets * discountPrice);
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount-code', {
        body: { code: code.trim(), totalAmount: baseTotal }
      });

      if (error) {
        setDiscountValidation({ valid: false, discountAmount: 0, error: 'Fel vid validering' });
        return;
      }

      if (data.valid) {
        setDiscountValidation({ 
          valid: true, 
          discountAmount: data.discountAmount
        });
      } else {
        setDiscountValidation({ 
          valid: false, 
          discountAmount: 0, 
          error: data.error || 'Ogiltig rabattkod'
        });
      }
    } catch (err) {
      console.error('Error validating discount code:', err);
      setDiscountValidation({ valid: false, discountAmount: 0, error: 'Fel vid validering' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyDiscountCode = async () => {
    await validateDiscountCode(discountCode.trim());
    setAppliedDiscountCode(discountCode.trim());
  };

  const handleRemoveDiscountCode = () => {
    setDiscountCode('');
    setAppliedDiscountCode('');
    setDiscountValidation({ valid: false, discountAmount: 0 });
  };

  const handlePurchase = () => {
    if (ticketCount === 0 && discountTickets === 0) return;
    onPurchase({
      regularTickets: ticketCount,
      discountTickets: discountTickets,
      discountCode: appliedDiscountCode,
      discountValidation: appliedDiscountCode ? discountValidation : undefined
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-content-primary mb-4">Köp biljetter</h2>
      
      <div className="mb-4">
        <div className="font-medium text-content-primary mb-3">Pris {ticketPrice}kr</div>
        <div className="flex items-center space-x-4">
          <div className="relative w-24 border border-black bg-transparent flex items-center">
            <button
              onClick={() => setTicketCount(Math.max(0, ticketCount - 1))}
              className="h-8 w-6 flex items-center justify-center hover:bg-gray-100 focus:outline-none"
            >
              <ChevronLeft size={12} className="text-form-text-muted" />
            </button>
            <div className="flex-1 h-8 flex items-center justify-center text-center text-form-text">
              {ticketCount}
            </div>
            <button
              onClick={() => setTicketCount(ticketCount + 1)}
              className="h-8 w-6 flex items-center justify-center hover:bg-gray-100 focus:outline-none"
              disabled={ticketCount + discountTickets >= availableTickets || ticketCount + discountTickets >= 12}
            >
              <ChevronRight size={12} className="text-form-text-muted" />
            </button>
          </div>
        </div>
        
        {/* Discount code section - separate row on mobile */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-24 border border-black bg-transparent">
              <Input
                placeholder="Rabattkod"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="rounded-none border-0 text-form-text h-10 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder-form-placeholder text-base"
                style={{ fontSize: '16px' }}
                disabled={!!appliedDiscountCode}
              />
            </div>
            {discountCode.trim() && !appliedDiscountCode && (
              <Button
                onClick={handleApplyDiscountCode}
                disabled={isValidating}
                className="h-10 px-4 text-base rounded-none border border-black bg-transparent text-form-text hover:bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-nowrap font-normal flex-shrink-0"
              >
                {isValidating ? 'Validerar...' : 'Tillämpa'}
              </Button>
            )}
            {appliedDiscountCode && (
              <Button
                onClick={handleRemoveDiscountCode}
                className="h-10 px-4 text-base rounded-none border border-red-600 bg-transparent text-red-600 hover:bg-red-50 focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-nowrap font-normal flex-shrink-0"
              >
                Ta bort
              </Button>
            )}
          </div>
        </div>
        
        {/* Discount validation feedback */}
        {appliedDiscountCode && (
          <div className="mt-2">
            {discountValidation.valid ? (
              <div className="text-green-600 text-sm">
                ✓ Rabattkod applicerad: -{discountValidation.discountAmount.toFixed(2).replace(/\.?0+$/, '')}kr
              </div>
            ) : discountValidation.error ? (
              <div className="text-red-600 text-sm">
                ✗ {discountValidation.error}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="font-medium text-content-primary mb-3">Student/pensionär/kursare {discountPrice}kr</div>
        <div className="relative w-24 border border-black bg-transparent flex items-center">
          <button
            onClick={() => setDiscountTickets(Math.max(0, discountTickets - 1))}
            className="h-8 w-6 flex items-center justify-center hover:bg-gray-100 focus:outline-none"
          >
            <ChevronLeft size={12} className="text-form-text-muted" />
          </button>
          <div className="flex-1 h-8 flex items-center justify-center text-center text-form-text">
            {discountTickets}
          </div>
          <button
            onClick={() => setDiscountTickets(discountTickets + 1)}
            className="h-8 w-6 flex items-center justify-center hover:bg-gray-100 focus:outline-none"
            disabled={ticketCount + discountTickets >= availableTickets || ticketCount + discountTickets >= 12}
          >
            <ChevronRight size={12} className="text-form-text-muted" />
          </button>
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

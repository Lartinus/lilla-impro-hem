import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface NewsletterSignupSectionProps {
  onSignupClick: () => void;
}

const NewsletterSignupSection = ({ onSignupClick }: NewsletterSignupSectionProps) => {
  return (
    <div style={{ backgroundColor: '#D9D9D9' }} className="p-8 mb-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-tanker text-2xl md:text-3xl text-black mb-2 uppercase">
          FÅ INFORMATIONEN
        </h2>
        <h2 className="font-tanker text-2xl md:text-3xl text-black mb-6 uppercase">
          DIREKT I DIN INKORG
        </h2>
        
        <p className="text-black mb-6">
          Prenumerera på vårt nyhetsbrev och få information om nya föreställningar direkt till din inkorg.
        </p>

        <Button 
          onClick={onSignupClick}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-none font-bold uppercase flex items-center gap-2"
        >
          Skriv upp dig
          <ArrowRight size={20} />
        </Button>

        <div className="text-xs text-black mt-4">
          <p>
            Genom att prenumerera godkänner du att vi skickar dig information om våra föreställningar och kurser. 
            Du kan när som helst avregistrera dig via länken i våra mejl.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignupSection;
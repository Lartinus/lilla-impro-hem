import React from 'react';
import { Button } from '@/components/ui/button';

interface NewsletterSignupSectionProps {
  onSignupClick: () => void;
}

const NewsletterSignupSection = ({ onSignupClick }: NewsletterSignupSectionProps) => {
  return (
    <div className="bg-[#D9D9D9] mx-0 mb-0 md:mx-[31px] md:mb-[30px]">
      <div className="px-6 md:px-8 py-8">
        <div className="text-left">
          <h1>Få informationen direkt i din inkorg</h1>
          <p className="text-[16px] font-satoshi mb-6">
            Prenumerera på vårt nyhetsbrev och få information om nya föreställningar direkt till din inkorg.
          </p>
          <Button 
            onClick={onSignupClick}
            variant="default"
          >
            <span>Skriv upp dig</span>
            <span className="text-2xl font-bold">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignupSection;
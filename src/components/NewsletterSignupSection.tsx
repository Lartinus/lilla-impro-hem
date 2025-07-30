import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NewsletterSignupSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Fyll i alla fält",
        description: "Både namn och e-post krävs för att registrera dig.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('newsletter-signup', {
        body: { 
          email: email.trim().toLowerCase(),
          name: name.trim()
        }
      });

      if (error) {
        console.error('Newsletter signup error:', error);
        toast({
          title: "Ett fel uppstod",
          description: error.message || "Kunde inte registrera dig för nyhetsbrevet. Försök igen.",
          variant: "destructive"
        });
        return;
      }

      setIsSuccess(true);
      setEmail('');
      setName('');
      toast({
        title: "Registrering lyckades!",
        description: "Kolla din e-post för att bekräfta din registrering.",
      });

    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte registrera dig för nyhetsbrevet. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ backgroundColor: '#D9D9D9' }} className="p-8 mb-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-tanker text-2xl md:text-3xl text-black mb-4 uppercase">
            Tack för din registrering!
          </h2>
          <p className="text-black">
            Kolla din e-post för att bekräfta din prenumeration.
          </p>
        </div>
      </div>
    );
  }

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Ditt namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white border-black"
            />
            <Input
              type="email"
              placeholder="din@email.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-black"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-none font-bold uppercase flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                Registrerar...
              </>
            ) : (
              <>
                Skriv upp dig
                <ArrowRight size={20} />
              </>
            )}
          </Button>
        </form>

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
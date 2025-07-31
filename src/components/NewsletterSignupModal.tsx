import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsletterSignupModal: React.FC<NewsletterSignupModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
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

  const handleClose = () => {
    setEmail('');
    setName('');
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-normal">
            Prenumerera på vårt nyhetsbrev
          </DialogTitle>
          <DialogDescription>
            Få de senaste nyheterna om våra föreställningar och kurser direkt i din inkorg.
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ditt namn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Avbryt
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                    Registrerar...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Prenumerera
                  </div>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tack för din registrering!</h3>
            <p className="text-muted-foreground mb-6">
              Vi har skickat en bekräftelse till <strong>{email}</strong>. 
              Klicka på länken i mejlet för att bekräfta din prenumeration.
            </p>
            <Button onClick={handleClose}>Stäng</Button>
          </div>
        )}

        <div className="!text-xs text-muted-foreground mt-4 pt-4 border-t">
          <p>
            Genom att prenumerera godkänner du att vi skickar dig information om våra föreställningar och kurser. 
            Du kan när som helst avregistrera dig via länken i våra mejl.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
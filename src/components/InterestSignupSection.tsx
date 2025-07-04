import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInterestSignups } from '@/hooks/useInterestSignups';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { ArrowRight } from 'lucide-react';

interface InterestSignupFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const InterestSignupSection = () => {
  const { data: interestSignups, isLoading } = useInterestSignups();
  const [selectedSignup, setSelectedSignup] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InterestSignupFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { signupId: string; formData: InterestSignupFormData }) => {
      const { error } = await supabase
        .from('interest_signup_submissions')
        .insert({
          interest_signup_id: data.signupId,
          name: data.formData.name,
          email: data.formData.email,
          phone: data.formData.phone || null,
          message: data.formData.message || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Intresseanmälan skickad!",
        description: "Tack för din anmälan. Vi hör av oss så snart vi har mer information.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skicka anmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setSelectedSignup(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSignup) return;
    
    submitMutation.mutate({ signupId: selectedSignup, formData });
  };

  const openDialog = (signupId: string) => {
    setSelectedSignup(signupId);
    setIsDialogOpen(true);
  };

  if (isLoading || !interestSignups || interestSignups.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-0.5 md:px-4">
      <div className="md:max-w-5xl md:mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mx-[12px] md:mx-0">
          {interestSignups.map((signup) => (
            <Card 
              key={signup.id} 
              className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col"
            >
              <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
                <div className="mb-3">
                  <h2 className="text-xl font-bold mb-1">
                    {signup.title}
                  </h2>
                  {signup.subtitle && (
                    <p className="font-bold text-xs text-muted-foreground">
                      {signup.subtitle}
                    </p>
                  )}
                </div>
                
                {signup.information && (
                  <div 
                    className="mb-4 text-base body-text mt-0 flex-1 [&>p]:mb-0.5 [&>p]:mt-0 [&>h1]:mb-0 [&>h2]:mb-0 [&>h3]:mb-0 [&>h4]:mb-0 [&>h5]:mb-0 [&>h6]:mb-0 [&>*:first-child]:mt-0"
                    dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(signup.information) }}
                  />
                )}
                
                <div className="mt-auto pt-4">
                  <Button 
                    onClick={() => openDialog(signup.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Anmäl intresse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Anmäl intresse</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Namn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Meddelande (valfritt)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={3}
                placeholder="Har du några frågor eller vill du berätta något mer?"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button 
                type="submit"
                disabled={submitMutation.isPending || !formData.name.trim() || !formData.email.trim()}
              >
                {submitMutation.isPending ? 'Skickar...' : 'Skicka anmälan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};
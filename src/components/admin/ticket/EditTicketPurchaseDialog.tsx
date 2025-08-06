import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TicketPurchase {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  show_title: string;
  regular_tickets: number;
  discount_tickets: number;
  resend_count?: number;
  last_resent_at?: string;
}

interface EditTicketPurchaseDialogProps {
  ticket: TicketPurchase | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditTicketPurchaseDialog = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onUpdate 
}: EditTicketPurchaseDialogProps) => {
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (ticket) {
      setFormData({
        buyer_name: ticket.buyer_name,
        buyer_email: ticket.buyer_email,
        buyer_phone: ticket.buyer_phone
      });
    }
  }, [ticket]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return phone.trim().length >= 6 && phone.trim().length <= 20;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticket) return;

    // Validate form data
    if (!formData.buyer_name.trim()) {
      toast.error('Namn får inte vara tomt');
      return;
    }

    if (!validateEmail(formData.buyer_email)) {
      toast.error('Ange en giltig e-postadress');
      return;
    }

    if (!validatePhone(formData.buyer_phone)) {
      toast.error('Telefonnummer måste vara mellan 6-20 tecken');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Inte inloggad');
      }

      // Update ticket contact details using the database function
      const { data, error } = await supabase.rpc('update_ticket_contact_details', {
        ticket_id_param: ticket.id,
        new_buyer_name: formData.buyer_name.trim(),
        new_buyer_email: formData.buyer_email.toLowerCase().trim(),
        new_buyer_phone: formData.buyer_phone.trim(),
        admin_user_id_param: user.id
      });

      if (error) throw error;

      if (!data) {
        throw new Error('Kunde inte uppdatera biljettinformation');
      }

      toast.success('Kontaktuppgifter uppdaterade');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating ticket contact details:', error);
      toast.error(error.message || 'Kunde inte uppdatera kontaktuppgifter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redigera kontaktuppgifter</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {ticket.show_title} • {ticket.regular_tickets + ticket.discount_tickets} biljett(er)
            {ticket.resend_count > 0 && (
              <div className="mt-1 text-orange-600">
                Omskickad {ticket.resend_count} gång(er)
                {ticket.last_resent_at && (
                  <span className="ml-1">
                    (senast {new Date(ticket.last_resent_at).toLocaleDateString('sv-SE')})
                  </span>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer_name">Namn *</Label>
            <Input
              id="buyer_name"
              type="text"
              value={formData.buyer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, buyer_name: e.target.value }))}
              placeholder="Ange köparens namn"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer_email">E-postadress *</Label>
            <Input
              id="buyer_email"
              type="email"
              value={formData.buyer_email}
              onChange={(e) => setFormData(prev => ({ ...prev, buyer_email: e.target.value }))}
              placeholder="Ange köparens e-postadress"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer_phone">Telefonnummer *</Label>
            <Input
              id="buyer_phone"
              type="tel"
              value={formData.buyer_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, buyer_phone: e.target.value }))}
              placeholder="Ange köparens telefonnummer"
              required
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sparar...' : 'Spara ändringar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CourseParticipant } from '@/types/courseManagement';

interface EditParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: CourseParticipant | null;
  onSave: (oldEmail: string, newData: { name: string; email: string; phone: string }) => void;
  isLoading: boolean;
}

export const EditParticipantDialog = ({ 
  open, 
  onOpenChange, 
  participant, 
  onSave, 
  isLoading 
}: EditParticipantDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Update form data when participant changes
  useEffect(() => {
    if (participant) {
      setFormData({
        name: participant.name || '',
        email: participant.email || '',
        phone: participant.phone || ''
      });
    }
  }, [participant]);

  const handleSave = () => {
    console.log('🔧 EditParticipantDialog handleSave called', { participant, formData });
    
    if (!participant || !formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      console.log('❌ Form validation failed', { participant, formData });
      return;
    }

    console.log('✅ Calling onSave with:', participant.email, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim()
    });

    onSave(participant.email, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim()
    });
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.phone.trim();
  const hasChanges = participant && (
    formData.name !== participant.name ||
    formData.email !== participant.email ||
    formData.phone !== participant.phone
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-satoshi">Redigera deltagare</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Namn *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Förnamn Efternamn"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-email">E-post *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="namn@exempel.se"
            />
          </div>
          
          <div>
            <Label htmlFor="edit-phone">Telefon *</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="070-123 45 67"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isFormValid || !hasChanges || isLoading}
          >
            {isLoading ? 'Sparar...' : 'Spara'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createEmailTemplatePreview } from '@/utils/emailTemplatePreview';
import { EmailTemplate } from './types';

interface EmailTemplatePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}

export function EmailTemplatePreviewDialog({ 
  isOpen, 
  onClose, 
  template 
}: EmailTemplatePreviewDialogProps) {
  // Use passed template directly for consistent preview
  const effectiveTemplate = template;
  
  const isTicketTemplate = effectiveTemplate?.name?.includes('AUTO: Biljettbekräftelse') || 
                           effectiveTemplate?.name?.includes('FÖRHANDSVISNING: BILJETTBEKRÄFTELSE');

  // Use same mock variables as EmailTemplatePreview and edge function
  const mockVariables = isTicketTemplate ? {
    NAMN: 'Anna Andersson',
    FORESTALLNING: 'Improvisation & Comedy - Julshow',
    DATUM: '2024-12-15T19:30:00.000Z',
    BILJETTKOD: 'LIT-2024-1215-001',
    // Additional mock data to match edge function purchase object
    show_location: 'Lilla Improteatern, Teatergatan 3, Stockholm',
    regular_tickets: '1',
    discount_tickets: '1',
    buyer_email: 'anna.andersson@example.com',
    qr_data: 'LIT-2024-1215-001-MOCK'
  } : {
    NAMN: 'Anna Andersson', 
    KURS: 'Nivå 1 - Scenarbete & Improv Comedy',
    STARTDATUM: '15 januari 2025',
    STARTTID: '18:00'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Förhandsvisning: {template?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="border rounded bg-white max-h-[60vh] overflow-y-auto">
          {effectiveTemplate && (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: createEmailTemplatePreview(
                  effectiveTemplate.subject, 
                  effectiveTemplate.content, 
                  effectiveTemplate.background_image || undefined,
                  mockVariables,
                  isTicketTemplate
                )
              }}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Stäng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
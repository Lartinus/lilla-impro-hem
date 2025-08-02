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
  // Check if this is a ticket confirmation template (same logic as EmailTemplatePreview)
  const isTicketTemplate = template?.name?.includes('AUTO: Biljettbekräftelse') || 
                           template?.name?.includes('Biljettbekräftelse') ||
                           template?.subject?.includes('biljetter') ||
                           template?.content?.includes('biljett');

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
        <div className="border rounded p-4 bg-muted/50 max-h-[60vh] overflow-y-auto">
          {template && (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: createEmailTemplatePreview(
                  template.subject, 
                  template.content, 
                  template.background_image || undefined,
                  mockVariables,
                  isTicketTemplate
                )
              }}
              className="[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
              style={{ 
                fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                transform: 'scale(0.85)',
                transformOrigin: 'top left',
                width: '118%'
              } as React.CSSProperties}
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
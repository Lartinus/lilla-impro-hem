import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SentEmail } from '@/hooks/useSentEmails';

interface SentEmailPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: SentEmail | null;
}

export function SentEmailPreviewDialog({ 
  isOpen, 
  onClose, 
  email 
}: SentEmailPreviewDialogProps) {
  if (!email) return null;

  // Use html_content if available, otherwise fall back to content or a fallback message
  const emailContent = email.html_content || 
    (email.content ? `<div style="font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap;">${email.content}</div>` : null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-left">
            <div className="space-y-1">
              <div className="font-semibold">{email.subject}</div>
              <div className="text-sm text-muted-foreground font-normal">
                Till: {email.recipient_name ? `${email.recipient_name} (${email.recipient_email})` : email.recipient_email}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                Skickat: {new Date(email.sent_at).toLocaleString('sv-SE')}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="border rounded bg-white max-h-[60vh] overflow-y-auto">
          {emailContent ? (
            <div 
              dangerouslySetInnerHTML={{ __html: emailContent }}
              style={{ 
                transform: 'scale(0.7)',
                transformOrigin: 'top left',
                width: '143%',
                minHeight: '500px'
              } as React.CSSProperties}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>Ingen förhandsvisning tillgänglig för detta email.</p>
              <p className="text-sm mt-2">HTML-innehåll saknas i databasen.</p>
            </div>
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
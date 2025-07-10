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
                  template.background_image || undefined
                )
              }}
              className="[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1 [&_h1]:font-[Satoshi] [&_h2]:font-[Satoshi] [&_h3]:font-[Satoshi]"
              style={{ 
                fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                '--font-family': "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createEmailTemplatePreview } from '@/utils/emailTemplatePreview';
import { EmailTemplate } from './types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  // Try to fetch the actual template from database if this looks like a preview template
  const { data: actualTemplate } = useQuery({
    queryKey: ['actual-email-template-dialog', template?.name],
    queryFn: async () => {
      if (!template) return null;
      
      // Map preview template names to actual template names
      let actualTemplateName = template.name;
      if (template.name?.includes('FÖRHANDSVISNING: BILJETTBEKRÄFTELSE')) {
        actualTemplateName = 'AUTO: Biljettbekräftelse';
      }
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', actualTemplateName)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching actual template:', error);
        return null;
      }
      
      return data;
    },
    enabled: Boolean(template?.name && isOpen)
  });

  // Use actual template content if available, otherwise fall back to passed template
  const effectiveTemplate = actualTemplate || template;
  
  // Check if this is a ticket confirmation template (match actual template names)
  const isTicketTemplate = effectiveTemplate?.name?.includes('AUTO: Biljettbekräftelse') || 
                           effectiveTemplate?.name?.includes('FÖRHANDSVISNING: BILJETTBEKRÄFTELSE') ||
                           effectiveTemplate?.name?.includes('Biljettbekräftelse') ||
                           effectiveTemplate?.subject?.includes('biljetter') ||
                           effectiveTemplate?.content?.includes('biljett');

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
              style={{ 
                transform: 'scale(0.7)',
                transformOrigin: 'top left',
                width: '143%',
                minHeight: '500px'
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
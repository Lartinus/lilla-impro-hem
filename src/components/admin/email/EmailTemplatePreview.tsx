import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createEmailTemplatePreview } from '@/utils/emailTemplatePreview';

interface TemplateForm {
  name: string;
  subject: string;
  content: string;
  background_image: string;
  description: string;
}

interface EmailTemplatePreviewProps {
  templateForm: TemplateForm;
}

export function EmailTemplatePreview({ templateForm }: EmailTemplatePreviewProps) {
  // Check if this is a ticket confirmation template (match actual template names)
  const isTicketTemplate = templateForm.name?.includes('AUTO: Biljettbekräftelse') || 
                           templateForm.name?.includes('FÖRHANDSVISNING: BILJETTBEKRÄFTELSE') ||
                           templateForm.name?.includes('Biljettbekräftelse') ||
                           templateForm.subject?.includes('biljetter') ||
                           templateForm.content?.includes('biljett');

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Live-förhandsvisning</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg bg-muted/30 max-h-[70vh] overflow-y-auto">
          {templateForm.subject || templateForm.content ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: createEmailTemplatePreview(
                  templateForm.subject || 'Ämne saknas', 
                  templateForm.content || 'Inget innehåll ännu...', 
                  templateForm.background_image || undefined,
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
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground space-y-2">
              <div>Börja skriv för att se förhandsvisning</div>
              <div className="text-xs text-center">
              {isTicketTemplate ? (
                <>Tillgängliga variabler: NAMN, FORESTALLNING, DATUM, BILJETTKOD</>
              ) : (
                <>Tillgängliga variabler: NAMN, KURS, STARTDATUM, STARTTID</>
              )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
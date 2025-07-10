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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live-förhandsvisning</CardTitle>
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
                  { NAMN: 'Anna', KURS: 'Nivå 1 - Scenarbete & Improv Comedy' } // Exempel-variabler för förhandsvisning
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
                Tillgängliga variabler: [NAMN], [KURS], [STARTDATUM], [STARTTID]
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
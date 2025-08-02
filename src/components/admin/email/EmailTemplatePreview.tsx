import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createEmailTemplatePreview } from '@/utils/emailTemplatePreview';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  // Try to fetch the actual template from database if this looks like a preview template
  const { data: actualTemplate } = useQuery({
    queryKey: ['actual-email-template', templateForm.name],
    queryFn: async () => {
      // Map preview template names to actual template names
      let actualTemplateName = templateForm.name;
      if (templateForm.name?.includes('FÖRHANDSVISNING: BILJETTBEKRÄFTELSE')) {
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
    enabled: Boolean(templateForm.name)
  });

  // Use actual template content if available, otherwise fall back to form content
  const effectiveTemplate = actualTemplate || templateForm;
  
  // Check if this is a ticket confirmation template (match actual template names)
  const isTicketTemplate = effectiveTemplate.name?.includes('AUTO: Biljettbekräftelse') || 
                           effectiveTemplate.name?.includes('FÖRHANDSVISNING: BILJETTBEKRÄFTELSE') ||
                           effectiveTemplate.name?.includes('Biljettbekräftelse') ||
                           effectiveTemplate.subject?.includes('biljetter') ||
                           effectiveTemplate.content?.includes('biljett');

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
        <div className="border rounded-lg bg-white max-h-[70vh] overflow-y-auto">
          {effectiveTemplate.subject || effectiveTemplate.content ? (
            <>
              <style>
                {`
                  @import url('https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap');
                  @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
                  
                  .tanker-font { 
                    font-family: 'Tanker', 'Impact', 'Arial Black', 'Franklin Gothic Bold', 'Helvetica Bold', sans-serif !important; 
                    font-weight: 400 !important;
                  }
                  .satoshi-font { 
                    font-family: 'Satoshi', 'Helvetica Neue', 'Arial', sans-serif !important; 
                  }
                `}
              </style>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: createEmailTemplatePreview(
                    effectiveTemplate.subject || 'Ämne saknas', 
                    effectiveTemplate.content || 'Inget innehåll ännu...', 
                    effectiveTemplate.background_image || undefined,
                    mockVariables,
                    isTicketTemplate
                  )
                }}
                style={{ 
                  transform: 'scale(0.8)',
                  transformOrigin: 'top left',
                  width: '125%',
                  minHeight: '500px'
                } as React.CSSProperties}
              />
            </>
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
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Eye, Save, X } from 'lucide-react';
import { createUnifiedEmailTemplate } from '../../../../supabase/functions/_shared/email-template';

interface AutomaticEmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  background_image?: string;
}

const AUTOMATIC_EMAIL_TYPES = [
  {
    key: 'ticket_confirmation',
    name: 'Biljettbekräftelse',
    description: 'Skickas när någon köper biljetter',
    variables: ['NAMN', 'FORESTALLNING', 'DATUM', 'BILJETTKOD'],
    dbName: 'AUTO: Biljettbekräftelse'
  },
  {
    key: 'course_confirmation',
    name: 'Kursbekräftelse',
    description: 'Skickas när någon bokar en kurs',
    variables: ['NAMN', 'KURSTITEL', 'STARTDATUM', 'STARTTID'],
    dbName: 'AUTO: Kursbekräftelse'
  },
  {
    key: 'interest_confirmation',
    name: 'Intresse bekräftelse',
    description: 'Skickas när någon anmäler intresse',
    variables: ['NAMN', 'INTRESSETITEL'],
    dbName: 'AUTO: Intresseanmälan bekräftelse'
  },
  {
    key: 'corporate_inquiry',
    name: 'Företagsförfrågan bekräftelse',
    description: 'Skickas när någon gör en företagsförfrågan',
    variables: ['NAMN', 'FÖRETAG', 'TILLFÄLLE'],
    dbName: 'AUTO: Företagsförfrågan bekräftelse'
  },
  {
    key: 'private_inquiry',
    name: 'Privatförfrågan bekräftelse',
    description: 'Skickas när någon gör en privatförfrågan',
    variables: ['NAMN', 'TILLFÄLLE'],
    dbName: 'AUTO: Privatförfrågan bekräftelse'
  }
];

export function AutomaticEmailsManager() {
  const [editingTemplate, setEditingTemplate] = useState<AutomaticEmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AutomaticEmailTemplate | null>(null);
  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['automatic-email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .in('name', AUTOMATIC_EMAIL_TYPES.map(type => type.dbName))
        .eq('is_active', true);
      
      if (error) throw error;
      return data as AutomaticEmailTemplate[];
    }
  });

  // Create/update template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: Partial<AutomaticEmailTemplate>) => {
      if (template.id) {
        const { data, error } = await supabase
          .from('email_templates')
          .update({
            subject: template.subject,
            content: template.content,
            background_image: template.background_image
          })
          .eq('id', template.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('email_templates')
          .insert({
            name: template.name,
            subject: template.subject,
            content: template.content,
            description: template.description,
            background_image: template.background_image,
            is_active: true
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automatic-email-templates'] });
      setEditingTemplate(null);
      toast.success('Mall sparad');
    },
    onError: (error) => {
      toast.error('Kunde inte spara mall');
      console.error('Error saving template:', error);
    }
  });

  const handleEdit = (emailType: typeof AUTOMATIC_EMAIL_TYPES[0]) => {
    const existingTemplate = templates?.find(t => t.name === emailType.dbName);
    
    if (existingTemplate) {
      setEditingTemplate(existingTemplate);
    } else {
      // Create new template
      setEditingTemplate({
        id: '',
        name: emailType.dbName,
        subject: getDefaultSubject(emailType.key),
        content: getDefaultContent(emailType.key),
        description: emailType.description
      });
    }
  };

  const handleSave = () => {
    if (editingTemplate) {
      saveTemplateMutation.mutate(editingTemplate);
    }
  };

  const createEmailHtml = (template: AutomaticEmailTemplate) => {
    // Get the template type to determine mock variables
    const templateType = AUTOMATIC_EMAIL_TYPES.find(type => type.dbName === template.name);
    
    // Create mock variables based on template type
    let mockVariables: Record<string, string> = {};
    let processedContent = template.content;
    
    if (templateType?.key === 'ticket_confirmation') {
      mockVariables = {
        NAMN: 'Anna Andersson',
        FORESTALLNING: 'Improvisation & Comedy - Julshow',
        DATUM: '15 december 2024',
        BILJETTKOD: 'LIT2024ABC123'
      };
      
      // Replace variables first (same as edge function)
      Object.entries(mockVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        processedContent = processedContent.replace(regex, value);
      });
      
      // Add ticket details section (same as send-ticket-confirmation)
      processedContent += `

H2: Dina biljettdetaljer

Datum: 15 december 2024
Tid: 19:30
Plats: Lilla Improteatern, Göteborg
Biljetter: 2 st
Biljettkod: LIT2024ABC123

[QR_CODE_PLACEHOLDER]

Visa denna QR-kod vid entrén`;

    } else if (templateType?.key === 'course_confirmation') {
      mockVariables = {
        NAMN: 'Anna Andersson',
        KURSTITEL: 'Grundkurs i Improvisation',
        STARTDATUM: '20 januari 2025',
        STARTTID: '18:00'
      };
      
      // Replace variables (same as send-course-confirmation)
      Object.entries(mockVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        processedContent = processedContent.replace(regex, value);
      });
      
    } else if (templateType?.key === 'interest_confirmation') {
      mockVariables = {
        NAMN: 'Anna Andersson',
        INTRESSETITEL: 'Grundkurs i Improvisation'
      };
      
      // Replace variables (same as send-interest-confirmation)
      Object.entries(mockVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        processedContent = processedContent.replace(regex, value);
      });
    } else if (templateType?.key === 'corporate_inquiry') {
      mockVariables = {
        NAMN: 'Anna Andersson',
        FÖRETAG: 'Företag AB',
        TILLFÄLLE: 'Personalfest 2025'
      };
      
      // Replace variables (same as send-inquiry)
      Object.entries(mockVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        processedContent = processedContent.replace(regex, value);
      });
    } else if (templateType?.key === 'private_inquiry') {
      mockVariables = {
        NAMN: 'Anna Andersson',
        TILLFÄLLE: 'Födelsedag'
      };
      
      // Replace variables (same as send-inquiry)
      Object.entries(mockVariables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'gi');
        processedContent = processedContent.replace(regex, value);
      });
    }
    
    // Replace QR code placeholder with mock QR code
    processedContent = processedContent.replace(
      '[QR_CODE_PLACEHOLDER]', 
      '<div style="margin: 20px 0;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiPkxJVDIwMjRBQkMxMjM8L3RleHQ+PC9zdmc+" alt="QR Code" style="max-width: 200px; display: block;"></div>'
    );

    // Replace subject with variables
    let personalizedSubject = template.subject;
    Object.entries(mockVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
    });
    
    // Use the unified template exactly like the edge functions
    const htmlContent = createUnifiedEmailTemplate(
      personalizedSubject,
      processedContent,
      template.background_image
    ).replace('{UNSUBSCRIBE_URL}', 'https://improteatern.se/avprenumerera?email=preview@example.com');
    
    return htmlContent;
  };

  if (isLoading) {
    return <div>Laddar automatiska mejlmallar...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Hantera mallar för automatiska mejl som skickas från systemet.
        </p>
      </div>

      <div className="grid gap-4">
        {AUTOMATIC_EMAIL_TYPES.map((emailType) => {
          const existingTemplate = templates?.find(t => t.name === emailType.dbName);
          
          return (
            <Card key={emailType.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{emailType.name}</CardTitle>
                    <CardDescription>{emailType.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {existingTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(existingTemplate)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(emailType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <strong>Tillgängliga variabler:</strong> {emailType.variables.map(v => `{${v}}`).join(', ')}
                </div>
                {existingTemplate && (
                  <div className="mt-2 text-sm">
                    <strong>Nuvarande ämne:</strong> {existingTemplate.subject}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera {editingTemplate?.name?.replace(/^AUTO: /, '')}</DialogTitle>
            <DialogDescription>
              Anpassa ämne och innehåll för automatiska mejl.
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Ämne</Label>
                  <Input
                    id="subject"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="background_image">Bakgrundsbild URL (valfritt)</Label>
                  <Input
                    id="background_image"
                    value={editingTemplate.background_image || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      background_image: e.target.value
                    })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Innehåll</Label>
                  <Textarea
                    id="content"
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      content: e.target.value
                    })}
                    rows={12}
                    placeholder="Skriv mejlinnehållet här. Använd H1: för stora rubriker och H2: för mindre rubriker."
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saveTemplateMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Spara
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Avbryt
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Förhandsvisning</Label>
                <div 
                  className="border rounded-lg bg-white max-h-96 overflow-y-auto"
                  style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}
                  dangerouslySetInnerHTML={{ 
                    __html: createEmailHtml(editingTemplate)
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Förhandsvisning: {previewTemplate?.name?.replace(/^AUTO: /, '')}</DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div 
              className="border rounded-lg bg-white"
              style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}
              dangerouslySetInnerHTML={{ 
                __html: createEmailHtml(previewTemplate)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions for default content
function getDefaultSubject(type: string): string {
  switch (type) {
    case 'course_confirmation': return 'Välkommen till {KURSTITEL}';
    case 'interest_confirmation': return 'Tack för din intresseanmälan - {INTRESSETITEL}';
    case 'ticket_confirmation': return 'Dina biljetter till {FORESTALLNING}';
    case 'corporate_inquiry': return 'Bekräftelse av företagsförfrågan';
    case 'private_inquiry': return 'Bekräftelse av förfrågan';
    default: return 'Bekräftelse';
  }
}

function getDefaultContent(type: string): string {
  switch (type) {
    case 'course_confirmation':
      return `H1: Välkommen till {KURSTITEL}

Hej {NAMN}!

Vi ser fram emot att träffa dig på kursen!

H2: Praktisk information

Kursen startar: {STARTDATUM} kl {STARTTID}

Mer information kommer att skickas ut innan kursstart.`;

    case 'interest_confirmation':
      return `H1: Tack för din intresseanmälan

Hej {NAMN}!

Vi har tagit emot din intresseanmälan för {INTRESSETITEL}.

Vi kommer att kontakta dig så snart vi har mer information.`;

    case 'ticket_confirmation':
      return `H1: Dina biljetter

Hej {NAMN}!

Tack för ditt köp! Här är dina biljetter till {FORESTALLNING}.`;

    case 'corporate_inquiry':
      return `H1: Tack för din förfrågan!

Hej {NAMN}!

Vi har tagit emot din företagsförfrågan och kommer att kontakta dig så snart som möjligt för att diskutera möjligheterna.

H2: Dina uppgifter

Företag: {FÖRETAG}
Tillfälle: {TILLFÄLLE}

Vi ser fram emot att skapa något fantastiskt för er organisation!

H2: Kontakta oss

Har du frågor? Kontakta oss på kontakt@improteatern.se eller besök improteatern.se

Med vänliga hälsningar
Lilla Improteatern`;

    case 'private_inquiry':
      return `H1: Tack för din förfrågan!

Hej {NAMN}!

Vi har tagit emot din förfrågan och kommer att kontakta dig så snart som möjligt för att diskutera möjligheterna.

H2: Ditt tillfälle

Tillfälle: {TILLFÄLLE}

Vi ser fram emot att göra ert tillfälle extra speciellt!

H2: Kontakta oss

Har du frågor? Kontakta oss på kontakt@improteatern.se eller besök improteatern.se

Med vänliga hälsningar
Lilla Improteatern`;

    default:
      return 'H1: Bekräftelse\n\nTack för ditt meddelande!';
  }
}
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
    key: 'newsletter_confirmation',
    name: 'Nyhetsbrev bekräftelse',
    description: 'Skickas när någon registrerar sig för nyhetsbrev',
    variables: ['NAMN', 'BEKRAFTELSELANK']
  },
  {
    key: 'course_confirmation',
    name: 'Kursbekräftelse',
    description: 'Skickas när någon bokar en kurs',
    variables: ['NAMN', 'KURSTITEL', 'STARTDATUM', 'STARTTID']
  },
  {
    key: 'interest_confirmation',
    name: 'Intresseanmälan bekräftelse',
    description: 'Skickas när någon anmäler intresse',
    variables: ['NAMN', 'INTRESSETITEL']
  },
  {
    key: 'inquiry_confirmation',
    name: 'Förfrågningsbekräftelse',
    description: 'Skickas när någon skickar en förfrågan',
    variables: ['NAMN', 'FORETAG']
  },
  {
    key: 'ticket_confirmation',
    name: 'Biljettbekräftelse',
    description: 'Skickas när någon köper biljetter',
    variables: ['NAMN', 'FORESTALLNING', 'DATUM', 'BILJETTKOD']
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
        .in('name', AUTOMATIC_EMAIL_TYPES.map(type => `AUTO: ${type.name}`))
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
    const existingTemplate = templates?.find(t => t.name === `AUTO: ${emailType.name}`);
    
    if (existingTemplate) {
      setEditingTemplate(existingTemplate);
    } else {
      // Create new template
      setEditingTemplate({
        id: '',
        name: `AUTO: ${emailType.name}`,
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
    // Process content to handle headers and paragraphs (same as in SimpleEmailBuilder)
    const processedContent = template.content
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        if (trimmed.startsWith('H1: ')) {
          const headerText = trimmed.substring(4);
          return `<h1 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 32px; color: #333333; margin: 24px 0 16px 0; font-weight: 400; line-height: 1.2;">${headerText}</h1>`;
        }
        
        if (trimmed.startsWith('H2: ')) {
          const headerText = trimmed.substring(4);
          return `<h2 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 24px; color: #333333; margin: 20px 0 12px 0; font-weight: 400; line-height: 1.2;">${headerText}</h2>`;
        }
        
        return `<p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333; margin: 0 0 16px 0; line-height: 1.6;">${trimmed}</p>`;
      })
      .filter(line => line)
      .join('');

    return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Tanker&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Satoshi', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    ${template.background_image ? `
      <div style="width: 100%; height: 200px; background-image: url('${template.background_image}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
      </div>
    ` : ''}
    
    <div style="padding: 20px; background-color: #ffffff;">
      ${processedContent}
    </div>
    
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; color: white; text-align: center;">
      <div style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 24px; font-weight: 400; margin-bottom: 8px;">
        LILLA IMPROTEATERN
      </div>
      <div style="font-family: 'Satoshi', Arial, sans-serif; font-size: 14px; opacity: 0.9; margin-bottom: 16px;">
        Improvisationsteater • Kurser • Föreställningar
      </div>
      <div style="font-family: 'Satoshi', Arial, sans-serif; font-size: 12px; opacity: 0.8;">
        <a href="https://improteatern.se" style="color: white; text-decoration: none;">improteatern.se</a>
      </div>
    </div>
    
  </div>
</body>
</html>`;
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
          const existingTemplate = templates?.find(t => t.name === `AUTO: ${emailType.name}`);
          
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
            <DialogTitle>Redigera {editingTemplate?.name?.replace('AUTO: ', '')}</DialogTitle>
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
                  className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto"
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
            <DialogTitle>Förhandsvisning: {previewTemplate?.name?.replace('AUTO: ', '')}</DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div 
              className="border rounded-lg p-4 bg-gray-50"
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
    case 'newsletter_confirmation': return 'Bekräfta din prenumeration';
    case 'course_confirmation': return 'Välkommen till {KURSTITEL}';
    case 'interest_confirmation': return 'Tack för din intresseanmälan';
    case 'inquiry_confirmation': return 'Bekräftelse av förfrågan';
    case 'ticket_confirmation': return 'Dina biljetter till {FORESTALLNING}';
    default: return 'Bekräftelse';
  }
}

function getDefaultContent(type: string): string {
  switch (type) {
    case 'newsletter_confirmation':
      return `H1: Bekräfta din prenumeration

Hej {NAMN}!

Tack för att du vill prenumerera på vårt nyhetsbrev! För att bekräfta din registrering, klicka på länken nedan:

{BEKRAFTELSELANK}

Om du inte begärde denna prenumeration kan du ignorera detta meddelande.`;

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

    case 'inquiry_confirmation':
      return `H1: Tack för din förfrågan

Hej {NAMN}!

Vi har tagit emot din förfrågan och kommer att kontakta dig så snart som möjligt.`;

    case 'ticket_confirmation':
      return `H1: Dina biljetter

Hej {NAMN}!

Tack för ditt köp! Här är dina biljetter till {FORESTALLNING} den {DATUM}.

Biljettkod: {BILJETTKOD}`;

    default:
      return 'H1: Bekräftelse\n\nTack för ditt meddelande!';
  }
}
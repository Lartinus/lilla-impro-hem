import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImagePicker } from '../ImagePicker';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate, EmailGroup, EmailContact, GroupMember } from './types';
import { FormattingButtons } from './FormattingButtons';

interface EmailSendFormProps {
  emailTemplates: EmailTemplate[];
  emailGroups: EmailGroup[];
  emailContacts: EmailContact[];
  templatesLoading: boolean;
}

export function EmailSendForm({
  emailTemplates,
  emailGroups,
  emailContacts,
  templatesLoading
}: EmailSendFormProps) {
  // Filter out automatic templates (those starting with "AUTO:")
  const nonAutoTemplates = emailTemplates.filter(template => !template.name.startsWith('AUTO:'));
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [bulkEmailTemplateData, setBulkEmailTemplateData] = useState({
    background_image: '',
    content: ''
  });

  // Fetch group members for the selected group
  const { data: selectedGroupMembers = [] } = useQuery({
    queryKey: ['send-email-group-members', selectedRecipients],
    queryFn: async () => {
      if (!selectedRecipients || selectedRecipients === 'all') return [];
      
      const { data, error } = await supabase
        .from('email_group_members')
        .select(`
          id,
          group_id,
          contact_id,
          contact:email_contacts(*)
        `)
        .eq('group_id', selectedRecipients);

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!selectedRecipients && selectedRecipients !== 'all'
  });

  const handleUseTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    setSelectedTemplate(template.id);
    
    setBulkEmailTemplateData({
      background_image: template.background_image || '',
      content: template.content || ''
    });
  };

  const insertHeader = (level: number) => {
    const headerPrefix = level === 2 ? '## ' : '### ';
    const currentContent = bulkEmailTemplateData.content;
    const newContent = currentContent + (currentContent ? '\n\n' : '') + headerPrefix + 'Ny rubrik';
    
    setBulkEmailTemplateData({
      ...bulkEmailTemplateData,
      content: newContent
    });
  };

  const createSimpleEmailTemplate = (subject: string, textContent: string, backgroundImage?: string) => {
    const hasBackground = backgroundImage && backgroundImage.trim() !== '';
    // Convert simple text to HTML paragraphs - no markdown
    const htmlContent = textContent
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        return `<p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; text-align: left; line-height: 1.6;">${trimmed}</p>`;
      })
      .filter(line => line)
      .join('');
    
    return `
      <!DOCTYPE html>
      <html lang="sv" style="margin: 0; padding: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
        <link href="https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap" rel="stylesheet">
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background-color: #EBEBEB;
        line-height: 1.6;
        color: #333333;
      ">
        <div style="max-width: 600px; margin: 0 auto; background-color: #EBEBEB;">
          ${hasBackground ? `
            <div style="
              text-align: center;
              padding: 0;
              margin: 0;
            ">
              <img src="${backgroundImage}" alt="" style="
                width: 600px;
                height: 400px;
                object-fit: cover;
                display: block;
                margin: 0 auto;
              "/>
            </div>
          ` : ''}
          
          <div style="
            max-width: 600px;
            margin: ${hasBackground ? '-50px auto 0' : '0 auto'};
            padding: 40px;
            background-color: #F3F3F3;
            border-radius: 10px;
            position: relative;
            z-index: 1;
          ">
            <div style="
              font-size: 16px;
              line-height: 1.6;
              color: #333333;
              font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            ">
              ${htmlContent}
            </div>
          </div>
          
          <!-- Red footer -->
          <div style="
            width: 600px;
            height: 180px;
            background-color: #DC2626;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          ">
            <div style="
              font-family: 'Tanker', cursive;
              font-size: 32px;
              color: white;
              margin: 0 0 16px 0;
              line-height: 1;
            ">
              LILLA IMPROTEATERN
            </div>
            <div style="
              font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              font-size: 16px;
              color: white;
              margin: 0;
              line-height: 1.2;
            ">
              Vill du inte längre få våra mejl? <a href="#" style="color: white; text-decoration: underline;">Avprenumerera här</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !bulkEmailTemplateData.content.trim()) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Ämne och innehåll är obligatoriska.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRecipients) {
      toast({
        title: "Inga mottagare valda",
        description: "Du måste välja vilka som ska få mejlet.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let recipients: string[] = [];
      if (selectedRecipients === 'all') {
        recipients = emailContacts.map(contact => contact.email);
      } else {
        const members = selectedGroupMembers.map(member => member.contact.email);
        recipients = members;
      }

      if (recipients.length === 0) {
        toast({
          title: "Inga mottagare",
          description: "Det finns inga email-adresser att skicka till.",
          variant: "destructive",
        });
        return;
      }

      const htmlContent = createSimpleEmailTemplate(emailSubject, bulkEmailTemplateData.content, bulkEmailTemplateData.background_image);

      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          recipients,
          subject: emailSubject,
          content: htmlContent,
          group_name: selectedRecipients === 'all' ? 'Alla kontakter' : emailGroups.find(g => g.id === selectedRecipients)?.name
        }
      });

      if (error) throw error;

      const { sent, total, errors } = data;
      
      toast({
        title: "Mejl skickat!",
        description: `Mejlet har skickats till ${sent} av ${total} mottagare.${errors && errors.length > 0 ? ` ${errors.length} mejl kunde inte skickas.` : ''}`,
      });
      
      setEmailSubject('');
      setEmailContent('');
      setSelectedRecipients('');
      setSelectedTemplate('');
      setBulkEmailTemplateData({ background_image: '', content: '' });
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "Fel vid skickning",
        description: error.message || "Det gick inte att skicka mejlet. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Skicka meddelande
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="recipients">Mottagare</Label>
          <Select value={selectedRecipients} onValueChange={setSelectedRecipients}>
            <SelectTrigger>
              <SelectValue placeholder="Välj mottagare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla kontakter</SelectItem>
              {emailGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Använd befintlig mall (valfritt)</Label>
          <Select value={selectedTemplate} onValueChange={(value) => {
            if (value) {
              const template = nonAutoTemplates.find(t => t.id === value);
              if (template) {
                handleUseTemplate(template);
              }
            } else {
              setSelectedTemplate('');
              setEmailSubject('');
              setEmailContent('');
              setBulkEmailTemplateData({ background_image: '', content: '' });
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Välj en mall att börja med" />
            </SelectTrigger>
            <SelectContent>
              {nonAutoTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Ämne</Label>
          <Input
            id="subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Skriv ämnesraden här..."
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Design</h3>
          
          <div className="space-y-2">
            <Label htmlFor="text-content">Innehåll (enkel text)</Label>
            <FormattingButtons onInsertHeader={insertHeader} />
            <Textarea
              id="text-content"
              value={bulkEmailTemplateData.content}
              onChange={(e) => setBulkEmailTemplateData({...bulkEmailTemplateData, content: e.target.value})}
              placeholder="Skriv din text här...&#10;&#10;Ny rad blir automatiskt nytt stycke."
              rows={10}
            />
            <p className="text-sm text-muted-foreground">
              Skriv enkel text - varje rad blir ett eget stycke. Inga rubriker eller formatering behövs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Bakgrundsbild (valfritt)</Label>
              <ImagePicker
                value={bulkEmailTemplateData.background_image}
                onSelect={(url) => setBulkEmailTemplateData({...bulkEmailTemplateData, background_image: url})}
                triggerClassName="h-8 px-3 text-sm"
              />
            </div>
            {bulkEmailTemplateData.background_image && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                <span className="font-medium">Vald bild:</span> {bulkEmailTemplateData.background_image.split('/').pop()}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Förhandsvisning</Label>
          <div className="border rounded p-4 bg-muted/50 max-h-[400px] overflow-y-auto preview-content">
            {bulkEmailTemplateData.content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: createSimpleEmailTemplate(emailSubject, bulkEmailTemplateData.content, bulkEmailTemplateData.background_image)
                }}
                className="[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                style={{ 
                  fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                  '--font-family': "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
                } as React.CSSProperties}
              />
            ) : (
              <p className="text-muted-foreground text-sm">Skriv textinnehåll för att se förhandsvisningen...</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSendEmail} 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Skickar...' : 'Skicka meddelande'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
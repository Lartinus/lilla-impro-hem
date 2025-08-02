import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Heading1, Heading2, Send, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImagePicker } from '../ImagePicker';
import { supabase } from '@/integrations/supabase/client';
import { EmailGroup, EmailContact, GroupMember, EmailTemplate } from './types';

interface SimpleEmailBuilderProps {
  emailGroups: EmailGroup[];
  emailContacts: EmailContact[];
  emailTemplates: EmailTemplate[];
}

export function SimpleEmailBuilder({ emailGroups, emailContacts, emailTemplates }: SimpleEmailBuilderProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter out automatic templates (those starting with "AUTO:")
  const nonAutoTemplates = emailTemplates.filter(template => !template.name.startsWith('AUTO:'));

  // Fetch group members for the selected group
  const { data: selectedGroupMembers = [] } = useQuery({
    queryKey: ['email-group-members', selectedRecipients],
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

  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('email-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + textToInsert + content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const insertHeader = (level: 1 | 2) => {
    const textarea = document.getElementById('email-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prefix = level === 1 ? 'H1: ' : 'H2: ';
    
    // If text is selected, insert prefix at the beginning of selection
    if (start !== end) {
      const selectedText = content.substring(start, end);
      const newContent = content.substring(0, start) + prefix + selectedText + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after the inserted prefix
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      // No text selected, just insert the prefix
      insertAtCursor(prefix);
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setContent(template.content);
    setBackgroundImage(template.background_image || '');
    setSelectedTemplate(template.id);
  };

  const createEmailHtml = (emailSubject: string, emailContent: string, bgImage?: string) => {
    // Process content to handle headers and paragraphs
    const processedContent = emailContent
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // Handle H1 headers
        if (trimmed.startsWith('H1: ')) {
          const headerText = trimmed.substring(4);
          return `<h1 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 32px; color: #333333; margin: 24px 0 16px 0; font-weight: 400; line-height: 1.2;">${headerText}</h1>`;
        }
        
        // Handle H2 headers
        if (trimmed.startsWith('H2: ')) {
          const headerText = trimmed.substring(4);
          return `<h2 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 24px; color: #333333; margin: 20px 0 12px 0; font-weight: 400; line-height: 1.2;">${headerText}</h2>`;
        }
        
        // Regular paragraphs
        return `<p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333; margin: 0 0 16px 0; line-height: 1.6;">${trimmed}</p>`;
      })
      .filter(line => line)
      .join('');

    return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Tanker:wght@400&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    ${bgImage ? `
      <div style="width: 100%; height: 400px; overflow: hidden;">
        <img src="${bgImage}" alt="Header image" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      </div>
    ` : ''}
    
    <div style="padding: 20px; background-color: #ffffff; color: #333333;">
      ${processedContent}
    </div>
    
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; color: white; text-align: center;">
      <div style="font-family: 'Tanker', 'Helvetica Neue', sans-serif; font-size: 24px; font-weight: 400; margin-bottom: 8px; color: white;">
        LILLA IMPROTEATERN
      </div>
      <div style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif; font-size: 14px; opacity: 0.9; margin-bottom: 16px; color: white;">
        Improvisationsteater • Kurser • Föreställningar
      </div>
      <div style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif; font-size: 12px; opacity: 0.8; color: white;">
        <a href="https://improteatern.se" style="color: white; text-decoration: none;">improteatern.se</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handleSendEmail = async () => {
    if (!subject.trim() || !content.trim()) {
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
        recipients = selectedGroupMembers.map(member => member.contact.email);
      }

      if (recipients.length === 0) {
        toast({
          title: "Inga mottagare",
          description: "Det finns inga email-adresser att skicka till.",
          variant: "destructive",
        });
        return;
      }

      const htmlContent = createEmailHtml(subject, content, backgroundImage);

      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          recipients,
          subject,
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
      
      // Reset form
      setSubject('');
      setContent('');
      setBackgroundImage('');
      setSelectedRecipients('');
      setSelectedTemplate('');
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
        <CardTitle className="text-lg">Skapa och skicka mejl</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selector */}
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

        {/* Recipients */}
        <div className="space-y-2">
          <Label htmlFor="recipients">Mottagare</Label>
          <Select value={selectedRecipients} onValueChange={setSelectedRecipients}>
            <SelectTrigger>
              <SelectValue placeholder="Välj mottagare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla kontakter ({emailContacts.length})</SelectItem>
              {emailGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Ämne</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Skriv ämnesraden här..."
          />
        </div>

        {/* Background Image */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Header-bild (600x400px)</Label>
            <ImagePicker
              value={backgroundImage}
              onSelect={setBackgroundImage}
              triggerClassName="h-8 px-3 text-sm"
            />
          </div>
          {backgroundImage && (
            <div className="space-y-2">
              <img 
                src={backgroundImage} 
                alt="Förhandsvisning"
                className="w-full max-w-[300px] h-[200px] object-cover rounded border"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setBackgroundImage('')}
              >
                Ta bort bild
              </Button>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <Label htmlFor="email-content">Innehåll</Label>
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertHeader(1)}
              className="h-8 px-3"
            >
              <Heading1 className="w-4 h-4 mr-1" />
              Stor rubrik
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertHeader(2)}
              className="h-8 px-3"
            >
              <Heading2 className="w-4 h-4 mr-1" />
              Liten rubrik
            </Button>
          </div>
          <Textarea
            id="email-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Skriv din text här...&#10;&#10;För rubriker, använd knapparna ovan eller skriv:&#10;H1: För stor rubrik&#10;H2: För liten rubrik&#10;&#10;Vanlig text blir automatiskt till stycken."
            rows={12}
          />
          <p className="text-sm text-muted-foreground">
            Tips: Klicka i texten där du vill sätta in en rubrik, sedan klicka på rubrikknappen.
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Förhandsvisning</Label>
          <div className="border rounded max-h-[500px] overflow-y-auto">
            {content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: createEmailHtml(subject || 'Ämne', content, backgroundImage)
                }}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Skriv innehåll för att se förhandsvisningen
              </div>
            )}
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSendEmail} 
            disabled={isLoading}
            size="lg"
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Skickar...' : 'Skicka mejl'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
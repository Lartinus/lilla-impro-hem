import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Send, Users, Eye, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImagePicker } from './ImagePicker';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  background_image?: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

interface EmailGroup {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface EmailContact {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  contact_id: string;
  contact: EmailContact;
}

interface EmailManagementProps {
  activeTab?: string;
}

export function EmailManagement({ activeTab = 'send' }: EmailManagementProps) {
  // Core state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    background_image: '',
    description: ''
  });
  
  // State for bulk email template data
  const [bulkEmailTemplateData, setBulkEmailTemplateData] = useState({
    background_image: '',
    content: ''
  });
  
  // New state for group management
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EmailGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });

  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Fetch email groups
  const { data: emailGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['email-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_groups')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as EmailGroup[];
    }
  });

  // Fetch email contacts
  const { data: emailContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['email-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailContact[];
    }
  });

  // Fetch group members for a specific group
  const { data: groupMembers = [] } = useQuery({
    queryKey: ['group-members', selectedRecipients],
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

  // Handle template selection for bulk email
  const handleUseTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    setSelectedTemplate(template.id);
    
    // Store template data for preview
    setBulkEmailTemplateData({
      background_image: template.background_image || '',
      content: template.content || ''
    });
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Namn, ämne och innehåll är obligatoriska.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: templateForm.name,
            subject: templateForm.subject,
            content: templateForm.content,
            background_image: templateForm.background_image,
            description: templateForm.description
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Mall uppdaterad!",
          description: "Email-mallen har uppdaterats.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: templateForm.name,
            subject: templateForm.subject,
            content: templateForm.content,
            background_image: templateForm.background_image,
            description: templateForm.description
          });

        if (error) throw error;

        toast({
          title: "Mall skapad!",
          description: "Email-mallen har skapats.",
        });
      }
      
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', content: '', background_image: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error: any) {
      console.error('Template save error:', error);
      toast({
        title: "Fel vid sparning",
        description: error.message || "Det gick inte att spara mallen.",
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        background_image: template.background_image || '',
        description: template.description || ''
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', content: '', background_image: '', description: '' });
    }
    setIsTemplateDialogOpen(true);
  };

  // Function to create simple HTML email content with new template design
  const createSimpleEmailTemplate = (subject: string, markdownContent: string, backgroundImage?: string) => {
    const hasBackground = backgroundImage && backgroundImage.trim() !== '';
    
    // Convert markdown to HTML
    const htmlContent = convertMarkdownToHtml(markdownContent);
    
    return `
      <!DOCTYPE html>
      <html lang="sv" style="margin: 0; padding: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background-color: #ffffff;
        line-height: 1.6;
        color: #333333;
      ">
        ${hasBackground ? `
          <!-- Image Section -->
          <div style="
            text-align: center;
            padding: 0;
            margin: 0;
          ">
            <img src="${backgroundImage}" alt="" style="
              width: 100%;
              max-width: 600px;
              height: auto;
              aspect-ratio: 1;
              object-fit: cover;
              display: block;
              margin: 0 auto;
            "/>
          </div>
        ` : ''}
        
        <!-- Content Section -->
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
        ">
          <div style="
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
          ">
            ${htmlContent}
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background-color: #f9f9f9;
          padding: 40px 20px;
          text-align: center;
        ">
          <div style="max-width: 600px; margin: 0 auto;">
            <img src="/uploads/LIT_red_large.png" alt="Lilla Improteatern" style="
              width: 180px;
              height: auto;
              margin: 0 auto 20px auto;
              display: block;
            "/>
            <p style="
              font-size: 12px;
              color: #999999;
              margin: 0;
            ">
              Vill du inte längre få våra mejl? 
              <a href="https://improteatern.se/avprenumerera" style="
                color: #666666;
                text-decoration: underline;
              ">
                Avprenumerera här
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailContent) {
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
      // Get recipients
      let recipients: string[] = [];
      if (selectedRecipients === 'all') {
        recipients = emailContacts.map(contact => contact.email);
      } else {
        // Get group members
        const members = groupMembers.map(member => member.contact.email);
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

      // Convert markdown to HTML and create simple template
      const htmlContent = createSimpleEmailTemplate(emailSubject, bulkEmailTemplateData.content, bulkEmailTemplateData.background_image);

      // Send bulk email
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
      
      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedRecipients('');
      setSelectedTemplate('');
      setAttachments([]);
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

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna mall?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Mall borttagen",
        description: "Email-mallen har tagits bort.",
      });

      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error: any) {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Det gick inte att ta bort mallen.",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'send':
        return renderSendEmail();
      case 'templates':
        return renderTemplates();
      case 'groups':
        return renderGroups();
      case 'contacts':
        return renderContacts();
      default:
        return renderSendEmail();
    }
  };

  const renderSendEmail = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Skicka meddelande
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipients Selection */}
        <div className="space-y-2">
          <Label htmlFor="recipients">Mottagare</Label>
          <Select value={selectedRecipients} onValueChange={setSelectedRecipients}>
            <SelectTrigger>
              <SelectValue placeholder="Välj mottagare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Alla kontakter ({emailContacts.length} st)
                </div>
              </SelectItem>
              {emailGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {group.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRecipients && selectedRecipients !== 'all' && (
            <div className="text-sm text-muted-foreground">
              {groupMembers.length} kontakter i denna grupp
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Använd mall (valfritt)</Label>
          <Select value={selectedTemplate} onValueChange={(value) => {
            if (value && value !== '') {
              const template = emailTemplates.find(t => t.id === value);
              if (template) {
                handleUseTemplate(template);
              }
            } else {
              setSelectedTemplate('');
              setEmailSubject('');
              setEmailContent('');
              setAttachments([]);
              setBulkEmailTemplateData({ background_image: '', content: '' });
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Välj en mall att börja med" />
            </SelectTrigger>
            <SelectContent>
              {emailTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
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
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Skriv ämnesraden här..."
          />
        </div>


        {/* Design Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Design</h3>
          
          <div className="space-y-2">
            <Label htmlFor="markdown-content">Innehåll (Markdown)</Label>
            <Textarea
              id="markdown-content"
              value={bulkEmailTemplateData.content}
              onChange={(e) => setBulkEmailTemplateData({...bulkEmailTemplateData, content: e.target.value})}
              placeholder="# Rubrik&#10;&#10;Här kommer brödtexten...&#10;&#10;## Underrubrik&#10;&#10;Mer text här."
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Använd Markdown för formatering: # för stora rubriker, ## för mellanrubriker, ### för smårubriker, **fet text**, *kursiv text*, [länktext](url), - för punktlistor, 1. för numrerade listor, &gt; för citat. För radbryt: &lt;br&gt; eller dubbla mellanslag följt av radbryt. För centrerad text: &lt;center&gt;text&lt;/center&gt;.
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

        {/* Email Preview */}
        <div className="space-y-2">
          <Label>Förhandsvisning</Label>
          <div className="border rounded p-4 bg-muted/50 max-h-[400px] overflow-y-auto preview-content">
            {bulkEmailTemplateData.content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: createSimpleEmailTemplate(emailSubject, bulkEmailTemplateData.content, bulkEmailTemplateData.background_image)
                }}
                className="[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Skriv markdown-innehåll för att se förhandsvisningen...</p>
            )}
          </div>
        </div>

        {/* Send Button */}
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

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Email-mallar</h3>
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleEditTemplate()}>
              <Plus className="h-4 w-4 mr-2" />
              Ny mall
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Redigera mall' : 'Skapa ny mall'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Mallnamn</Label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="T.ex. Välkommen till kursen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-subject">Ämnesrad</Label>
                <Input
                  id="template-subject"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ämnesrad för mejlet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Beskrivning (valfritt)</Label>
                <Input
                  id="template-description"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kort beskrivning av vad mallen används till"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bakgrundsbild (valfritt)</Label>
                  <ImagePicker
                    value={templateForm.background_image}
                    onSelect={(url) => setTemplateForm(prev => ({ ...prev, background_image: url }))}
                    triggerClassName="h-8 px-3 text-sm"
                  />
                </div>
                {templateForm.background_image && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    <span className="font-medium">Vald bild:</span> {templateForm.background_image.split('/').pop()}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Innehåll (Markdown)</Label>
                <Textarea
                  id="template-content"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="# Rubrik&#10;&#10;Här kommer brödtexten...&#10;&#10;## Underrubrik&#10;&#10;Mer text här."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Använd Markdown för formatering: # för rubriker, **fet text**, *kursiv text*, etc.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Förhandsvisning</Label>
                <div className="border rounded p-4 bg-muted/50 max-h-[300px] overflow-y-auto">
                  {templateForm.content ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: createSimpleEmailTemplate(templateForm.subject, templateForm.content, templateForm.background_image)
                    }} />
                  ) : (
                    <p className="text-muted-foreground text-sm">Skriv innehåll för att se förhandsvisningen...</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? 'Uppdatera' : 'Skapa'} mall
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {emailTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ämne: {template.subject}
                  </p>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div className="max-h-20 overflow-hidden">
                  {template.content.substring(0, 150)}
                  {template.content.length > 150 && '...'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGroups = () => (
    <Card>
      <CardHeader>
        <CardTitle>Email-grupper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emailGroups.map((group) => (
            <div key={group.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h4 className="font-medium">{group.name}</h4>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderContacts = () => (
    <Card>
      <CardHeader>
        <CardTitle>Email-kontakter ({emailContacts.length} st)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {emailContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-2 border rounded text-sm">
              <div>
                <span className="font-medium">{contact.email}</span>
                {contact.name && <span className="ml-2 text-muted-foreground">({contact.name})</span>}
              </div>
              <Badge variant="outline" className="text-xs">
                {contact.source || 'okänd'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Email-hantering</h2>
      </div>

      {renderContent()}
    </div>
  );

}
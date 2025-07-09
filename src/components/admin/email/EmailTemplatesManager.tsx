import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImagePicker } from '../ImagePicker';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate } from './types';

interface EmailTemplatesManagerProps {
  emailTemplates: EmailTemplate[];
  templatesLoading: boolean;
}

export function EmailTemplatesManager({ emailTemplates, templatesLoading }: EmailTemplatesManagerProps) {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    background_image: '',
    description: ''
  });

  const queryClient = useQueryClient();

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

  const createPreviewEmailTemplate = (subject: string, markdownContent: string, backgroundImage?: string) => {
    const hasBackground = backgroundImage && backgroundImage.trim() !== '';
    
    const htmlContent = convertMarkdownToHtml(markdownContent);
    
    return `
      <!DOCTYPE html>
      <html lang="sv" style="margin: 0; padding: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background-color: #ffffff;
        line-height: 1.6;
        color: #333333;
      ">
        ${hasBackground ? `
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
            font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          ">
            ${htmlContent}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Email-mallar</h3>
        <Button onClick={() => handleEditTemplate()} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ny mall
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tillgängliga mallar</CardTitle>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="text-center py-4">Laddar mallar...</div>
          ) : emailTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Inga mallar hittades. Skapa din första mall!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                   <TableHead>Ämne</TableHead>
                   <TableHead>Skapad</TableHead>
                   <TableHead className="w-[120px]">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString('sv-SE')}
                    </TableCell>
                     <TableCell>
                       <div className="flex gap-2">
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => handlePreviewTemplate(template)}
                           title="Förhandsgranska"
                         >
                           <Eye className="w-4 h-4" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => handleEditTemplate(template)}
                           title="Redigera"
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => handleDeleteTemplate(template.id)}
                           title="Ta bort"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Redigera mall' : 'Skapa ny mall'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Namn</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                placeholder="Mallens namn"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Beskrivning (valfritt)</Label>
              <Input
                id="template-description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                placeholder="Kort beskrivning av mallen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Ämne</Label>
              <Input
                id="template-subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                placeholder="Standard ämnesrad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-content">Innehåll (Markdown)</Label>
              <Textarea
                id="template-content"
                value={templateForm.content}
                onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                placeholder="# Rubrik&#10;&#10;Här kommer brödtexten..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Bakgrundsbild (valfritt)</Label>
                <ImagePicker
                  value={templateForm.background_image}
                  onSelect={(url) => setTemplateForm({...templateForm, background_image: url})}
                  triggerClassName="h-8 px-3 text-sm"
                />
              </div>
              {templateForm.background_image && (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  <span className="font-medium">Vald bild:</span> {templateForm.background_image.split('/').pop()}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Uppdatera' : 'Skapa'} mall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Förhandsvisning: {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded p-4 bg-muted/50 max-h-[60vh] overflow-y-auto">
            {previewTemplate && (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: createPreviewEmailTemplate(
                    previewTemplate.subject, 
                    previewTemplate.content, 
                    previewTemplate.background_image || undefined
                  )
                }}
                className="[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-2 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                style={{ fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Stäng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
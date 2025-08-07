import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePicker } from '../ImagePicker';
import { EmailTemplate } from './types';
import { Heading1, Heading2 } from 'lucide-react';

interface TemplateForm {
  name: string;
  subject: string;
  content: string;
  background_image: string;
  description: string;
}

interface EmailTemplateFormProps {
  editingTemplate: EmailTemplate | null;
  templateForm: TemplateForm;
  onFormChange: (form: TemplateForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EmailTemplateForm({ 
  editingTemplate, 
  templateForm, 
  onFormChange, 
  onSave, 
  onClose 
}: EmailTemplateFormProps) {
  const updateForm = (updates: Partial<TemplateForm>) => {
    onFormChange({ ...templateForm, ...updates });
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const current = templateForm.content || '';
    const newContent = current.substring(0, start) + textToInsert + current.substring(end);

    updateForm({ content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const insertHeader = (level: 1 | 2) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const prefix = level === 1 ? 'H1: ' : 'H2: ';

    if (start !== end) {
      const current = templateForm.content || '';
      const selectedText = current.substring(start, end);
      const newContent = current.substring(0, start) + prefix + selectedText + current.substring(end);
      updateForm({ content: newContent });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      insertAtCursor(prefix);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {editingTemplate ? 'Redigera mall' : 'Skapa ny mall'}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Namn</Label>
          <Input
            id="template-name"
            value={templateForm.name}
            onChange={(e) => updateForm({ name: e.target.value })}
            placeholder="Mallens namn"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="template-description">Beskrivning (valfritt)</Label>
          <Input
            id="template-description"
            value={templateForm.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Kort beskrivning av mallen"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-subject">Ämne</Label>
          <Input
            id="template-subject"
            value={templateForm.subject}
            onChange={(e) => updateForm({ subject: e.target.value })}
            placeholder="Standard ämnesrad"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-content">Innehåll</Label>
          <div className="flex gap-2">
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
            id="template-content"
            value={templateForm.content}
            onChange={(e) => updateForm({ content: e.target.value })}
            placeholder={"Skriv din text här...\n\nFör rubriker, använd knapparna ovan eller skriv:\nH1: Stor rubrik\nH2: Liten rubrik\n\nVarje rad blir automatiskt ett stycke."}
            rows={12}
          />
          <div className="text-xs text-muted-foreground">
            Tips: Klicka där du vill sätta in en rubrik och tryck på knappen. Varje ny rad blir ett eget stycke.
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bakgrundsbild (valfritt)</Label>
            <ImagePicker
              value={templateForm.background_image}
              onSelect={(url) => updateForm({ background_image: url })}
              triggerClassName="h-8 px-3 text-sm"
            />
          </div>
          {templateForm.background_image && (
            <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
              <span className="font-medium">Vald bild:</span> {templateForm.background_image.split('/').pop()}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={onSave}>
            {editingTemplate ? 'Uppdatera' : 'Skapa'} mall
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
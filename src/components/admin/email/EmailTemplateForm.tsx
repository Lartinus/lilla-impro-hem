import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePicker } from '../ImagePicker';
import { EmailTemplate } from './types';

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
          <Label htmlFor="template-content">Innehåll (enkel text)</Label>
          <Textarea
            id="template-content"
            value={templateForm.content}
            onChange={(e) => updateForm({ content: e.target.value })}
            placeholder="Skriv din text här...&#10;&#10;Ny rad blir automatiskt nytt stycke."
            rows={12}
          />
          <div className="text-xs text-muted-foreground">
            Skriv enkel text - varje rad blir ett eget stycke. Inga rubriker eller formatering behövs.
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
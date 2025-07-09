import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseTemplate {
  id: string;
  name: string;
  title_template: string;
  subtitle?: string;
  course_info?: string;
  practical_info?: string;
  price: number;
  discount_price?: number;
  max_participants: number;
  sessions: number;
  hours_per_session: number;
  is_active: boolean;
}

const DEFAULT_TEMPLATES: CourseTemplate[] = [
  {
    id: 'niv1',
    name: 'Nivå 1',
    title_template: 'Niv 1 - Scenarbete & Improv Comedy',
    subtitle: 'Grundkurs i improvisationsteater',
    course_info: 'En introduktionskurs för nybörjare inom improvisationsteater.',
    practical_info: 'Ta med bekväma kläder och vara beredd att ha kul!',
    price: 2400,
    discount_price: 1800,
    max_participants: 12,
    sessions: 8,
    hours_per_session: 2,
    is_active: true,
  },
  {
    id: 'niv2',
    name: 'Nivå 2',
    title_template: 'Niv 2 - Långform & Improviserad komik',
    subtitle: 'Fördjupningskurs i improvisationsteater',
    course_info: 'En fortsättningskurs för dig som redan har grundläggande kunskaper.',
    practical_info: 'Kräver tidigare erfarenhet av improvisationsteater.',
    price: 2800,
    discount_price: 2100,
    max_participants: 10,
    sessions: 8,
    hours_per_session: 2.5,
    is_active: true,
  },
  {
    id: 'houseteam',
    name: 'House Team',
    title_template: 'House Team',
    subtitle: 'Regelbunden träning för erfarna improvisatörer',
    course_info: 'Kontinuerlig träning och utveckling för medlemmar i LIT:s house team.',
    practical_info: 'Endast för inbjudna medlemmar.',
    price: 1500,
    discount_price: 1200,
    max_participants: 8,
    sessions: 12,
    hours_per_session: 2,
    is_active: true,
  },
  {
    id: 'helgworkshop',
    name: 'Helgworkshop',
    title_template: 'Helgworkshop',
    subtitle: 'Intensiv workshop under en helg',
    course_info: 'En koncentrerad workshop som sträcker sig över en helg.',
    practical_info: 'Fredag kväll, lördag och söndag.',
    price: 1800,
    discount_price: 1400,
    max_participants: 15,
    sessions: 3,
    hours_per_session: 4,
    is_active: true,
  },
];

export const CourseTemplateManagement = () => {
  const [templates, setTemplates] = useState<CourseTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<CourseTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { toast } = useToast();

  const handleEdit = (template: CourseTemplate) => {
    setEditingTemplate({ ...template });
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: '',
      name: '',
      title_template: '',
      subtitle: '',
      course_info: '',
      practical_info: '',
      price: 0,
      discount_price: 0,
      max_participants: 12,
      sessions: 8,
      hours_per_session: 2,
      is_active: true,
    });
    setIsCreatingNew(true);
  };

  const handleSave = () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name || !editingTemplate.title_template) {
      toast({
        title: "Validering misslyckades",
        description: "Namn och titel-mall är obligatoriska fält.",
        variant: "destructive",
      });
      return;
    }

    if (isCreatingNew) {
      const newTemplate = {
        ...editingTemplate,
        id: editingTemplate.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast({
        title: "Mall skapad",
        description: "Den nya kursmallen har skapats framgångsrikt.",
      });
    } else {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      toast({
        title: "Mall uppdaterad",
        description: "Kursmallen har uppdaterats framgångsrikt.",
      });
    }

    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleDelete = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Mall borttagen",
      description: "Kursmallen har tagits bort framgångsrikt.",
    });
  };

  const toggleActive = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, is_active: !t.is_active } : t
    ));
    toast({
      title: "Status uppdaterad",
      description: "Mallens status har uppdaterats.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kursmallar</h2>
          <p className="text-muted-foreground">
            Hantera mallar för kurser som kan användas när nya kurser skapas
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Skapa ny mall
        </Button>
      </div>

      {editingTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreatingNew ? 'Skapa ny kursmall' : 'Redigera kursmall'}
            </CardTitle>
            <CardDescription>
              Fyll i informationen för kursmallen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Mallnamn *</Label>
                <Input
                  id="name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="t.ex. Nivå 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_template">Titel-mall *</Label>
                <Input
                  id="title_template"
                  value={editingTemplate.title_template}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, title_template: e.target.value } : null)}
                  placeholder="t.ex. Niv 1 - Scenarbete & Improv Comedy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Underrubrik</Label>
                <Input
                  id="subtitle"
                  value={editingTemplate.subtitle || ''}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                  placeholder="Kort beskrivning"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max deltagare</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={editingTemplate.max_participants}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, max_participants: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Pris (kr)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingTemplate.price}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, price: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_price">Rabatterat pris (kr)</Label>
                <Input
                  id="discount_price"
                  type="number"
                  value={editingTemplate.discount_price || 0}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, discount_price: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessions">Antal tillfällen</Label>
                <Input
                  id="sessions"
                  type="number"
                  value={editingTemplate.sessions}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, sessions: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours_per_session">Timmar per tillfälle</Label>
                <Input
                  id="hours_per_session"
                  type="number"
                  step="0.5"
                  value={editingTemplate.hours_per_session}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, hours_per_session: parseFloat(e.target.value) || 0 } : null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_info">Kursinformation</Label>
              <Textarea
                id="course_info"
                value={editingTemplate.course_info || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, course_info: e.target.value } : null)}
                placeholder="Beskrivning av kursen"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="practical_info">Praktisk information</Label>
              <Textarea
                id="practical_info"
                value={editingTemplate.practical_info || ''}
                onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, practical_info: e.target.value } : null)}
                placeholder="Praktisk information för deltagare"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Spara
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Avbryt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className={template.is_active ? '' : 'opacity-60'}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.title_template}</p>
                  {template.subtitle && (
                    <p className="text-sm text-muted-foreground italic">{template.subtitle}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                    <span>{template.price} kr</span>
                    {template.discount_price && template.discount_price > 0 && (
                      <span>Rabatt: {template.discount_price} kr</span>
                    )}
                    <span>Max {template.max_participants} deltagare</span>
                    <span>{template.sessions} tillfällen</span>
                    <span>{template.hours_per_session}h per tillfälle</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(template.id)}
                    className="text-xs"
                  >
                    {template.is_active ? 'Inaktivera' : 'Aktivera'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Redigera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Ta bort
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
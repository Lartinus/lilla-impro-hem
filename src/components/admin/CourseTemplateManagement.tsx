import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  start_time?: string;
  is_active: boolean;
}

export const CourseTemplateManagement = () => {
  const [editingTemplate, setEditingTemplate] = useState<CourseTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hämta kursmallar från Supabase
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['course-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation för att skapa ny mall
  const createMutation = useMutation({
    mutationFn: async (template: Omit<CourseTemplate, 'id'>) => {
      const { data, error } = await supabase
        .from('course_templates')
        .insert([template])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-templates'] });
      toast({
        title: "Mall skapad",
        description: "Den nya kursmallen har skapats framgångsrikt.",
      });
      setEditingTemplate(null);
      setIsCreatingNew(false);
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte skapa mall: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation för att uppdatera mall
  const updateMutation = useMutation({
    mutationFn: async (template: CourseTemplate) => {
      const { data, error } = await supabase
        .from('course_templates')
        .update(template)
        .eq('id', template.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-templates'] });
      toast({
        title: "Mall uppdaterad",
        description: "Kursmallen har uppdaterats framgångsrikt.",
      });
      setEditingTemplate(null);
      setIsCreatingNew(false);
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera mall: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation för att ta bort mall
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('course_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-templates'] });
      toast({
        title: "Mall borttagen",
        description: "Kursmallen har tagits bort framgångsrikt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte ta bort mall: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation för att växla aktiv status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('course_templates')
        .update({ is_active: isActive })
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-templates'] });
      toast({
        title: "Status uppdaterad",
        description: "Mallens status har uppdaterats.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera status: " + error.message,
        variant: "destructive",
      });
    },
  });

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
      price: 2800,
      discount_price: 2200,
      max_participants: 12,
      sessions: 8,
      hours_per_session: 2,
      start_time: '18:00',
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
      const { id, ...templateData } = editingTemplate;
      createMutation.mutate(templateData);
    } else {
      updateMutation.mutate(editingTemplate);
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  const handleDelete = (templateId: string) => {
    deleteMutation.mutate(templateId);
  };

  const toggleActive = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toggleActiveMutation.mutate({ 
        templateId, 
        isActive: !template.is_active 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Kursmallar</h2>
            <p className="text-muted-foreground">
              Hantera mallar för kurser som kan användas när nya kurser skapas
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Laddar kursmallar...</p>
        </div>
      </div>
    );
  }

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
                  placeholder="t.ex. Nivå 1 - Scenarbete & Improv Comedy"
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
              <div className="space-y-2">
                <Label htmlFor="start_time">Starttid</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={editingTemplate.start_time || '18:00'}
                  onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, start_time: e.target.value } : null)}
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
                placeholder="Praktisk information för deltagare (om annat än ovan)"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex items-center gap-2"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending || updateMutation.isPending ? 'Sparar...' : 'Spara'}
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
                    {template.start_time && <span>Starttid: {template.start_time}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(template.id)}
                    className="text-xs"
                    disabled={toggleActiveMutation.isPending}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Ta bort
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Denna åtgärd kan inte ångras. Kursmallen "{template.name}" kommer att tas bort permanent.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(template.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'Tar bort...' : 'Ta bort'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
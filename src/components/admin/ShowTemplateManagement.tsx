import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShowTemplate {
  id: string;
  name: string;
  title_template: string;
  regular_price: number;
  discount_price: number;
  max_tickets: number;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const ShowTemplateManagement = () => {
  const [editingTemplate, setEditingTemplate] = useState<ShowTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['show-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('show_templates')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ShowTemplate[];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<ShowTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('show_templates')
        .insert([template])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-templates'] });
      setIsCreating(false);
      toast({ title: "Föreställningsmall skapad" });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Fel vid skapande",
        description: error.message 
      });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShowTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('show_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-templates'] });
      setEditingTemplate(null);
      toast({ title: "Föreställningsmall uppdaterad" });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Fel vid uppdatering",
        description: error.message 
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('show_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-templates'] });
      toast({ title: "Föreställningsmall borttagen" });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Fel vid borttagning",
        description: error.message 
      });
    }
  });

  const moveTemplateMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      if (!templates) return;
      
      const currentIndex = templates.findIndex(t => t.id === id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex < 0 || targetIndex >= templates.length) return;
      
      const updates = [
        { id: templates[currentIndex].id, sort_order: templates[targetIndex].sort_order },
        { id: templates[targetIndex].id, sort_order: templates[currentIndex].sort_order }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('show_templates')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-templates'] });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive",
        title: "Fel vid sortering",
        description: error.message 
      });
    }
  });

  const defaultTemplate = {
    name: '',
    title_template: '',
    regular_price: 0,
    discount_price: 0,
    max_tickets: 100,
    description: '',
    is_active: true,
    sort_order: (templates?.length || 0) + 1
  };

  const handleSubmit = (e: React.FormEvent, template: any) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const templateData = {
      name: formData.get('name') as string,
      title_template: formData.get('title_template') as string,
      regular_price: Math.round((parseFloat(formData.get('regular_price') as string) || 0) * 100),
      discount_price: Math.round((parseFloat(formData.get('discount_price') as string) || 0) * 100),
      max_tickets: parseInt(formData.get('max_tickets') as string) || 100,
      description: formData.get('description') as string,
      is_active: formData.get('is_active') === 'on',
      sort_order: template.sort_order
    };

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, ...templateData });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  if (isLoading) {
    return <div>Laddar föreställningsmallar...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Föreställningsmallar</h2>
        <p className="text-muted-foreground">Hantera mallar för föreställningar</p>
      </div>
      
      <div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ny mall
        </Button>
      </div>

      {(isCreating || editingTemplate) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate ? 'Redigera föreställningsmall' : 'Skapa ny föreställningsmall'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, editingTemplate || defaultTemplate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTemplate?.name || ''}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="title_template">Titelmall</Label>
                  <Input
                    id="title_template"
                    name="title_template"
                    defaultValue={editingTemplate?.title_template || ''}
                    placeholder="t.ex. Improvision {datum}"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="regular_price">Ordinarie pris (kr)</Label>
                  <Input
                    id="regular_price"
                    name="regular_price"
                    type="number"
                    step="0.01"
                    defaultValue={editingTemplate ? (editingTemplate.regular_price / 100).toString() : '0'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="discount_price">Rabatterat pris (kr)</Label>
                  <Input
                    id="discount_price"
                    name="discount_price"
                    type="number"
                    step="0.01"
                    defaultValue={editingTemplate ? (editingTemplate.discount_price / 100).toString() : '0'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_tickets">Max antal biljetter</Label>
                  <Input
                    id="max_tickets"
                    name="max_tickets"
                    type="number"
                    defaultValue={editingTemplate?.max_tickets || 100}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingTemplate?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Aktiv</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingTemplate?.description || ''}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Avbryt
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Spara
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates?.map((template, index) => (
          <Card key={template.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Mall: {template.title_template}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Pris: {template.regular_price / 100} kr
                    {template.discount_price > 0 && ` / ${template.discount_price / 100} kr`}
                    {' · '}
                    Max: {template.max_tickets} biljetter
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveTemplateMutation.mutate({ id: template.id, direction: 'up' })}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveTemplateMutation.mutate({ id: template.id, direction: 'down' })}
                      disabled={index === (templates?.length || 0) - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Är du säker på att du vill ta bort denna mall?')) {
                        deleteTemplateMutation.mutate(template.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
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

export default ShowTemplateManagement;
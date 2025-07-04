import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, Plus, Edit, Trash2, GripVertical, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface InterestSignup {
  id: string;
  title: string;
  subtitle?: string | null;
  information?: string | null;
  is_visible: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface InterestSignupWithSubmissions extends InterestSignup {
  submissionCount: number;
}

interface NewInterestSignupForm {
  title: string;
  subtitle: string;
  information: string;
  is_visible: boolean;
}

// Sortable Row Component
function SortableRow({ item, onEdit, onToggleVisibility, onDelete }: {
  item: InterestSignupWithSubmissions;
  onEdit: (item: InterestSignupWithSubmissions) => void;
  onToggleVisibility: (item: InterestSignupWithSubmissions) => void;
  onDelete: (item: InterestSignupWithSubmissions) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">#{item.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.title}</TableCell>
      <TableCell className="max-w-xs truncate">{item.subtitle || '-'}</TableCell>
      <TableCell>
        <span className="font-semibold">{item.submissionCount}</span>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_visible ? "default" : "secondary"}>
          {item.is_visible ? 'Synlig' : 'Dold'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleVisibility(item)}
          >
            {item.is_visible ? (
              <EyeOff className="w-4 h-4 mr-1" />
            ) : (
              <Eye className="w-4 h-4 mr-1" />
            )}
            {item.is_visible ? 'Dölj' : 'Visa'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm(`Är du säker på att du vill radera "${item.title}"? Detta kan inte ångras.`)) {
                onDelete(item);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Radera
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export const InterestSignupManagement = () => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<InterestSignupWithSubmissions | null>(null);
  const [newItem, setNewItem] = useState<NewInterestSignupForm>({
    title: '',
    subtitle: '',
    information: '',
    is_visible: true
  });

  const queryClient = useQueryClient();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch interest signups
  const { data: interestSignups, isLoading } = useQuery({
    queryKey: ['interest-signups'],
    queryFn: async (): Promise<InterestSignupWithSubmissions[]> => {
      const { data: signups, error } = await supabase
        .from('interest_signups')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get submission counts for each signup
      const signupsWithCounts = await Promise.all(
        (signups || []).map(async (signup) => {
          const { data: submissions, error: submissionsError } = await supabase
            .from('interest_signup_submissions')
            .select('id')
            .eq('interest_signup_id', signup.id);

          if (submissionsError) {
            console.warn(`Failed to get submission count for ${signup.title}:`, submissionsError);
          }

          return {
            ...signup,
            submissionCount: submissions?.length || 0
          };
        })
      );

      return signupsWithCounts;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update sort order mutation
  const updateSortOrderMutation = useMutation({
    mutationFn: async (updates: { id: string, sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('interest_signups')
          .update({ sort_order })
          .eq('id', id)
      );
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera sorteringsordning: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Create interest signup mutation
  const createMutation = useMutation({
    mutationFn: async (formData: NewInterestSignupForm) => {
      // Get the highest sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('interest_signups')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;

      const { error } = await supabase
        .from('interest_signups')
        .insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          information: formData.information || null,
          is_visible: formData.is_visible,
          sort_order: nextSortOrder
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Intresseanmälan skapad",
        description: "Intresseanmälan har skapats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skapa intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update interest signup mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { item: InterestSignupWithSubmissions; formData: NewInterestSignupForm }) => {
      const { item, formData } = data;
      
      const { error } = await supabase
        .from('interest_signups')
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          information: formData.information || null,
          is_visible: formData.is_visible
        })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
      resetForm();
      toast({
        title: "Intresseanmälan uppdaterad",
        description: "Intresseanmälan har uppdaterats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const { error } = await supabase
        .from('interest_signups')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Synlighet uppdaterad",
        description: "Synlighet har ändrats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte ändra synlighet: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete interest signup mutation
  const deleteMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const { error } = await supabase
        .from('interest_signups')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Intresseanmälan raderad",
        description: "Intresseanmälan har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setNewItem({
      title: '',
      subtitle: '',
      information: '',
      is_visible: true
    });
  };

  const handleEdit = (item: InterestSignupWithSubmissions) => {
    setEditingItem(item);
    setIsEditMode(true);
    setNewItem({
      title: item.title,
      subtitle: item.subtitle || '',
      information: item.information || '',
      is_visible: item.is_visible
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isEditMode && editingItem) {
      updateMutation.mutate({ item: editingItem, formData: newItem });
    } else {
      createMutation.mutate(newItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && interestSignups) {
      const oldIndex = interestSignups.findIndex(item => item.id === active.id);
      const newIndex = interestSignups.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(interestSignups, oldIndex, newIndex);
      
      // Update sort_order for all affected items
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        sort_order: index + 1
      }));
      
      updateSortOrderMutation.mutate(updates);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intresseanmälningar</CardTitle>
          <CardDescription>Läser in intresseanmälningar...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Intresseanmälningar</CardTitle>
            <CardDescription>
              Hantera intresseanmälningar för kommande kurser. Dra för att ändra ordning.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Lägg till intresseanmälan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Redigera intresseanmälan' : 'Skapa ny intresseanmälan'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="T.ex. House Teams & fortsättning"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Undertitel</Label>
                  <Input
                    id="subtitle"
                    value={newItem.subtitle}
                    onChange={(e) => setNewItem({...newItem, subtitle: e.target.value})}
                    placeholder="T.ex. Auditions hålls regelbundet"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="information">Information</Label>
                  <Textarea
                    id="information"
                    value={newItem.information}
                    onChange={(e) => setNewItem({...newItem, information: e.target.value})}
                    placeholder="Beskrivning av vad detta är för typ av kurs/aktivitet"
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={newItem.is_visible}
                    onCheckedChange={(checked) => setNewItem({...newItem, is_visible: checked})}
                  />
                  <Label htmlFor="is_visible">Visa på hemsidan</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setEditingItem(null);
                    resetForm();
                  }}>
                    Avbryt
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={(createMutation.isPending || updateMutation.isPending) || !newItem.title.trim()}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? 
                      (isEditMode ? 'Uppdaterar...' : 'Skapar...') : 
                      (isEditMode ? 'Uppdatera' : 'Skapa intresseanmälan')
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!interestSignups || interestSignups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga intresseanmälningar</h3>
            <p className="text-muted-foreground">
              Det finns för närvarande inga intresseanmälningar i systemet.
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {interestSignups.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">#{item.sort_order || 0}</span>
                      <Badge variant={item.is_visible ? "default" : "secondary"}>
                        {item.is_visible ? 'Synlig' : 'Dold'}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{item.title}</h4>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{item.submissionCount}</div>
                    <div className="text-xs text-muted-foreground">anmälda</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Redigera
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleVisibilityMutation.mutate(item)}
                  >
                    {item.is_visible ? (
                      <EyeOff className="w-4 h-4 mr-1" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    {item.is_visible ? 'Dölj' : 'Visa'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (confirm(`Är du säker på att du vill radera "${item.title}"? Detta kan inte ångras.`)) {
                        deleteMutation.mutate(item);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Radera
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordning</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead>Undertitel</TableHead>
                  <TableHead>Anmälda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[300px]">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={interestSignups.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {interestSignups.map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onToggleVisibility={item => toggleVisibilityMutation.mutate(item)}
                      onDelete={item => deleteMutation.mutate(item)}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};
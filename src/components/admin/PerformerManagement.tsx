import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User, Power, PowerOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Performer {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PerformerForm {
  name: string;
  bio: string;
  image_url: string;
}

export const PerformerManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPerformer, setEditingPerformer] = useState<Performer | null>(null);
  const [performerForm, setPerformerForm] = useState<PerformerForm>({
    name: '',
    bio: '',
    image_url: ''
  });

  const queryClient = useQueryClient();

  // Fetch performers
  const { data: performers, isLoading } = useQuery({
    queryKey: ['admin-performers'],
    queryFn: async (): Promise<Performer[]> => {
      const { data, error } = await supabase
        .from('performers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Create performer mutation
  const createPerformerMutation = useMutation({
    mutationFn: async (data: PerformerForm) => {
      const { error } = await supabase
        .from('performers')
        .insert({
          name: data.name,
          bio: data.bio,
          image_url: data.image_url || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
      resetForm();
      toast({
        title: "Kursledare skapad",
        description: "Kursledaren har lagts till framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skapa kursledare: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update performer mutation
  const updatePerformerMutation = useMutation({
    mutationFn: async (data: { id: string; form: PerformerForm }) => {
      const { error } = await supabase
        .from('performers')
        .update({
          name: data.form.name,
          bio: data.form.bio,
          image_url: data.form.image_url || null
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
      resetForm();
      toast({
        title: "Kursledare uppdaterad",
        description: "Kursledaren har uppdaterats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera kursledare: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (performer: Performer) => {
      const { error } = await supabase
        .from('performers')
        .update({ is_active: !performer.is_active })
        .eq('id', performer.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
      toast({
        title: "Status uppdaterad",
        description: "Kursledarens status har ändrats",
      });
    }
  });

  // Delete performer mutation
  const deletePerformerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('performers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-performers'] });
      toast({
        title: "Kursledare raderad",
        description: "Kursledaren har raderats",
      });
    }
  });

  const resetForm = () => {
    setPerformerForm({ name: '', bio: '', image_url: '' });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingPerformer(null);
  };

  const handleEdit = (performer: Performer) => {
    setEditingPerformer(performer);
    setIsEditMode(true);
    setPerformerForm({
      name: performer.name,
      bio: performer.bio || '',
      image_url: performer.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isEditMode && editingPerformer) {
      updatePerformerMutation.mutate({ id: editingPerformer.id, form: performerForm });
    } else {
      createPerformerMutation.mutate(performerForm);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kursledare & Skådespelare</CardTitle>
          <CardDescription>Läser in...</CardDescription>
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
            <CardTitle>Kursledare & Skådespelare</CardTitle>
            <CardDescription>
              Hantera kursledare och skådespelare som kan tilldelas kurser
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Lägg till kursledare
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Redigera kursledare' : 'Lägg till kursledare'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    id="name"
                    value={performerForm.name}
                    onChange={(e) => setPerformerForm({...performerForm, name: e.target.value})}
                    placeholder="Kursledarens namn"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image_url">Bild URL</Label>
                  <Input
                    id="image_url"
                    value={performerForm.image_url}
                    onChange={(e) => setPerformerForm({...performerForm, image_url: e.target.value})}
                    placeholder="https://example.com/bild.jpg"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={performerForm.bio}
                    onChange={(e) => setPerformerForm({...performerForm, bio: e.target.value})}
                    placeholder="Kursledarens bakgrund och erfarenhet"
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Avbryt
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createPerformerMutation.isPending || updatePerformerMutation.isPending || !performerForm.name}
                  >
                    {(createPerformerMutation.isPending || updatePerformerMutation.isPending) ? 
                      (isEditMode ? 'Uppdaterar...' : 'Skapar...') : 
                      (isEditMode ? 'Uppdatera' : 'Skapa')
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!performers || performers.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga kursledare hittades</h3>
            <p className="text-muted-foreground">
              Lägg till kursledare och skådespelare för att kunna tilldela dem till kurser.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[300px]">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performers.map((performer) => (
                <TableRow key={performer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {performer.image_url && (
                        <img 
                          src={performer.image_url} 
                          alt={performer.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className="font-medium">{performer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={performer.bio || ''}>
                      {performer.bio || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={performer.is_active ? "default" : "secondary"}>
                      {performer.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(performer)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Redigera
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleStatusMutation.mutate(performer)}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {performer.is_active ? (
                          <PowerOff className="w-4 h-4 mr-1" />
                        ) : (
                          <Power className="w-4 h-4 mr-1" />
                        )}
                        {performer.is_active ? 'Inaktivera' : 'Aktivera'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm(`Är du säker på att du vill radera "${performer.name}"?`)) {
                            deletePerformerMutation.mutate(performer.id);
                          }
                        }}
                        disabled={deletePerformerMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Radera
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
  );
};
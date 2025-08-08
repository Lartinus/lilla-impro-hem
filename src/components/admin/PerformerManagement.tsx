import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User, Power, PowerOff, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

import { ImagePicker } from './ImagePicker';


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
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Filter performers based on search term
  const filteredPerformers = performers?.filter(performer =>
    performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (performer.bio && performer.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
        <h2 className="text-2xl font-bold">Kursledare</h2>
          <p className="text-muted-foreground">Läser in...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Kursledare</h2>
        <p className="text-muted-foreground">
          Hantera kursledare som kan tilldelas kurser
        </p>
      </div>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Sök kursledare..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-start">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                <Label htmlFor="image">Bild</Label>
                <ImagePicker
                  value={performerForm.image_url}
                  onSelect={(url) => setPerformerForm({...performerForm, image_url: url})}
                  triggerClassName="w-full"
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
      
      {!performers || performers.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga kursledare hittades</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
           Lägg till kursledare för att kunna tilldela dem till kurser.
          </p>
        </div>
      ) : filteredPerformers.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga resultat</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Inga kursledare matchade din sökning.
          </p>
        </div>
      ) : (
        <ResponsiveTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[56px]">Bild</TableHead>
                <TableHead>Namn</TableHead>
                <TableHead>Kort bio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerformers.map((performer) => (
                <TableRow key={performer.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-sm bg-muted flex items-center justify-center overflow-hidden">
                      {performer.image_url ? (
                        <img
                          src={performer.image_url}
                          alt={performer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-content-primary">{performer.name}</div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="text-sm text-content-secondary max-w-[48ch]"
                      style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
                    >
                      {performer.bio ? performer.bio : '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={performer.is_active ? 'default' : 'secondary'}>
                      {performer.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="items-center justify-center" aria-label="Redigera" onClick={() => handleEdit(performer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="items-center justify-center" aria-label="Växla status" onClick={() => toggleStatusMutation.mutate(performer)}>
                      {performer.is_active ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="items-center justify-center" aria-label="Radera" onClick={() => deletePerformerMutation.mutate(performer.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ResponsiveTable>
      )}
    </div>
  );
};
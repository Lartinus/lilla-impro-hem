import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User, Power, PowerOff, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImagePicker } from './ImagePicker';
import { ActorCard } from './ActorCard';

interface Actor {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ActorForm {
  name: string;
  bio: string;
  image_url: string;
}

export const ActorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  
  const [newActor, setNewActor] = useState<ActorForm>({
    name: '',
    bio: '',
    image_url: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch actors
  const { data: actors, isLoading } = useQuery({
    queryKey: ['actors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create actor mutation
  const createActorMutation = useMutation({
    mutationFn: async (actorData: ActorForm) => {
      const { data, error } = await supabase
        .from('actors')
        .insert([actorData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setIsDialogOpen(false);
      setNewActor({
        name: '',
        bio: '',
        image_url: ''
      });
      toast({
        title: "Skådespelare skapad",
        description: "Den nya skådespelaren har lagts till.",
      });
    }
  });

  // Update actor mutation
  const updateActorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Actor> }) => {
      const { error } = await supabase
        .from('actors')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingActor(null);
      toast({
        title: "Skådespelare uppdaterad",
        description: "Ändringarna har sparats.",
      });
    }
  });

  // Delete actor mutation
  const deleteActorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('actors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      toast({
        title: "Skådespelare raderad",
        description: "Skådespelaren har tagits bort.",
      });
    }
  });

  const handleEditActor = (actor: Actor) => {
    setEditingActor(actor);
    setNewActor({
      name: actor.name,
      bio: actor.bio || '',
      image_url: actor.image_url || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (actor: Actor) => {
    updateActorMutation.mutate({
      id: actor.id,
      data: { is_active: !actor.is_active }
    });
  };

  const handleDeleteActor = (actor: Actor) => {
    if (confirm(`Är du säker på att du vill radera "${actor.name}"? Detta kan inte ångras.`)) {
      deleteActorMutation.mutate(actor.id);
    }
  };

  const handleSubmit = () => {
    if (isEditMode && editingActor) {
      updateActorMutation.mutate({
        id: editingActor.id,
        data: newActor
      });
    } else {
      createActorMutation.mutate(newActor);
    }
  };

  // Filter actors based on search term
  const filteredActors = actors?.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (actor.bio && actor.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Skådespelare</h2>
        <p className="text-muted-foreground">
          Hantera skådespelare för föreställningar
        </p>
      </div>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Sök skådespelare..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex justify-start items-center">
        <Button onClick={() => {
          setIsEditMode(false);
          setEditingActor(null);
          setNewActor({
            name: '',
            bio: '',
            image_url: ''
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Lägg till skådespelare
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Laddar skådespelare...</div>
      ) : actors && actors.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga skådespelare</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lägg till din första skådespelare för att komma igång.
          </p>
        </div>
      ) : filteredActors.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga resultat</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Inga skådespelare matchade din sökning.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredActors.map((actor) => (
            <ActorCard
              key={actor.id}
              actor={actor}
              onEdit={handleEditActor}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteActor}
            />
          ))}
        </div>
      )}

      {/* Actor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setIsEditMode(false);
          setEditingActor(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Redigera skådespelare' : 'Lägg till skådespelare'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={newActor.name}
                onChange={(e) => setNewActor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Skådespelarens namn"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={newActor.bio}
                onChange={(e) => setNewActor(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Kort beskrivning av skådespelaren..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image">Bild</Label>
              <ImagePicker
                value={newActor.image_url}
                onSelect={(url) => setNewActor(prev => ({ ...prev, image_url: url }))}
                triggerClassName="w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createActorMutation.isPending || updateActorMutation.isPending}
              >
                {createActorMutation.isPending || updateActorMutation.isPending 
                  ? 'Sparar...' 
                  : (isEditMode ? 'Uppdatera' : 'Skapa')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
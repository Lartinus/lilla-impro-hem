import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User, Power, PowerOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImagePicker } from './ImagePicker';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skådespelare</CardTitle>
        <CardDescription>
          Hantera skådespelare för föreställningar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Skådespelare</h3>
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
        ) : actors && actors.length > 0 ? (
          isMobile ? (
            <div className="space-y-4">
              {actors.map((actor) => (
                <Card key={actor.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {actor.image_url ? (
                      <img 
                        src={actor.image_url} 
                        alt={actor.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{actor.name}</h4>
                        <Badge variant={actor.is_active ? "default" : "secondary"}>
                          {actor.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      {actor.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{actor.bio}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditActor(actor)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Redigera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleActive(actor)}
                    >
                      {actor.is_active ? (
                        <PowerOff className="w-4 h-4 mr-1" />
                      ) : (
                        <Power className="w-4 h-4 mr-1" />
                      )}
                      {actor.is_active ? 'Inaktivera' : 'Aktivera'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteActor(actor)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Radera
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actors.map((actor) => (
                  <TableRow key={actor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {actor.image_url ? (
                          <img 
                            src={actor.image_url} 
                            alt={actor.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        {actor.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {actor.bio || 'Ingen bio'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actor.is_active ? "default" : "secondary"}>
                        {actor.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditActor(actor)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Redigera
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleActive(actor)}
                        >
                          {actor.is_active ? (
                            <PowerOff className="w-4 h-4 mr-1" />
                          ) : (
                            <Power className="w-4 h-4 mr-1" />
                          )}
                          {actor.is_active ? 'Inaktivera' : 'Aktivera'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteActor(actor)}
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
          )
        ) : (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga skådespelare</h3>
            <p className="text-muted-foreground">
              Lägg till din första skådespelare för att komma igång.
            </p>
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
      </CardContent>
    </Card>
  );
};
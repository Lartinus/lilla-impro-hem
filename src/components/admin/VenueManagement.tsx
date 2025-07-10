import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, MapPin, Power, PowerOff, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Venue {
  id: string;
  name: string;
  address?: string | null;
  maps_url?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface VenueForm {
  name: string;
  address: string;
  maps_url: string;
  is_active: boolean;
}

// Venue Row Component
function VenueRow({ venue, onEdit, onToggleActive, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: {
  venue: Venue;
  onEdit: (venue: Venue) => void;
  onToggleActive: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
  onMoveUp: (venue: Venue) => void;
  onMoveDown: (venue: Venue) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(venue)}
              disabled={!canMoveUp}
              className="w-6 h-6 p-0"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(venue)}
              disabled={!canMoveDown}
              className="w-6 h-6 p-0"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">#{venue.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{venue.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          {venue.address || '-'}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={venue.is_active ? "default" : "secondary"}>
          {venue.is_active ? 'Aktiv' : 'Inaktiv'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(venue)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleActive(venue)}
          >
            {venue.is_active ? (
              <PowerOff className="w-4 h-4 mr-1" />
            ) : (
              <Power className="w-4 h-4 mr-1" />
            )}
            {venue.is_active ? 'Inaktivera' : 'Aktivera'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm(`Är du säker på att du vill radera "${venue.name}"? Detta kan inte ångras.`)) {
                onDelete(venue);
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

export const VenueManagement = () => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  
  const [newVenue, setNewVenue] = useState<VenueForm>({
    name: '',
    address: '',
    maps_url: '',
    is_active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch venues
  const { data: venues, isLoading } = useQuery({
    queryKey: ['admin-venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Move venue up/down mutations
  const moveVenueUpMutation = useMutation({
    mutationFn: async (venue: Venue) => {
      const currentIndex = venues!.findIndex(v => v.id === venue.id);
      if (currentIndex > 0) {
        const prevVenue = venues![currentIndex - 1];
        const currentSortOrder = venue.sort_order || 0;
        const prevSortOrder = prevVenue.sort_order || 0;
        
        await Promise.all([
          supabase.from('venues').update({ sort_order: prevSortOrder }).eq('id', venue.id),
          supabase.from('venues').update({ sort_order: currentSortOrder }).eq('id', prevVenue.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta platsen: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const moveVenueDownMutation = useMutation({
    mutationFn: async (venue: Venue) => {
      const currentIndex = venues!.findIndex(v => v.id === venue.id);
      if (currentIndex < venues!.length - 1) {
        const nextVenue = venues![currentIndex + 1];
        const currentSortOrder = venue.sort_order || 0;
        const nextSortOrder = nextVenue.sort_order || 0;
        
        await Promise.all([
          supabase.from('venues').update({ sort_order: nextSortOrder }).eq('id', venue.id),
          supabase.from('venues').update({ sort_order: currentSortOrder }).eq('id', nextVenue.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta platsen: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Create venue mutation
  const createVenueMutation = useMutation({
    mutationFn: async (venueData: VenueForm) => {
      const { data, error } = await supabase
        .from('venues')
        .insert([{
          ...venueData,
          sort_order: (venues?.length || 0) + 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setIsDialogOpen(false);
      setNewVenue({
        name: '',
        address: '',
        maps_url: '',
        is_active: true
      });
      toast({
        title: "Plats skapad",
        description: "Den nya platsen har lagts till.",
      });
    }
  });

  // Update venue mutation
  const updateVenueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Venue> }) => {
      const { error } = await supabase
        .from('venues')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Plats uppdaterad",
        description: "Ändringarna har sparats.",
      });
    }
  });

  // Delete venue mutation
  const deleteVenueMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: "Plats raderad",
        description: "Platsen har tagits bort.",
      });
    }
  });

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setNewVenue({
      name: venue.name,
      address: venue.address || '',
      maps_url: venue.maps_url || '',
      is_active: venue.is_active
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (venue: Venue) => {
    updateVenueMutation.mutate({
      id: venue.id,
      data: { is_active: !venue.is_active }
    });
  };

  const handleDeleteVenue = (venue: Venue) => {
    deleteVenueMutation.mutate(venue.id);
  };

  const handleSubmit = () => {
    if (isEditMode && editingVenue) {
      updateVenueMutation.mutate({
        id: editingVenue.id,
        data: newVenue
      });
    } else {
      createVenueMutation.mutate(newVenue);
    }
  };

  const handleMoveUp = (venue: Venue) => {
    moveVenueUpMutation.mutate(venue);
  };

  const handleMoveDown = (venue: Venue) => {
    moveVenueDownMutation.mutate(venue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platshantering</CardTitle>
        <CardDescription>
          Hantera återanvändbara platser för föreställningar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40 mb-6">
          <p className="text-sm text-muted-foreground">
            Använd upp/ner-pilarna för att ändra ordning - platser sorteras efter ordningsnummer
          </p>
        </div>

        <div className="flex justify-start items-center mb-6">
          <Button onClick={() => {
            setIsEditMode(false);
            setEditingVenue(null);
            setNewVenue({
              name: '',
              address: '',
              maps_url: '',
              is_active: true
            });
            setIsDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Lägg till plats
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Laddar platser...</div>
        ) : venues && venues.length > 0 ? (
          isMobile ? (
            <div className="space-y-4">
              {venues.map((venue, index) => (
                <Card key={venue.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(venue)}
                          disabled={index === 0}
                          className="w-6 h-6 p-0"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(venue)}
                          disabled={index === venues.length - 1}
                          className="w-6 h-6 p-0"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{venue.sort_order || 0}</span>
                          <Badge variant={venue.is_active ? "default" : "secondary"}>
                            {venue.is_active ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{venue.name}</h4>
                        {venue.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            {venue.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditVenue(venue)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Redigera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleActive(venue)}
                    >
                      {venue.is_active ? (
                        <PowerOff className="w-4 h-4 mr-1" />
                      ) : (
                        <Power className="w-4 h-4 mr-1" />
                      )}
                      {venue.is_active ? 'Inaktivera' : 'Aktivera'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm(`Är du säker på att du vill radera "${venue.name}"? Detta kan inte ångras.`)) {
                          handleDeleteVenue(venue);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Ordning</TableHead>
                  <TableHead>Namn</TableHead>
                  <TableHead>Adress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue, index) => (
                  <VenueRow
                    key={venue.id}
                    venue={venue}
                    onEdit={handleEditVenue}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeleteVenue}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    canMoveUp={index > 0}
                    canMoveDown={index < venues.length - 1}
                  />
                ))}
              </TableBody>
            </Table>
          )
        ) : (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga platser</h3>
            <p className="text-muted-foreground">
              Lägg till din första plats för att komma igång.
            </p>
          </div>
        )}

        {/* Venue Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
            setEditingVenue(null);
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Redigera plats' : 'Lägg till plats'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="T.ex. Metropole"
                />
              </div>

              <div>
                <Label htmlFor="address">Adress</Label>
                <Input
                  id="address"
                  value={newVenue.address}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Götgatan 15, Stockholm"
                />
              </div>

              <div>
                <Label htmlFor="maps_url">Google Maps-länk</Label>
                <Input
                  id="maps_url"
                  value={newVenue.maps_url}
                  onChange={(e) => setNewVenue(prev => ({ ...prev, maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newVenue.is_active}
                  onCheckedChange={(checked) => setNewVenue(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Aktiv plats</Label>
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
                  disabled={createVenueMutation.isPending || updateVenueMutation.isPending}
                >
                  {createVenueMutation.isPending || updateVenueMutation.isPending 
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
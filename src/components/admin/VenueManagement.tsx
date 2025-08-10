import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
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
}

// Venue Row Component
function VenueRow({ venue, onEdit, onDelete }: {
  venue: Venue;
  onEdit: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{venue.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {venue.address || '-'}
        </div>
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
    maps_url: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch venues (automatically sorted by name)
  const { data: venues, isLoading } = useQuery({
    queryKey: ['admin-venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create venue mutation
  const createVenueMutation = useMutation({
    mutationFn: async (venueData: VenueForm) => {
      const { data, error } = await supabase
        .from('venues')
        .insert([venueData])
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
        maps_url: ''
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
      maps_url: venue.maps_url || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
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


  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Platshantering</h2>
        <p className="text-muted-foreground">
          Hantera återanvändbara platser för föreställningar
        </p>
      </div>

      <div className="flex justify-start items-center">
        <Button onClick={() => {
          setIsEditMode(false);
          setEditingVenue(null);
          setNewVenue({
            name: '',
            address: '',
            maps_url: ''
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
            {venues.map((venue) => (
              <Card key={venue.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
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
                <TableHead>Namn</TableHead>
                <TableHead>Adress</TableHead>
                
                <TableHead>Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <VenueRow
                  key={venue.id}
                  venue={venue}
                  onEdit={handleEditVenue}
                  onDelete={handleDeleteVenue}
                />
              ))}
            </TableBody>
          </Table>
        )
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-3">Inga platser</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
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
                placeholder="Improgatan 1, Stockholm"
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
    </div>
  );
};
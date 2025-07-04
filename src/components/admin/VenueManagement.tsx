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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit, Trash2, GripVertical, MapPin, Power, PowerOff } from 'lucide-react';
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

// Sortable Row Component
function SortableVenueRow({ venue, onEdit, onToggleActive, onDelete }: {
  venue: Venue;
  onEdit: (venue: Venue) => void;
  onToggleActive: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: venue.id });

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
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end for venues
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && venues) {
      const oldIndex = venues.findIndex((venue) => venue.id === active.id);
      const newIndex = venues.findIndex((venue) => venue.id === over.id);

      const newVenues = arrayMove(venues, oldIndex, newIndex);
      
      // Update sort orders
      newVenues.forEach((venue, index) => {
        updateVenueMutation.mutate({
          id: venue.id,
          data: { sort_order: index + 1 }
        });
      });
    }
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platshantering</CardTitle>
        <CardDescription>
          Hantera återanvändbara platser för föreställningar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Platser</h3>
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
              {venues.map((venue) => (
                <Card key={venue.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
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
                  <SortableContext items={venues.map(v => v.id)} strategy={verticalListSortingStrategy}>
                    {venues.map((venue) => (
                      <SortableVenueRow
                        key={venue.id}
                        venue={venue}
                        onEdit={handleEditVenue}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDeleteVenue}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
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
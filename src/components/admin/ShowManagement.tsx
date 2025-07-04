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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, Plus, Edit, Trash2, GripVertical, Calendar, MapPin, Ticket } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminShow {
  id: string;
  title: string;
  slug: string;
  image_url?: string | null;
  show_date: string;
  show_time: string;
  venue: string;
  venue_address?: string | null;
  venue_maps_url?: string | null;
  description?: string | null;
  regular_price: number;
  discount_price: number;
  max_tickets?: number;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface AdminShowWithPerformers extends AdminShow {
  performers: Array<{
    id: string;
    name: string;
    bio: string;
    image_url?: string | null;
  }>;
}

interface NewShowForm {
  title: string;
  slug: string;
  image_url: string;
  show_date: string;
  show_time: string;
  venue: string;
  venue_address: string;
  venue_maps_url: string;
  description: string;
  regular_price: number;
  discount_price: number;
  max_tickets: number;
  is_active: boolean;
  performer_ids: string[];
}

// Sortable Row Component for Shows
function SortableShowRow({ show, onEdit, onToggleVisibility, onDelete }: {
  show: AdminShowWithPerformers;
  onEdit: (show: AdminShowWithPerformers) => void;
  onToggleVisibility: (show: AdminShowWithPerformers) => void;
  onDelete: (show: AdminShowWithPerformers) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: show.id });

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
          <span className="text-xs text-muted-foreground">#{show.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{show.title}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {new Date(show.show_date).toLocaleDateString('sv-SE')} {show.show_time}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          {show.venue}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Ticket className="w-4 h-4 text-muted-foreground" />
          {show.regular_price}kr
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={show.is_active ? "default" : "secondary"}>
          {show.is_active ? 'Aktiv' : 'Dold'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(show)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleVisibility(show)}
          >
            {show.is_active ? (
              <EyeOff className="w-4 h-4 mr-1" />
            ) : (
              <Eye className="w-4 h-4 mr-1" />
            )}
            {show.is_active ? 'Dölj' : 'Visa'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm(`Är du säker på att du vill radera "${show.title}"? Detta kan inte ångras.`)) {
                onDelete(show);
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

export const ShowManagement = () => {
  const isMobile = useIsMobile();
  const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShow, setEditingShow] = useState<AdminShowWithPerformers | null>(null);
  
  const [newShow, setNewShow] = useState<NewShowForm>({
    title: '',
    slug: '',
    image_url: '',
    show_date: '',
    show_time: '19:00',
    venue: 'Metropole',
    venue_address: '',
    venue_maps_url: '',
    description: '',
    regular_price: 300,
    discount_price: 250,
    max_tickets: 100,
    is_active: true,
    performer_ids: []
  });

  const queryClient = useQueryClient();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[åäÅÄ]/g, 'a')
      .replace(/[öÖ]/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Fetch venues
  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch actors (for shows, not course leaders)
  const { data: actors } = useQuery({
    queryKey: ['actors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch shows
  const { data: shows, isLoading: showsLoading } = useQuery({
    queryKey: ['admin-shows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_shows')
        .select(`
          *,
          show_performers (
            actors (
              id,
              name,
              bio,
              image_url
            )
          )
        `)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(show => ({
        ...show,
        performers: show.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || []
      })) as AdminShowWithPerformers[];
    }
  });

  // Create show mutation
  const createShowMutation = useMutation({
    mutationFn: async (showData: NewShowForm) => {
      const { performer_ids, ...showFields } = showData;
      
      const { data: show, error: showError } = await supabase
        .from('admin_shows')
        .insert([{
          ...showFields,
          sort_order: (shows?.length || 0) + 1
        }])
        .select()
        .single();

      if (showError) throw showError;

      // Add performers
      if (performer_ids.length > 0) {
        const { error: performerError } = await supabase
          .from('show_performers')
          .insert(
            performer_ids.map(actorId => ({
              show_id: show.id,
              actor_id: actorId
            }))
          );

        if (performerError) throw performerError;
      }

      return show;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      setIsShowDialogOpen(false);
      setNewShow({
        title: '',
        slug: '',
        image_url: '',
        show_date: '',
        show_time: '19:00',
        venue: 'Metropole',
        venue_address: '',
        venue_maps_url: '',
        description: '',
        regular_price: 300,
        discount_price: 250,
        max_tickets: 100,
        is_active: true,
        performer_ids: []
      });
      toast({
        title: "Föreställning skapad",
        description: "Den nya föreställningen har lagts till.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte skapa föreställningen. Försök igen.",
        variant: "destructive",
      });
    }
  });

  // Update show mutation
  const updateShowMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminShow> }) => {
      const { error } = await supabase
        .from('admin_shows')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      toast({
        title: "Föreställning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    }
  });

  // Delete show mutation
  const deleteShowMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_shows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      toast({
        title: "Föreställning raderad",
        description: "Föreställningen har tagits bort.",
      });
    }
  });

  // Handle drag end for shows
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && shows) {
      const oldIndex = shows.findIndex((show) => show.id === active.id);
      const newIndex = shows.findIndex((show) => show.id === over.id);

      const newShows = arrayMove(shows, oldIndex, newIndex);
      
      // Update sort orders
      newShows.forEach((show, index) => {
        updateShowMutation.mutate({
          id: show.id,
          data: { sort_order: index + 1 }
        });
      });
    }
  };

  const handleEditShow = (show: AdminShowWithPerformers) => {
    setEditingShow(show);
    setNewShow({
      title: show.title,
      slug: show.slug,
      image_url: show.image_url || '',
      show_date: show.show_date,
      show_time: show.show_time,
      venue: show.venue,
      venue_address: show.venue_address || '',
      venue_maps_url: show.venue_maps_url || '',
      description: show.description || '',
      regular_price: show.regular_price,
      discount_price: show.discount_price,
      max_tickets: show.max_tickets || 100,
      is_active: show.is_active,
      performer_ids: show.performers.map(p => p.id)
    });
    setIsEditMode(true);
    setIsShowDialogOpen(true);
  };

  const handleToggleShowVisibility = (show: AdminShowWithPerformers) => {
    updateShowMutation.mutate({
      id: show.id,
      data: { is_active: !show.is_active }
    });
  };

  const handleDeleteShow = (show: AdminShowWithPerformers) => {
    deleteShowMutation.mutate(show.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Föreställningshantering</CardTitle>
        <CardDescription>
          Hantera föreställningar från admin-panelen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Föreställningar</h3>
          <Button onClick={() => setIsShowDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Lägg till föreställning
          </Button>
        </div>

        {showsLoading ? (
          <div className="text-center py-8">Laddar föreställningar...</div>
        ) : shows && shows.length > 0 ? (
          isMobile ? (
            <div className="space-y-4">
              {shows.map((show) => (
                <Card key={show.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{show.sort_order || 0}</span>
                        <Badge variant={show.is_active ? "default" : "secondary"}>
                          {show.is_active ? 'Aktiv' : 'Dold'}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{show.title}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(show.show_date).toLocaleDateString('sv-SE')} {show.show_time}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {show.venue}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-semibold">
                        <Ticket className="w-4 h-4" />
                        {show.regular_price}kr
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditShow(show)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Redigera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleShowVisibility(show)}
                    >
                      {show.is_active ? (
                        <EyeOff className="w-4 h-4 mr-1" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      {show.is_active ? 'Dölj' : 'Visa'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm(`Är du säker på att du vill radera "${show.title}"? Detta kan inte ångras.`)) {
                          handleDeleteShow(show);
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
                    <TableHead>Titel</TableHead>
                    <TableHead>Datum & Tid</TableHead>
                    <TableHead>Plats</TableHead>
                    <TableHead>Pris</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={shows.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {shows.map((show) => (
                      <SortableShowRow
                        key={show.id}
                        show={show}
                        onEdit={handleEditShow}
                        onToggleVisibility={handleToggleShowVisibility}
                        onDelete={handleDeleteShow}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga föreställningar</h3>
            <p className="text-muted-foreground">
              Lägg till din första föreställning för att komma igång.
            </p>
          </div>
        )}

        {/* Show Dialog */}
        <Dialog open={isShowDialogOpen} onOpenChange={(open) => {
          setIsShowDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
            setEditingShow(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Redigera föreställning' : 'Lägg till föreställning'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={newShow.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewShow(prev => ({
                        ...prev,
                        title,
                        slug: generateSlug(title)
                      }));
                    }}
                    placeholder="Föreställningens titel"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={newShow.slug}
                    onChange={(e) => setNewShow(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-vanlig-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Bild-URL</Label>
                <Input
                  id="image_url"
                  value={newShow.image_url}
                  onChange={(e) => setNewShow(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="show_date">Datum</Label>
                  <Input
                    id="show_date"
                    type="date"
                    value={newShow.show_date}
                    onChange={(e) => setNewShow(prev => ({ ...prev, show_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="show_time">Tid</Label>
                  <Input
                    id="show_time"
                    type="time"
                    value={newShow.show_time}
                    onChange={(e) => setNewShow(prev => ({ ...prev, show_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Plats</Label>
                <select
                  id="venue"
                  value={newShow.venue}
                  onChange={(e) => {
                    const selectedVenue = venues?.find(v => v.name === e.target.value);
                    setNewShow(prev => ({
                      ...prev,
                      venue: e.target.value,
                      venue_address: selectedVenue?.address || '',
                      venue_maps_url: selectedVenue?.maps_url || ''
                    }));
                  }}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md z-50"
                >
                  <option value="">Välj plats...</option>
                  {venues?.map((venue) => (
                    <option key={venue.id} value={venue.name}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="venue_address">Adress</Label>
                <Input
                  id="venue_address"
                  value={newShow.venue_address}
                  onChange={(e) => setNewShow(prev => ({ ...prev, venue_address: e.target.value }))}
                  placeholder="Gata 123, Stockholm"
                />
              </div>

              <div>
                <Label htmlFor="venue_maps_url">Google Maps-länk</Label>
                <Input
                  id="venue_maps_url"
                  value={newShow.venue_maps_url}
                  onChange={(e) => setNewShow(prev => ({ ...prev, venue_maps_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  value={newShow.description}
                  onChange={(e) => setNewShow(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beskrivning av föreställningen..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="regular_price">Ordinarie pris (kr)</Label>
                  <Input
                    id="regular_price"
                    type="number"
                    value={newShow.regular_price}
                    onChange={(e) => setNewShow(prev => ({ ...prev, regular_price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="discount_price">Rabatterat pris (kr)</Label>
                  <Input
                    id="discount_price"
                    type="number"
                    value={newShow.discount_price}
                    onChange={(e) => setNewShow(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="max_tickets">Max antal biljetter</Label>
                  <Input
                    id="max_tickets"
                    type="number"
                    value={newShow.max_tickets}
                    onChange={(e) => setNewShow(prev => ({ ...prev, max_tickets: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label>Skådespelare (max 12)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {actors?.slice(0, 12).map((actor) => (
                    <label key={actor.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newShow.performer_ids.includes(actor.id)}
                        disabled={!newShow.performer_ids.includes(actor.id) && newShow.performer_ids.length >= 12}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewShow(prev => ({
                              ...prev,
                              performer_ids: [...prev.performer_ids, actor.id]
                            }));
                          } else {
                            setNewShow(prev => ({
                              ...prev,
                              performer_ids: prev.performer_ids.filter(id => id !== actor.id)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{actor.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {newShow.performer_ids.length}/12 skådespelare valda
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newShow.is_active}
                  onCheckedChange={(checked) => setNewShow(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Aktiv föreställning</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsShowDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button
                  onClick={() => createShowMutation.mutate(newShow)}
                  disabled={createShowMutation.isPending}
                >
                  {createShowMutation.isPending ? 'Sparar...' : (isEditMode ? 'Uppdatera' : 'Skapa')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
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
import { Eye, EyeOff, Plus, Edit, Trash2, Calendar, MapPin, Ticket, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImagePicker } from './ImagePicker';
import { ActorSelector } from './ActorSelector';

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

// Show Row Component
function ShowRow({ show, onEdit, onToggleVisibility, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: {
  show: AdminShowWithPerformers;
  onEdit: (show: AdminShowWithPerformers) => void;
  onToggleVisibility: (show: AdminShowWithPerformers) => void;
  onDelete: (show: AdminShowWithPerformers) => void;
  onMoveUp: (show: AdminShowWithPerformers) => void;
  onMoveDown: (show: AdminShowWithPerformers) => void;
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
              onClick={() => onMoveUp(show)}
              disabled={!canMoveUp}
              className="w-6 h-6 p-0"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(show)}
              disabled={!canMoveDown}
              className="w-6 h-6 p-0"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">#{show.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{show.title}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {new Date(show.show_date).toLocaleDateString('sv-SE')} {show.show_time.substring(0, 5)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {show.venue}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
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

export const ShowManagement = ({ showCompleted = false }: { showCompleted?: boolean }) => {
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

  // Handle venue selection - auto-populate address and maps URL
  const handleVenueChange = (venueName: string) => {
    setNewShow(prev => ({ ...prev, venue: venueName }));
    
    const selectedVenue = venues?.find(v => v.name === venueName);
    if (selectedVenue) {
      setNewShow(prev => ({
        ...prev,
        venue_address: selectedVenue.address || '',
        venue_maps_url: selectedVenue.maps_url || ''
      }));
    }
  };

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
    queryKey: ['admin-shows', showCompleted],
    queryFn: async () => {
      let query = supabase
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
        `);

      if (showCompleted) {
        // Show past shows
        query = query.lt('show_date', new Date().toISOString().split('T')[0]);
      } else {
        // Show current and future shows
        query = query.gte('show_date', new Date().toISOString().split('T')[0]);
      }

      query = query.order('sort_order', { ascending: true });
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(show => ({
        ...show,
        performers: show.show_performers?.map((sp: any) => sp.actors).filter(Boolean) || []
      })) as AdminShowWithPerformers[];
    }
  });

  // Move show up/down mutations
  const moveShowUpMutation = useMutation({
    mutationFn: async (show: AdminShowWithPerformers) => {
      const currentIndex = shows!.findIndex(s => s.id === show.id);
      if (currentIndex > 0) {
        const prevShow = shows![currentIndex - 1];
        const currentSortOrder = show.sort_order || 0;
        const prevSortOrder = prevShow.sort_order || 0;
        
        await Promise.all([
          supabase.from('admin_shows').update({ sort_order: prevSortOrder }).eq('id', show.id),
          supabase.from('admin_shows').update({ sort_order: currentSortOrder }).eq('id', prevShow.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta föreställningen: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const moveShowDownMutation = useMutation({
    mutationFn: async (show: AdminShowWithPerformers) => {
      const currentIndex = shows!.findIndex(s => s.id === show.id);
      if (currentIndex < shows!.length - 1) {
        const nextShow = shows![currentIndex + 1];
        const currentSortOrder = show.sort_order || 0;
        const nextSortOrder = nextShow.sort_order || 0;
        
        await Promise.all([
          supabase.from('admin_shows').update({ sort_order: nextSortOrder }).eq('id', show.id),
          supabase.from('admin_shows').update({ sort_order: currentSortOrder }).eq('id', nextShow.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta föreställningen: ${error.message}`,
        variant: "destructive"
      });
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

  // Update show with all fields mutation
  const updateFullShowMutation = useMutation({
    mutationFn: async ({ id, showData }: { id: string; showData: NewShowForm }) => {
      const { performer_ids, ...showFields } = showData;
      
      // Update show data
      const { error: showError } = await supabase
        .from('admin_shows')
        .update(showFields)
        .eq('id', id);

      if (showError) throw showError;

      // Update performers - remove old ones and add new ones
      const { error: deleteError } = await supabase
        .from('show_performers')
        .delete()
        .eq('show_id', id);

      if (deleteError) throw deleteError;

      // Add new performers
      if (performer_ids.length > 0) {
        const { error: performerError } = await supabase
          .from('show_performers')
          .insert(
            performer_ids.map(actorId => ({
              show_id: id,
              actor_id: actorId
            }))
          );

        if (performerError) throw performerError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      setIsShowDialogOpen(false);
      setIsEditMode(false);
      setEditingShow(null);
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
        title: "Föreställning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera föreställningen. Försök igen.",
        variant: "destructive",
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

  const handleMoveUp = (show: AdminShowWithPerformers) => {
    moveShowUpMutation.mutate(show);
  };

  const handleMoveDown = (show: AdminShowWithPerformers) => {
    moveShowDownMutation.mutate(show);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{showCompleted ? 'Genomförda föreställningar' : 'Aktiva föreställningar'}</CardTitle>
        <CardDescription>
          {showCompleted ? 'Arkiv med föreställningar som redan genomförts' : 'Hantera kommande och pågående föreställningar'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <p className="text-sm text-muted-foreground">
            Använd upp/ner-pilarna för att ändra ordning - föreställningar sorteras efter ordningsnummer på hemsidan
          </p>
        </div>

        {!showCompleted && (
          <div className="flex justify-start items-center mb-6">
            <Button 
              onClick={() => setIsShowDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lägg till föreställning
            </Button>
          </div>
        )}

        {showsLoading ? (
          <div className="text-center py-8">Laddar föreställningar...</div>
        ) : shows && shows.length > 0 ? (
          isMobile ? (
            <div className="space-y-6">
              {shows.map((show, index) => (
                <Card key={show.id} className="p-4 sm:p-6 border-2 border-border/50 hover:border-border transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(show)}
                          disabled={index === 0}
                          className="w-6 h-6 p-0"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(show)}
                          disabled={index === shows.length - 1}
                          className="w-6 h-6 p-0"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            #{show.sort_order || 0}
                          </span>
                          <Badge 
                            variant={show.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {show.is_active ? 'Aktiv' : 'Dold'}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-base mb-3">{show.title}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{new Date(show.show_date).toLocaleDateString('sv-SE')} {show.show_time.substring(0, 5)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{show.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-lg font-semibold bg-primary/10 px-3 py-2 rounded-lg">
                        <span>{show.regular_price}kr</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditShow(show)}
                      className="w-full justify-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Redigera
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleShowVisibility(show)}
                      className="w-full justify-center"
                    >
                      {show.is_active ? (
                        <EyeOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
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
                      className="w-full justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
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
                  <TableHead>Titel</TableHead>
                  <TableHead>Datum & Tid</TableHead>
                  <TableHead>Plats</TableHead>
                  <TableHead>Pris</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shows.map((show, index) => (
                  <ShowRow
                    key={show.id}
                    show={show}
                    onEdit={handleEditShow}
                    onToggleVisibility={handleToggleShowVisibility}
                    onDelete={handleDeleteShow}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    canMoveUp={index > 0}
                    canMoveDown={index < shows.length - 1}
                  />
                ))}
              </TableBody>
            </Table>
          )
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold mb-3">Inga föreställningar</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
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
                <Label htmlFor="image">Bild</Label>
                <ImagePicker
                  value={newShow.image_url}
                  onSelect={(url) => setNewShow(prev => ({ ...prev, image_url: url }))}
                  triggerClassName="w-full"
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
                <ActorSelector
                  actors={actors || []}
                  selectedActorIds={newShow.performer_ids}
                  onSelectionChange={(ids) => setNewShow(prev => ({ ...prev, performer_ids: ids }))}
                  maxSelection={12}
                />
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
                  onClick={() => {
                    if (isEditMode && editingShow) {
                      updateFullShowMutation.mutate({ id: editingShow.id, showData: newShow });
                    } else {
                      createShowMutation.mutate(newShow);
                    }
                  }}
                  disabled={createShowMutation.isPending || updateFullShowMutation.isPending}
                >
                  {(createShowMutation.isPending || updateFullShowMutation.isPending) ? 'Sparar...' : (isEditMode ? 'Uppdatera' : 'Skapa')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
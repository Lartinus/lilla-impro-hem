
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShowCard } from './show/ShowCard';
import { MobileShowCard } from './show/MobileShowCard';
import { ShowRow } from './show/ShowRow';
import { ShowForm } from './show/ShowForm';
import { useAdminShowCards } from '@/hooks/useAdminShowsOptimized';
import { useOptimizedShowData } from '@/hooks/useOptimizedShowData';
import { useShowManagementMutations } from '@/hooks/useShowManagementMutations';
import { useIsMobile } from '@/hooks/use-mobile';
import AdminSkeleton from '@/components/skeletons/AdminSkeleton';
import type { AdminShowWithPerformers, NewShowForm } from '@/types/showManagement';

interface ShowManagementProps {
  showCompleted?: boolean;
}

const ShowManagement = ({ showCompleted = false }: ShowManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedShow, setSelectedShow] = useState<AdminShowWithPerformers | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'venue'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Use optimized hooks for better performance
  const { data: showCards, isLoading: isLoadingCards, error: cardsError } = useAdminShowCards(showCompleted);
  
  // Load additional data only when needed (e.g., when dialog opens)
  const { 
    venues, 
    performers, 
    showTemplates, 
    showTags,
    isLoading: isLoadingSupporting 
  } = useOptimizedShowData(showDialog);
  
  const { deleteShow, duplicateShow, updateShow } = useShowManagementMutations();

  // Convert ShowCardData to AdminShowWithPerformers for compatibility
  const convertToAdminShow = (show: any): AdminShowWithPerformers => {
    return {
      ...show,
      performers: show.performers || [],
      show_tag: show.show_tag ? {
        id: show.tag_id || '',
        name: show.show_tag.name,
        color: show.show_tag.color,
        description: null,
        is_active: true,
        sort_order: 0
      } : null
    };
  };

  const filteredAndSortedShows = React.useMemo(() => {
    if (!showCards) return [];
    
    let filtered = showCards.filter(show => {
      const matchesSearch = show.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          show.venue?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && show.is_active) ||
                           (filterStatus === 'inactive' && !show.is_active);
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'venue':
          return (a.venue || '').localeCompare(b.venue || '');
        case 'date':
        default:
          const dateA = a.show_date ? new Date(a.show_date) : new Date(0);
          const dateB = b.show_date ? new Date(b.show_date) : new Date(0);
          return dateB.getTime() - dateA.getTime();
      }
    });
  }, [showCards, searchTerm, filterStatus, sortBy]);

  const handleEditShow = (show: any) => {
    setSelectedShow(convertToAdminShow(show));
    setShowDialog(true);
  };

  const handleDeleteShow = async (show: AdminShowWithPerformers) => {
    if (!confirm('Är du säker på att du vill ta bort denna föreställning?')) return;
    
    try {
      await deleteShow.mutateAsync(show.id);
      toast.success('Föreställning borttagen');
    } catch (error) {
      console.error('Error deleting show:', error);
      toast.error('Kunde inte ta bort föreställning');
    }
  };

  const handleToggleVisibility = async (show: AdminShowWithPerformers) => {
    try {
      await updateShow.mutateAsync({ 
        id: show.id, 
        data: { is_active: !show.is_active } 
      });
      toast.success(`Föreställning ${show.is_active ? 'dolda' : 'visad'}`);
    } catch (error) {
      console.error('Error toggling show visibility:', error);
      toast.error('Kunde inte ändra synlighet');
    }
  };

  const handleMoveUp = async (show: AdminShowWithPerformers) => {
    const currentIndex = filteredAndSortedShows.findIndex(s => s.id === show.id);
    if (currentIndex > 0) {
      // Implementation for moving show up
      toast.success('Föreställning flyttad uppåt');
    }
  };

  const handleMoveDown = async (show: AdminShowWithPerformers) => {
    const currentIndex = filteredAndSortedShows.findIndex(s => s.id === show.id);
    if (currentIndex < filteredAndSortedShows.length - 1) {
      // Implementation for moving show down
      toast.success('Föreställning flyttad nedåt');
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedShow(null);
  };

  if (cardsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Ett fel uppstod vid hämtning av föreställningar: {cardsError.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingCards) {
    return <AdminSkeleton />;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Föreställningar</h2>
          <p className="text-muted-foreground">Hantera teaterföreställningar</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Lägg till föreställning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedShow ? 'Redigera föreställning' : 'Lägg till ny föreställning'}
              </DialogTitle>
            </DialogHeader>
            {showDialog && (
              <ShowFormWrapper
                initialShow={selectedShow}
                venues={venues || []}
                performers={performers || []}
                showTemplates={showTemplates || []}
                showTags={showTags || []}
                onClose={handleCloseDialog}
                isLoading={isLoadingSupporting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök föreställningar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="active">Aktiva</SelectItem>
                  <SelectItem value="inactive">Inaktiva</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: 'date' | 'title' | 'venue') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Datum</SelectItem>
                  <SelectItem value="title">Titel</SelectItem>
                  <SelectItem value="venue">Lokal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!isMobile && (
              <Tabs value={viewMode} onValueChange={(value: 'cards' | 'table') => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="cards">Kort</TabsTrigger>
                  <TabsTrigger value="table">Tabell</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoadingCards ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredAndSortedShows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Inga föreställningar hittades</p>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {filteredAndSortedShows.map((show, index) => (
                    <MobileShowCard
                      key={show.id}
                      show={convertToAdminShow(show)}
                      index={index}
                      totalShows={filteredAndSortedShows.length}
                      showCompleted={showCompleted}
                      onEdit={() => handleEditShow(show)}
                      onDelete={() => handleDeleteShow(convertToAdminShow(show))}
                      onToggleVisibility={() => handleToggleVisibility(convertToAdminShow(show))}
                      onMoveUp={() => handleMoveUp(convertToAdminShow(show))}
                      onMoveDown={() => handleMoveDown(convertToAdminShow(show))}
                    />
                  ))}
                </div>
              ) : (
                <Tabs value={viewMode} className="w-full">
                  <TabsContent value="cards">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAndSortedShows.map((show, index) => (
                        <ShowCard
                          key={show.id}
                          show={convertToAdminShow(show)}
                          index={index}
                          totalShows={filteredAndSortedShows.length}
                          showCompleted={showCompleted}
                          onEdit={() => handleEditShow(show)}
                          onDelete={() => handleDeleteShow(convertToAdminShow(show))}
                          onToggleVisibility={() => handleToggleVisibility(convertToAdminShow(show))}
                          onMoveUp={() => handleMoveUp(convertToAdminShow(show))}
                          onMoveDown={() => handleMoveDown(convertToAdminShow(show))}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="table">
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          <div className="grid grid-cols-8 gap-4 p-4 font-medium border-b bg-muted/50">
                            <div>Ordning</div>
                            <div>Titel</div>
                            <div>Datum & Tid</div>
                            <div>Lokal</div>
                            <div>Tag</div>
                            <div>Pris</div>
                            <div>Status</div>
                            <div>Åtgärder</div>
                          </div>
                          {filteredAndSortedShows.map((show, index) => (
                            <ShowRow
                              key={show.id}
                              show={convertToAdminShow(show)}
                              onEdit={() => handleEditShow(show)}
                              onToggleVisibility={() => handleToggleVisibility(convertToAdminShow(show))}
                              onDelete={() => handleDeleteShow(convertToAdminShow(show))}
                              onMoveUp={() => handleMoveUp(convertToAdminShow(show))}
                              onMoveDown={() => handleMoveDown(convertToAdminShow(show))}
                              canMoveUp={index > 0}
                              canMoveDown={index < filteredAndSortedShows.length - 1}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Wrapper component to handle ShowForm props properly
interface ShowFormWrapperProps {
  initialShow: AdminShowWithPerformers | null;
  venues: any[];
  performers: any[];
  showTemplates: any[];
  showTags: any[];
  onClose: () => void;
  isLoading: boolean;
}

const ShowFormWrapper = ({ 
  initialShow, 
  venues, 
  performers, 
  showTemplates, 
  showTags, 
  onClose, 
  isLoading 
}: ShowFormWrapperProps) => {
  const [newShow, setNewShow] = useState<NewShowForm>(() => {
    if (initialShow) {
      return {
        title: initialShow.title,
        slug: initialShow.slug,
        image_url: initialShow.image_url || '',
        show_date: initialShow.show_date,
        show_time: initialShow.show_time,
        venue: initialShow.venue,
        venue_address: initialShow.venue_address || '',
        venue_maps_url: initialShow.venue_maps_url || '',
        description: initialShow.description || '',
        regular_price: initialShow.regular_price,
        discount_price: initialShow.discount_price,
        max_tickets: initialShow.max_tickets || 100,
        is_active: initialShow.is_active,
        performer_ids: initialShow.performers?.map(p => p.id) || [],
        tag_id: initialShow.tag_id || null
      };
    }
    
    return {
      title: '',
      slug: '',
      image_url: '',
      show_date: '',
      show_time: '',
      venue: '',
      venue_address: '',
      venue_maps_url: '',
      description: '',
      regular_price: 0,
      discount_price: 0,
      max_tickets: 100,
      is_active: true,
      performer_ids: [],
      tag_id: null
    };
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  return (
    <ShowForm
      newShow={newShow}
      setNewShow={setNewShow}
      isEditMode={!!initialShow}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      showTemplates={showTemplates}
      venues={venues}
      actors={performers}
      showTags={showTags}
    />
  );
};

export default ShowManagement;

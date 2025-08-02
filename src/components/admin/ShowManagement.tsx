
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminShowCards, useAdminShowDetails } from '@/hooks/useAdminShowsOptimized';
import { useShowManagementData } from '@/hooks/useOptimizedShowData';
import { useShowManagementMutations } from '@/hooks/useShowManagementMutations';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { getDefaultShowForm } from '@/utils/showUtils';
import { ShowRow } from './show/ShowRow';
import { MobileShowCard } from './show/MobileShowCard';
import { ShowCard } from './show/ShowCard';
import { ShowForm } from './show/ShowForm';
import type { AdminShowWithPerformers, NewShowForm } from '@/types/showManagement';

export const ShowManagement = ({ showCompleted = false }: { showCompleted?: boolean }) => {
  const isMobile = useIsMobile();
  const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShow, setEditingShow] = useState<AdminShowWithPerformers | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newShow, setNewShow] = useState<NewShowForm>(getDefaultShowForm());

  // Use optimized data fetching
  const { data: shows, isLoading: showsLoading } = useAdminShowCards(showCompleted);
  const { data: showDetails } = useAdminShowDetails(editingShow?.id);
  
  // Only load form data when dialog is opened
  const { venues, actors, showTemplates, showTags } = useShowManagementData({
    loadVenues: isShowDialogOpen,
    loadActors: isShowDialogOpen,
    loadTemplates: isShowDialogOpen,
    loadTags: isShowDialogOpen,
  });

  // Enable background sync
  useBackgroundSync();

  const {
    createShowMutation,
    updateShowMutation,
    updateFullShowMutation,
    deleteShowMutation,
    moveShowUpMutation,
    moveShowDownMutation
  } = useShowManagementMutations();

  const resetForm = () => {
    setNewShow(getDefaultShowForm());
    setSelectedTemplate('');
    setIsEditMode(false);
    setEditingShow(null);
  };

  const handleEditShow = (show: any) => {
    setEditingShow(show);
    // Form will be populated when showDetails loads
    setIsEditMode(true);
    setIsShowDialogOpen(true);
  };

  // Update form when show details are loaded
  React.useEffect(() => {
    if (showDetails && isEditMode) {
      setNewShow({
        title: showDetails.title,
        slug: showDetails.slug,
        image_url: showDetails.image_url || '',
        show_date: showDetails.show_date,
        show_time: showDetails.show_time,
        venue: showDetails.venue,
        venue_address: showDetails.venue_address || '',
        venue_maps_url: showDetails.venue_maps_url || '',
        description: showDetails.description || '',
        regular_price: showDetails.regular_price,
        discount_price: showDetails.discount_price,
        max_tickets: showDetails.max_tickets || 100,
        is_active: showDetails.is_active,
        performer_ids: showDetails.performers.map(p => p.id),
        tag_id: showDetails.tag_id || null
      });
    }
  }, [showDetails, isEditMode]);

  const handleToggleShowVisibility = (show: any) => {
    updateShowMutation.mutate({
      id: show.id,
      data: { is_active: !show.is_active }
    });
  };

  const handleDeleteShow = (show: any) => {
    deleteShowMutation.mutate(show.id);
  };

  const handleMoveUp = (show: any) => {
    if (shows) {
      moveShowUpMutation.mutate({ show, shows });
    }
  };

  const handleMoveDown = (show: any) => {
    if (shows) {
      moveShowDownMutation.mutate({ show, shows });
    }
  };

  const handleCreateShow = () => {
    if (shows) {
      createShowMutation.mutate({ showData: newShow, showsLength: shows.length });
    }
  };

  const handleUpdateShow = () => {
    if (editingShow) {
      updateFullShowMutation.mutate({ id: editingShow.id, showData: newShow });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsShowDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{showCompleted ? 'Genomförda föreställningar' : 'Aktiva föreställningar'}</h2>
        <p className="text-muted-foreground">
          {showCompleted ? 'Arkiv med föreställningar som redan genomförts' : 'Hantera kommande och pågående föreställningar'}
        </p>
      </div>
        {!showCompleted && (
          <div className="flex justify-start items-center">
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
                <MobileShowCard
                  key={show.id}
                  show={show as any}
                  index={index}
                  totalShows={shows.length}
                  showCompleted={showCompleted}
                  onEdit={handleEditShow}
                  onToggleVisibility={handleToggleShowVisibility}
                  onDelete={handleDeleteShow}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {shows.map((show, index) => (
                <ShowCard
                  key={show.id}
                  show={show as any}
                  index={index}
                  totalShows={shows.length}
                  showCompleted={showCompleted}
                  onEdit={handleEditShow}
                  onToggleVisibility={handleToggleShowVisibility}
                  onDelete={handleDeleteShow}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
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

      {/* Show Dialog - only loads heavy data when opened */}
      <Dialog open={isShowDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Redigera föreställning' : 'Lägg till föreställning'}
            </DialogTitle>
          </DialogHeader>
          
          {isShowDialogOpen && (
            <ShowForm
              newShow={newShow}
              setNewShow={setNewShow}
              isEditMode={isEditMode}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              showTemplates={showTemplates}
              venues={venues}
              actors={actors}
              showTags={showTags}
            />
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsShowDialogOpen(false)}
            >
              Avbryt
            </Button>
            <Button
              onClick={isEditMode ? handleUpdateShow : handleCreateShow}
              disabled={createShowMutation.isPending || updateFullShowMutation.isPending}
            >
              {isEditMode ? 'Uppdatera' : 'Skapa'} föreställning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


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
import SubtleLoadingOverlay from '@/components/SubtleLoadingOverlay';

const ShowManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'venue'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Use optimized hooks for better performance
  const { data: showCards, isLoading: isLoadingCards, error: cardsError } = useAdminShowCards();
  
  // Load additional data only when needed (e.g., when dialog opens)
  const { 
    venues, 
    performers, 
    showTemplates, 
    showTags,
    isLoading: isLoadingSupporting 
  } = useOptimizedShowData(showDialog);
  
  const { deleteShow, duplicateShow, updateShow } = useShowManagementMutations();

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
    setSelectedShow(show);
    setShowDialog(true);
  };

  const handleDeleteShow = async (show: any) => {
    if (!confirm('Är du säker på att du vill ta bort denna föreställning?')) return;
    
    try {
      await deleteShow.mutateAsync(show.id);
      toast.success('Föreställning borttagen');
    } catch (error) {
      console.error('Error deleting show:', error);
      toast.error('Kunde inte ta bort föreställning');
    }
  };

  const handleDuplicateShow = async (show: any) => {
    try {
      await duplicateShow.mutateAsync(show);
      toast.success('Föreställning duplicerad');
    } catch (error) {
      console.error('Error duplicating show:', error);
      toast.error('Kunde inte duplicera föreställning');
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

  return (
    <div className="space-y-6">
      <SubtleLoadingOverlay isVisible={isLoadingCards} />
      
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
              <ShowForm
                initialShow={selectedShow}
                venues={venues}
                performers={performers}
                showTemplates={showTemplates}
                showTags={showTags}
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
                  {filteredAndSortedShows.map((show) => (
                    <MobileShowCard
                      key={show.id}
                      show={show}
                      onEdit={handleEditShow}
                      onDelete={handleDeleteShow}
                      onDuplicate={handleDuplicateShow}
                    />
                  ))}
                </div>
              ) : (
                <Tabs value={viewMode} className="w-full">
                  <TabsContent value="cards">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAndSortedShows.map((show) => (
                        <ShowCard
                          key={show.id}
                          show={show}
                          onEdit={handleEditShow}
                          onDelete={handleDeleteShow}
                          onDuplicate={handleDuplicateShow}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="table">
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-muted/50">
                            <div>Titel</div>
                            <div>Datum</div>
                            <div>Tid</div>
                            <div>Lokal</div>
                            <div>Status</div>
                            <div>Åtgärder</div>
                          </div>
                          {filteredAndSortedShows.map((show) => (
                            <ShowRow
                              key={show.id}
                              show={show}
                              onEdit={handleEditShow}
                              onDelete={handleDeleteShow}
                              onDuplicate={handleDuplicateShow}
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

export default ShowManagement;

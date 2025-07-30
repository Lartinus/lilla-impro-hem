import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInterestSignupData, fetchSubmissions } from '@/hooks/useInterestSignupData';
import { useInterestSignupMutations } from '@/hooks/useInterestSignupMutations';
import { getDefaultInterestSignupForm } from '@/utils/interestSignupUtils';
import { InterestRow } from './interest/InterestRow';
import { MobileInterestCard } from './interest/MobileInterestCard';
import { InterestCard } from './interest/InterestCard';
import { InterestForm } from './interest/InterestForm';
import { SubmissionsDialog } from './interest/SubmissionsDialog';
import type { InterestSignupWithSubmissions, InterestSubmission, NewInterestSignupForm } from '@/types/interestSignupManagement';

export const InterestSignupManagement = () => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<InterestSignupWithSubmissions | null>(null);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<InterestSubmission[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<InterestSignupWithSubmissions | null>(null);
  const [newItem, setNewItem] = useState<NewInterestSignupForm>(getDefaultInterestSignupForm());

  const { interestSignups, isLoading } = useInterestSignupData();
  const {
    createMutation,
    updateMutation,
    toggleVisibilityMutation,
    deleteMutation,
    deleteSubmissionMutation,
    moveInterestUpMutation,
    moveInterestDownMutation
  } = useInterestSignupMutations();

  const resetForm = () => {
    setNewItem(getDefaultInterestSignupForm());
  };

  const handleEdit = (item: InterestSignupWithSubmissions) => {
    setEditingItem(item);
    setIsEditMode(true);
    setNewItem({
      title: item.title,
      subtitle: item.subtitle || '',
      information: item.information || '',
      is_visible: item.is_visible
    });
    setIsDialogOpen(true);
  };

  const handleViewSubmissions = async (item: InterestSignupWithSubmissions) => {
    try {
      const submissions = await fetchSubmissions(item.id);
      setSelectedSubmissions(submissions);
      setSelectedInterest(item);
      setIsSubmissionsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: `Kunde inte hämta anmälningar: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = () => {
    if (isEditMode && editingItem) {
      updateMutation.mutate({ item: editingItem, formData: newItem });
    } else {
      createMutation.mutate(newItem);
    }
  };

  const handleMoveUp = (item: InterestSignupWithSubmissions) => {
    if (interestSignups) {
      moveInterestUpMutation.mutate({ item, allItems: interestSignups });
    }
  };

  const handleMoveDown = (item: InterestSignupWithSubmissions) => {
    if (interestSignups) {
      moveInterestDownMutation.mutate({ item, allItems: interestSignups });
    }
  };

  const handleDeleteSubmission = (submissionId: string) => {
    deleteSubmissionMutation.mutate(submissionId, {
      onSuccess: () => {
        setSelectedSubmissions(prev => 
          prev.filter(submission => submission.id !== submissionId)
        );
        
        if (selectedInterest) {
          setSelectedInterest(prev => prev ? {
            ...prev,
            submissionCount: Math.max(0, prev.submissionCount - 1)
          } : null);
        }
      }
    });
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setIsEditMode(false);
      setEditingItem(null);
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Intresseanmälningar</h2>
          <p className="text-muted-foreground">Läser in intresseanmälningar...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Intresseanmälningar</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Lägg till intresseanmälan
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Redigera intresseanmälan' : 'Skapa ny intresseanmälan'}
                </DialogTitle>
              </DialogHeader>
              
              <InterestForm
                formData={newItem}
                onFormChange={setNewItem}
                isEditMode={isEditMode}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={(createMutation.isPending || updateMutation.isPending) || !newItem.title.trim()}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 
                    (isEditMode ? 'Uppdaterar...' : 'Skapar...') : 
                    (isEditMode ? 'Uppdatera' : 'Skapa intresseanmälan')
                  }
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {!interestSignups || interestSignups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-3">Inga intresseanmälningar</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Det finns för närvarande inga intresseanmälningar i systemet.
          </p>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {interestSignups.map((item, index) => (
            <MobileInterestCard
              key={item.id}
              item={item}
              index={index}
              totalItems={interestSignups.length}
              onEdit={handleEdit}
              onToggleVisibility={(item) => toggleVisibilityMutation.mutate(item)}
              onDelete={(item) => deleteMutation.mutate(item)}
              onViewSubmissions={handleViewSubmissions}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {interestSignups.map((item, index) => (
            <InterestCard
              key={item.id}
              item={item}
              index={index}
              totalItems={interestSignups.length}
              onEdit={handleEdit}
              onToggleVisibility={(item) => toggleVisibilityMutation.mutate(item)}
              onDelete={(item) => deleteMutation.mutate(item)}
              onViewSubmissions={handleViewSubmissions}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      <SubmissionsDialog
        isOpen={isSubmissionsDialogOpen}
        onClose={() => setIsSubmissionsDialogOpen(false)}
        selectedInterest={selectedInterest}
        submissions={selectedSubmissions}
        onDeleteSubmission={handleDeleteSubmission}
        isDeleting={deleteSubmissionMutation.isPending}
      />
    </div>
  );
};
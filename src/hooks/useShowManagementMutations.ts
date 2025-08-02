
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { AdminShow, AdminShowWithPerformers, NewShowForm } from '@/types/showManagement';

export const useShowManagementMutations = () => {
  const queryClient = useQueryClient();

  const createShowMutation = useMutation({
    mutationFn: async ({ showData, showsLength }: { showData: NewShowForm; showsLength: number }) => {
      const { performer_ids, ...showFields } = showData;
      
      const { data: show, error: showError } = await supabase
        .from('admin_shows')
        .insert([{
          ...showFields,
          sort_order: showsLength + 1
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
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
      toast({
        title: "Föreställning skapad",
        description: "Den nya föreställningen har lagts till.",
      });
    },
    onError: () => {
      toast({
        title: "Fel",
        description: "Kunde inte skapa föreställningen. Försök igen.",
        variant: "destructive",
      });
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
      toast({
        title: "Föreställning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
      toast({
        title: "Föreställning uppdaterad",
        description: "Ändringarna har sparats.",
      });
    },
    onError: () => {
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera föreställningen. Försök igen.",
        variant: "destructive",
      });
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
      toast({
        title: "Föreställning raderad",
        description: "Föreställningen har tagits bort.",
      });
    }
  });

  const duplicateShowMutation = useMutation({
    mutationFn: async (show: AdminShowWithPerformers) => {
      const { id, created_at, updated_at, performers, ...showData } = show;
      const newTitle = `${showData.title} (kopia)`;
      const newSlug = `${showData.slug}-kopia`;
      
      const { data: newShow, error: showError } = await supabase
        .from('admin_shows')
        .insert([{
          ...showData,
          title: newTitle,
          slug: newSlug
        }])
        .select()
        .single();

      if (showError) throw showError;

      // Copy performers
      if (performers && performers.length > 0) {
        const { error: performerError } = await supabase
          .from('show_performers')
          .insert(
            performers.map(performer => ({
              show_id: newShow.id,
              actor_id: performer.id
            }))
          );

        if (performerError) throw performerError;
      }

      return newShow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
      toast({
        title: "Föreställning duplicerad",
        description: "En kopia av föreställningen har skapats.",
      });
    }
  });

  const moveShowUpMutation = useMutation({
    mutationFn: async ({ show, shows }: { show: AdminShowWithPerformers; shows: AdminShowWithPerformers[] }) => {
      const currentIndex = shows.findIndex(s => s.id === show.id);
      if (currentIndex > 0) {
        const prevShow = shows[currentIndex - 1];
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
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
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
    mutationFn: async ({ show, shows }: { show: AdminShowWithPerformers; shows: AdminShowWithPerformers[] }) => {
      const currentIndex = shows.findIndex(s => s.id === show.id);
      if (currentIndex < shows.length - 1) {
        const nextShow = shows[currentIndex + 1];
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
      queryClient.invalidateQueries({ queryKey: ['admin-show-cards'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta föreställningen: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    createShow: createShowMutation,
    updateShow: updateShowMutation,
    updateFullShow: updateFullShowMutation,
    deleteShow: deleteShowMutation,
    duplicateShow: duplicateShowMutation,
    moveShowUp: moveShowUpMutation,
    moveShowDown: moveShowDownMutation
  };
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { InterestSignupWithSubmissions, NewInterestSignupForm } from '@/types/interestSignupManagement';

export const useInterestSignupMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (formData: NewInterestSignupForm) => {
      // Get the highest sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('interest_signups')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;

      const { error } = await supabase
        .from('interest_signups')
        .insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          information: formData.information || null,
          is_visible: formData.is_visible,
          sort_order: nextSortOrder
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Intresseanmälan skapad",
        description: "Intresseanmälan har skapats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skapa intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { item: InterestSignupWithSubmissions; formData: NewInterestSignupForm }) => {
      const { item, formData } = data;
      
      const { error } = await supabase
        .from('interest_signups')
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          information: formData.information || null,
          is_visible: formData.is_visible
        })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Intresseanmälan uppdaterad",
        description: "Intresseanmälan har uppdaterats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const { error } = await supabase
        .from('interest_signups')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Synlighet uppdaterad",
        description: "Synlighet har ändrats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte ändra synlighet: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const { error } = await supabase
        .from('interest_signups')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Intresseanmälan raderad",
        description: "Intresseanmälan har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('interest_signup_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;
      return submissionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Anmälan raderad",
        description: "Personens anmälan har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera anmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const moveInterestUpMutation = useMutation({
    mutationFn: async ({ item, allItems }: { item: InterestSignupWithSubmissions; allItems: InterestSignupWithSubmissions[] }) => {
      const currentIndex = allItems.findIndex(i => i.id === item.id);
      if (currentIndex > 0) {
        const prevItem = allItems[currentIndex - 1];
        const currentSortOrder = item.sort_order || 0;
        const prevSortOrder = prevItem.sort_order || 0;
        
        await Promise.all([
          supabase.from('interest_signups').update({ sort_order: prevSortOrder }).eq('id', item.id),
          supabase.from('interest_signups').update({ sort_order: currentSortOrder }).eq('id', prevItem.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const moveInterestDownMutation = useMutation({
    mutationFn: async ({ item, allItems }: { item: InterestSignupWithSubmissions; allItems: InterestSignupWithSubmissions[] }) => {
      const currentIndex = allItems.findIndex(i => i.id === item.id);
      if (currentIndex < allItems.length - 1) {
        const nextItem = allItems[currentIndex + 1];
        const currentSortOrder = item.sort_order || 0;
        const nextSortOrder = nextItem.sort_order || 0;
        
        await Promise.all([
          supabase.from('interest_signups').update({ sort_order: nextSortOrder }).eq('id', item.id),
          supabase.from('interest_signups').update({ sort_order: currentSortOrder }).eq('id', nextItem.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    createMutation,
    updateMutation,
    toggleVisibilityMutation,
    deleteMutation,
    deleteSubmissionMutation,
    moveInterestUpMutation,
    moveInterestDownMutation
  };
};
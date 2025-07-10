import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CourseWithBookings, CourseParticipant } from '@/types/courseManagement';

export const useCourseParticipants = () => {
  const [participants, setParticipants] = useState<CourseParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isAddParticipantFormOpen, setIsAddParticipantFormOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const queryClient = useQueryClient();

  const handleViewParticipants = async (course: CourseWithBookings) => {
    setIsLoadingParticipants(true);
    setParticipants([]); // Clear previous participants
    
    try {
      const { data, error } = await supabase.functions.invoke('get-course-participants', {
        body: { table_name: course.table_name }
      });

      if (error) {
        console.error('Error fetching participants:', error);
        toast({
          title: "Fel",
          description: "Kunde inte hämta deltagare",
          variant: "destructive"
        });
        setParticipants([]);
      } else {
        setParticipants(data?.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta deltagare",
        variant: "destructive"
      });
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Delete participant mutation
  const deleteParticipantMutation = useMutation({
    mutationFn: async ({ email, tableName }: { email: string; tableName: string }) => {
      console.log('🗑️ Attempting to delete participant:', { email, tableName });
      
      // Use edge function for deletion
      const { data, error } = await supabase.functions.invoke('delete-course-participant', {
        body: {
          table_name: tableName,
          participant_email: email
        }
      });

      console.log('🗑️ Delete response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Databasfel: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Deltagaren kunde inte hittas i kursen');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Deltagare raderad",
        description: "Deltagaren har raderats från kursen."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera deltagaren: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Add participant mutation
  const addParticipantMutation = useMutation({
    mutationFn: async ({ name, email, phone, tableName }: { name: string; email: string; phone: string; tableName: string }) => {
      const { data, error } = await supabase.rpc('add_course_participant', {
        table_name: tableName,
        participant_name: name,
        participant_email: email,
        participant_phone: phone
      });

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Deltagare tillagd",
        description: "Deltagaren har lagts till i kursen."
      });
      // Reset form and close
      setNewParticipant({ name: '', email: '', phone: '' });
      setIsAddParticipantFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte lägga till deltagaren: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleDeleteParticipant = (email: string, tableName: string) => {
    if (confirm('Är du säker på att du vill radera denna deltagare från kursen?')) {
      deleteParticipantMutation.mutate({ email, tableName });
    }
  };

  const handleAddParticipant = (tableName: string) => {
    if (!newParticipant.name.trim() || !newParticipant.email.trim()) {
      toast({
        title: "Ofullständig information",
        description: "Namn och e-post är obligatoriska.",
        variant: "destructive"
      });
      return;
    }

    addParticipantMutation.mutate({
      name: newParticipant.name,
      email: newParticipant.email,
      phone: newParticipant.phone,
      tableName
    });
  };

  return {
    participants,
    setParticipants,
    isLoadingParticipants,
    isAddParticipantFormOpen,
    setIsAddParticipantFormOpen,
    newParticipant,
    setNewParticipant,
    handleViewParticipants,
    handleDeleteParticipant,
    handleAddParticipant,
    deleteParticipantMutation,
    addParticipantMutation
  };
};
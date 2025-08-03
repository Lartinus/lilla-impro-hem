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
    onSuccess: (data, variables) => {
      toast({
        title: "Deltagare raderad",
        description: "Deltagaren har raderats från kursen."
      });
      
      // Update local participants list by removing the deleted participant
      setParticipants(prev => prev.filter(p => p.email !== variables.email));
      
      // Also invalidate the admin courses query to update participant counts
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
      console.log('🔄 Attempting to add participant:', { name, email, phone, tableName });
      
      // Use edge function for adding participant
      const { data, error } = await supabase.functions.invoke('add-course-participant', {
        body: {
          table_name: tableName,
          participant_name: name,
          participant_email: email,
          participant_phone: phone,
          participant_address: '',
          participant_postal_code: '',
          participant_city: '',
          participant_message: ''
        }
      });

      console.log('📥 Add participant response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Edge function fel: ${error.message}`);
      }
      
      if (!data?.success) {
        console.error('❌ Database function failed:', data);
        throw new Error(data?.error || 'Deltagaren kunde inte läggas till');
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Deltagare tillagd",
        description: "Deltagaren har lagts till i kursen."
      });
      
      // Add the new participant to the local state
      const newParticipant: CourseParticipant = {
        name: variables.name,
        email: variables.email,
        phone: variables.phone
      };
      setParticipants(prev => [...prev, newParticipant]);
      
      // Reset form and close
      setNewParticipant({ name: '', email: '', phone: '' });
      setIsAddParticipantFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      console.error('❌ Add participant error:', error);
      toast({
        title: "Fel",
        description: `Kunde inte lägga till deltagaren: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Move participant mutation
  const moveParticipantMutation = useMutation({
    mutationFn: async ({ email, fromTableName, toTableName }: { email: string; fromTableName: string; toTableName: string }) => {
      const { data, error } = await supabase.rpc('move_course_participant', {
        from_table_name: fromTableName,
        to_table_name: toTableName,
        participant_email: email
      });

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Deltagare flyttad",
        description: "Deltagaren har flyttats till den nya kursen."
      });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta deltagaren: ${error.message}`,
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

  const handleMoveParticipant = (email: string, fromTableName: string, toTableName: string) => {
    if (confirm('Är du säker på att du vill flytta denna deltagare till en annan kurs?')) {
      moveParticipantMutation.mutate({ email, fromTableName, toTableName });
    }
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
    handleMoveParticipant,
    deleteParticipantMutation,
    addParticipantMutation,
    moveParticipantMutation
  };
};
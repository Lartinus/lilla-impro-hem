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
      
      // Check for specific error types
      const errorMessage = error.message;
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint') || errorMessage.includes('already exists')) {
        toast({
          title: "E-postadressen finns redan",
          description: "En deltagare med denna e-postadress är redan anmäld till kursen.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Fel",
          description: `Kunde inte lägga till deltagaren: ${error.message}`,
          variant: "destructive"
        });
      }
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
    if (!newParticipant.name.trim() || !newParticipant.email.trim() || !newParticipant.phone.trim()) {
      toast({
        title: "Ofullständig information",
        description: "Namn, e-post och telefonnummer är obligatoriska.",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format (6-20 characters, only numbers, +, -, (), and spaces)
    const phoneRegex = /^[+0-9\s\-()]+$/;
    if (newParticipant.phone.length < 6 || newParticipant.phone.length > 20 || !phoneRegex.test(newParticipant.phone)) {
      toast({
        title: "Ogiltigt telefonnummer",
        description: "Telefonnummer måste vara 6-20 tecken och får endast innehålla siffror, +, -, (), och mellanslag.",
        variant: "destructive"
      });
      return;
    }

    // Check if email already exists in the current participants list
    const emailExists = participants.some(p => p.email.toLowerCase() === newParticipant.email.toLowerCase());
    if (emailExists) {
      toast({
        title: "E-postadressen finns redan",
        description: "En deltagare med denna e-postadress är redan anmäld till kursen.",
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

  // Update participant mutation
  const updateParticipantMutation = useMutation({
    mutationFn: async ({ tableName, oldEmail, newData }: { 
      tableName: string; 
      oldEmail: string; 
      newData: { name: string; email: string; phone: string } 
    }) => {
      const { data, error } = await supabase.functions.invoke('update-course-participant', {
        body: {
          table_name: tableName,
          old_email: oldEmail,
          new_name: newData.name,
          new_email: newData.email,
          new_phone: newData.phone
        }
      });

      if (error) {
        throw new Error(`Edge function fel: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Deltagaren kunde inte uppdateras');
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Deltagare uppdaterad",
        description: "Deltagarens information har uppdaterats."
      });
      
      // Update the participant in local state
      setParticipants(prev => prev.map(p => 
        p.email === variables.oldEmail 
          ? { ...p, ...variables.newData }
          : p
      ));
      
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera deltagaren: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Resend confirmation mutation
  const resendConfirmationMutation = useMutation({
    mutationFn: async ({ email, name, courseTitle, tableName }: { 
      email: string; 
      name: string; 
      courseTitle: string; 
      tableName: string 
    }) => {
      const { data, error } = await supabase.functions.invoke('resend-course-confirmation', {
        body: {
          participant_email: email,
          participant_name: name,
          course_title: courseTitle,
          course_table_name: tableName
        }
      });

      if (error) {
        throw new Error(`Edge function fel: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Kunde inte skicka bekräftelse');
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Bekräftelse skickad",
        description: "Kursbekräftelsen har skickats till deltagaren."
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skicka bekräftelse: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleUpdateParticipant = (tableName: string, oldEmail: string, newData: { name: string; email: string; phone: string }) => {
    updateParticipantMutation.mutate({ tableName, oldEmail, newData });
  };

  const handleResendConfirmation = (email: string, name: string, courseTitle: string, tableName: string) => {
    resendConfirmationMutation.mutate({ email, name, courseTitle, tableName });
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
    handleUpdateParticipant,
    handleResendConfirmation,
    deleteParticipantMutation,
    addParticipantMutation,
    moveParticipantMutation,
    updateParticipantMutation,
    resendConfirmationMutation
  };
};
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeAdminUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time admin updates...');

    // Create channels for different data types
    const adminShowsChannel = supabase
      .channel('admin-shows-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_shows' },
        (payload) => {
          console.log('Admin shows change:', payload);
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
          queryClient.invalidateQueries({ queryKey: ['admin-shows-cards'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny föreställning skapad');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Föreställning uppdaterad');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Föreställning borttagen');
          }
        }
      )
      .subscribe();

    const courseInstancesChannel = supabase
      .channel('course-instances-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'course_instances' },
        (payload) => {
          console.log('Course instances change:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
          queryClient.invalidateQueries({ queryKey: ['course-instances'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny kursinstans skapad');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Kursinstans uppdaterad');
          }
        }
      )
      .subscribe();

    const ticketPurchasesChannel = supabase
      .channel('ticket-purchases-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_purchases' },
        (payload) => {
          console.log('Ticket purchases change:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['ticket-sales'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny biljettköp registrerat');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Biljettköp uppdaterat');
          }
        }
      )
      .subscribe();

    const coursePurchasesChannel = supabase
      .channel('course-purchases-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'course_purchases' },
        (payload) => {
          console.log('Course purchases change:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          queryClient.invalidateQueries({ queryKey: ['course-purchases'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Nytt kursköp registrerat');
          }
        }
      )
      .subscribe();

    const performersChannel = supabase
      .channel('performers-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'performers' },
        (payload) => {
          console.log('Performers change:', payload);
          queryClient.invalidateQueries({ queryKey: ['performers'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny kursledare tillagd');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Kursledare uppdaterad');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Kursledare borttagen');
          }
        }
      )
      .subscribe();

    const actorsChannel = supabase
      .channel('actors-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'actors' },
        (payload) => {
          console.log('Actors change:', payload);
          queryClient.invalidateQueries({ queryKey: ['actors'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny skådespelare tillagd');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Skådespelare uppdaterad');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Skådespelare borttagen');
          }
        }
      )
      .subscribe();

    const interestSignupsChannel = supabase
      .channel('interest-signups-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'interest_signups' },
        (payload) => {
          console.log('Interest signups change:', payload);
          queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Nytt intresse skapat');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Intresse uppdaterat');
          }
        }
      )
      .subscribe();

    const interestSubmissionsChannel = supabase
      .channel('interest-submissions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'interest_signup_submissions' },
        (payload) => {
          console.log('Interest submissions change:', payload);
          queryClient.invalidateQueries({ queryKey: ['interest-submissions'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny intresseanmälan mottagen!');
          }
        }
      )
      .subscribe();

    const emailTemplatesChannel = supabase
      .channel('email-templates-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'email_templates' },
        (payload) => {
          console.log('Email templates change:', payload);
          queryClient.invalidateQueries({ queryKey: ['email-templates'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny email-mall skapad');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Email-mall uppdaterad');
          }
        }
      )
      .subscribe();

    const emailContactsChannel = supabase
      .channel('email-contacts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'email_contacts' },
        (payload) => {
          console.log('Email contacts change:', payload);
          queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny kontakt tillagd');
          }
        }
      )
      .subscribe();

    const sentEmailsChannel = supabase
      .channel('sent-emails-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sent_emails' },
        (payload) => {
          console.log('Sent emails change:', payload);
          queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Email skickat');
          }
        }
      )
      .subscribe();

    const userRolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        (payload) => {
          console.log('User roles change:', payload);
          queryClient.invalidateQueries({ queryKey: ['users'] });
          
          if (payload.eventType === 'INSERT') {
            toast.success('Ny användarroll tilldelad');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Användarroll uppdaterad');
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time admin subscriptions...');
      supabase.removeChannel(adminShowsChannel);
      supabase.removeChannel(courseInstancesChannel);
      supabase.removeChannel(ticketPurchasesChannel);
      supabase.removeChannel(coursePurchasesChannel);
      supabase.removeChannel(performersChannel);
      supabase.removeChannel(actorsChannel);
      supabase.removeChannel(interestSignupsChannel);
      supabase.removeChannel(interestSubmissionsChannel);
      supabase.removeChannel(emailTemplatesChannel);
      supabase.removeChannel(emailContactsChannel);
      supabase.removeChannel(sentEmailsChannel);
      supabase.removeChannel(userRolesChannel);
    };
  }, [queryClient]);
};
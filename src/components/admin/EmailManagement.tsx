import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Send, Users, Ticket, FileText, Plus, Edit, Trash2, Eye, Heart, Download, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  description?: string;
  created_at?: string;
}

interface EmailGroup {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

interface EmailContact {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  source: string;
  source_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  type: 'course' | 'tickets' | 'interest' | 'all';
  description?: string;
}

interface EmailManagementProps {
  activeTab?: string;
}

export const EmailManagement: React.FC<EmailManagementProps> = ({ activeTab = 'send' }) => {
  const [selectedRecipients, setSelectedRecipients] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    description: ''
  });
  
  // New state for group management
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EmailGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });
  const [selectedCourseForImport, setSelectedCourseForImport] = useState<string>('');
  const [selectedGroupForImport, setSelectedGroupForImport] = useState<string>('');
  const [viewingGroupMembers, setViewingGroupMembers] = useState<string | null>(null);
  
  // New state for contact management
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmailContact | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // State for adding members to groups
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedContactsToAdd, setSelectedContactsToAdd] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recipient groups
  const { data: recipientGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['admin-email-recipients'],
    queryFn: async (): Promise<RecipientGroup[]> => {
      const groups: RecipientGroup[] = [];

      // Get course instances with booking counts
      const { data: courseInstances } = await supabase
        .from('course_instances')
        .select('*')
        .eq('is_active', true);

      if (courseInstances) {
        for (const course of courseInstances) {
          try {
            const { data: bookingCount } = await supabase.rpc('get_course_booking_count', {
              table_name: course.table_name
            });
            if (bookingCount && bookingCount > 0) {
              groups.push({
                id: course.table_name,
                name: `Kurs: ${course.course_title}`,
                count: bookingCount,
                type: 'course',
                description: `Deltagare i kursen ${course.course_title}`
              });
            }
          } catch (error) {
            console.warn(`Failed to get booking count for ${course.table_name}`);
          }
        }
      }

      // Get interest signups
      const { data: interestSignups } = await supabase
        .from('interest_signup_submissions')
        .select('interest_signup_id, interest_signups(title)');

      if (interestSignups) {
        const interestGroups = new Map();
        interestSignups.forEach(submission => {
          const title = submission.interest_signups?.title;
          if (title) {
            const key = `interest_${submission.interest_signup_id}`;
            if (interestGroups.has(key)) {
              interestGroups.set(key, interestGroups.get(key) + 1);
            } else {
              interestGroups.set(key, { title, count: 1, id: submission.interest_signup_id });
            }
          }
        });

        interestGroups.forEach((group, key) => {
          groups.push({
            id: key,
            name: `Intresse: ${group.title}`,
            count: group.count,
            type: 'interest',
            description: `Personer som intresseanmält sig till ${group.title}`
          });
        });
      }

      // Get unique ticket buyers
      const { data: ticketBuyers } = await supabase
        .from('ticket_purchases')
        .select('buyer_email')
        .eq('payment_status', 'paid');

      if (ticketBuyers) {
        const uniqueBuyers = new Set(ticketBuyers.map(t => t.buyer_email));
        groups.push({
          id: 'all_ticket_buyers',
          name: 'Alla biljettköpare',
          count: uniqueBuyers.size,
          type: 'tickets',
          description: 'Alla personer som köpt biljetter till föreställningar'
        });
      }

      // Get all contacts combined
      const allEmails = new Set();
      
      // Add interest signups
      const { data: allInterestEmails } = await supabase
        .from('interest_signup_submissions')
        .select('email');
      allInterestEmails?.forEach(p => allEmails.add(p.email));

      // Add ticket buyers
      ticketBuyers?.forEach(p => allEmails.add(p.buyer_email));

      // Add course bookings from the generic table
      const { data: courseBookings } = await supabase
        .from('course_bookings')
        .select('email');
      courseBookings?.forEach(p => allEmails.add(p.email));

      groups.push({
        id: 'all_contacts',
        name: 'Alla kontakter',
        count: allEmails.size,
        type: 'all',
        description: 'Alla personer som haft kontakt med oss (kurser, intresse, biljetter)'
      });

      return groups;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch email groups from database
  const { data: emailGroups, isLoading: emailGroupsLoading } = useQuery({
    queryKey: ['email-groups'],
    queryFn: async (): Promise<EmailGroup[]> => {
      // First get all groups
      const { data: groups, error: groupsError } = await supabase
        .from('email_groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;
      if (!groups) return [];

      // Then get member counts for each group
      const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
          const { count, error: countError } = await supabase
            .from('email_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (countError) {
            console.warn(`Failed to get count for group ${group.id}:`, countError);
            return { ...group, member_count: 0 };
          }

          return { ...group, member_count: count || 0 };
        })
      );

      return groupsWithCounts;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch all email contacts
  const { data: emailContacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['email-contacts'],
    queryFn: async (): Promise<EmailContact[]> => {
      const { data, error } = await supabase
        .from('email_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch group members when viewing a specific group
  const { data: groupMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['group-members', viewingGroupMembers],
    queryFn: async (): Promise<EmailContact[]> => {
      if (!viewingGroupMembers) return [];
      
      const { data, error } = await supabase
        .from('email_group_members')
        .select(`
          email_contacts (*)
        `)
        .eq('group_id', viewingGroupMembers);

      if (error) throw error;
      return data?.map(member => member.email_contacts).filter(Boolean) || [];
    },
    enabled: !!viewingGroupMembers,
    staleTime: 1 * 60 * 1000,
  });

  // Remove member from group mutation
  const removeMemberMutation = useMutation({
    mutationFn: async ({ groupId, contactId }: { groupId: string; contactId: string }) => {
      const { error } = await supabase
        .from('email_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('contact_id', contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Medlem borttagen",
        description: "Kontakten har tagits bort från gruppen.",
      });
      queryClient.invalidateQueries({ queryKey: ['group-members', viewingGroupMembers] });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
    },
    onError: () => {
      toast({
        title: "Fel vid borttagning",
        description: "Det gick inte att ta bort medlemmen.",
        variant: "destructive",
      });
    }
  });

  // Sync contacts mutation
  const syncContactsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('sync_email_contacts');
      if (error) throw error;
      return data;
    },
    onSuccess: (syncedCount) => {
      toast({
        title: "Kontakter synkroniserade!",
        description: `${syncedCount} kontakter har uppdaterats.`,
      });
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
    },
    onError: () => {
      toast({
        title: "Synkronisering misslyckades",
        description: "Det gick inte att synkronisera kontakterna.",
        variant: "destructive",
      });
    }
  });

  // Import course to group mutation
  const importCourseToGroupMutation = useMutation({
    mutationFn: async ({ courseTableName, groupId }: { courseTableName: string; groupId: string }) => {
      const { data, error } = await supabase.rpc('import_course_to_group', {
        course_table_name: courseTableName,
        target_group_id: groupId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (importedCount) => {
      toast({
        title: "Import lyckades!",
        description: `${importedCount} kontakter har importerats till gruppen.`,
      });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
      setSelectedCourseForImport('');
      setSelectedGroupForImport('');
    },
    onError: () => {
      toast({
        title: "Import misslyckades",
        description: "Det gick inte att importera kontakterna.",
        variant: "destructive",
      });
    }
  });

  // Create/update group mutation
  const saveGroupMutation = useMutation({
    mutationFn: async (group: Partial<EmailGroup> & { name: string }) => {
      if (editingGroup) {
        const { data, error } = await supabase
          .from('email_groups')
          .update({
            name: group.name,
            description: group.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGroup.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('email_groups')
          .insert({
            name: group.name,
            description: group.description
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: editingGroup ? "Grupp uppdaterad!" : "Grupp skapad!",
        description: editingGroup ? "Gruppen har uppdaterats." : "Den nya gruppen har skapats.",
      });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
    },
    onError: () => {
      toast({
        title: "Fel vid sparning",
        description: "Det gick inte att spara gruppen.",
        variant: "destructive",
      });
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('email_groups')
        .update({ is_active: false })
        .eq('id', groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Grupp borttagen",
        description: "Gruppen har tagits bort.",
      });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
    },
    onError: () => {
      toast({
        title: "Fel vid borttagning",
        description: "Det gick inte att ta bort gruppen.",
        variant: "destructive",
      });
    }
  });

  // Create/save manual contact mutation
  const saveContactMutation = useMutation({
    mutationFn: async (contact: { name: string; email: string; phone: string }) => {
      if (editingContact) {
        // Update existing contact
        const { data, error } = await supabase
          .from('email_contacts')
          .update({
            name: contact.name,
            email: contact.email.toLowerCase(),
            phone: contact.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContact.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Create new contact
        const { data, error } = await supabase
          .from('email_contacts')
          .insert({
            name: contact.name,
            email: contact.email.toLowerCase(),
            phone: contact.phone,
            source: 'manual'
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: editingContact ? "Kontakt uppdaterad!" : "Kontakt skapad!",
        description: editingContact ? "Kontakten har uppdaterats." : "Den nya kontakten har lagts till.",
      });
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
      setIsContactDialogOpen(false);
      setEditingContact(null);
      setContactForm({ name: '', email: '', phone: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Fel vid sparning",
        description: error.message?.includes('duplicate key') 
          ? "En kontakt med denna e-postadress finns redan."
          : "Det gick inte att spara kontakten.",
        variant: "destructive",
      });
    }
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('email_contacts')
        .delete()
        .eq('id', contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Kontakt borttagen",
        description: "Kontakten har tagits bort.",
      });
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
    },
    onError: () => {
      toast({
        title: "Fel vid borttagning",
        description: "Det gick inte att ta bort kontakten.",
        variant: "destructive",
      });
    }
  });

  // Add members to group mutation
  const addMembersToGroupMutation = useMutation({
    mutationFn: async ({ groupId, contactIds }: { groupId: string; contactIds: string[] }) => {
      const membersToAdd = contactIds.map(contactId => ({
        group_id: groupId,
        contact_id: contactId
      }));

      const { error } = await supabase
        .from('email_group_members')
        .insert(membersToAdd);
      if (error) throw error;
      
      return contactIds.length;
    },
    onSuccess: (addedCount) => {
      toast({
        title: "Medlemmar tillagda!",
        description: `${addedCount} kontakt${addedCount > 1 ? 'er' : ''} har lagts till i gruppen.`,
      });
      queryClient.invalidateQueries({ queryKey: ['group-members', viewingGroupMembers] });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
      queryClient.invalidateQueries({ queryKey: ['available-contacts', viewingGroupMembers] });
      setIsAddMemberDialogOpen(false);
      setSelectedContactsToAdd([]);
    },
    onError: () => {
      toast({
        title: "Fel vid tilläggning",
        description: "Det gick inte att lägga till medlemmarna.",
        variant: "destructive",
      });
    }
  });

  // Fetch contacts not in current group
  const { data: availableContacts, isLoading: availableContactsLoading } = useQuery({
    queryKey: ['available-contacts', viewingGroupMembers],
    queryFn: async (): Promise<EmailContact[]> => {
      if (!viewingGroupMembers) return [];
      
      // Get all contacts
      const { data: allContacts, error: contactsError } = await supabase
        .from('email_contacts')
        .select('*')
        .order('name');
      
      if (contactsError) throw contactsError;
      if (!allContacts) return [];

      // Get current group members
      const { data: currentMembers, error: membersError } = await supabase
        .from('email_group_members')
        .select('contact_id')
        .eq('group_id', viewingGroupMembers);
        
      if (membersError) throw membersError;
      
      const memberContactIds = new Set(currentMembers?.map(m => m.contact_id) || []);
      
      // Return contacts not in the group
      return allContacts.filter(contact => !memberContactIds.has(contact.id));
    },
    enabled: !!viewingGroupMembers && isAddMemberDialogOpen,
    staleTime: 1 * 60 * 1000,
  });

  // Fetch course instances for import
  const { data: courseInstances } = useQuery({
    queryKey: ['course-instances-for-import'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('is_active', true)
        .order('course_title');

      if (error) throw error;
      return data || [];
    },
  });

  // Mock email templates - in a real app these would come from database
  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async (): Promise<EmailTemplate[]> => {
      // In a real implementation, fetch from database
      return [
        {
          id: 'welcome',
          name: 'Välkomstmejl',
          subject: 'Välkommen till [KURSNAMN]!',
          content: 'Hej [NAMN]!\n\nVälkommen till kursen [KURSNAMN]. Vi ser fram emot att träffa dig!\n\nMed vänliga hälsningar,\nLIT-teamet',
          description: 'Standardmejl för att välkomna nya kursdeltagare'
        },
        {
          id: 'practical_info',
          name: 'Praktisk information',
          subject: 'Praktisk information inför [KURSNAMN]',
          content: 'Hej [NAMN]!\n\nHär kommer praktisk information inför kursstarten:\n\n- Plats: [PLATS]\n- Tid: [TID]\n- Ta med: [UTRUSTNING]\n\nVi ses snart!\n\nLIT-teamet',
          description: 'Mall för praktisk information inför kursstart'
        },
        {
          id: 'reminder',
          name: 'Påminnelse',
          subject: 'Påminnelse: [KURSNAMN] startar snart!',
          content: 'Hej [NAMN]!\n\nEn påminnelse om att [KURSNAMN] startar [DATUM].\n\nVi ser fram emot att träffa dig!\n\nLIT-teamet',
          description: 'Påminnelsemejl inför kursstart'
        },
        {
          id: 'show_reminder',
          name: 'Föreställningspåminnelse',
          subject: 'Imorgon är det dags - [FÖRESTÄLLNING]!',
          content: 'Hej [NAMN]!\n\nImorgon är det dags för [FÖRESTÄLLNING]!\n\n- Tid: [TID]\n- Plats: [PLATS]\n- Adress: [ADRESS]\n\nVi ser fram emot att träffa dig!\n\nLIT-teamet',
          description: 'Påminnelse inför föreställning'
        }
      ];
    }
  });

  const handleSendEmail = async () => {
    if (!selectedRecipients || !emailSubject || !emailContent) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Vänligen fyll i alla fält innan du skickar mejlet.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          recipientGroup: selectedRecipients,
          subject: emailSubject,
          content: emailContent
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const { sent, total, errors } = data;
      
      toast({
        title: "Email skickat!",
        description: `Mejlet har skickats till ${sent} av ${total} mottagare.${errors && errors.length > 0 ? ` ${errors.length} mejl kunde inte skickas.` : ''}`,
      });
      
      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedRecipients('');
      setSelectedTemplate('');
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "Fel vid skickning",
        description: error.message || "Det gick inte att skicka mejlet. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
    setSelectedTemplate(template.id);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Namn, ämne och innehåll är obligatoriska.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Save to database
      toast({
        title: "Mall sparad!",
        description: "Email-mallen har sparats.",
      });
      
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', content: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error) {
      toast({
        title: "Fel vid sparning",
        description: "Det gick inte att spara mallen.",
        variant: "destructive",
      });
    }
  };

  const openTemplateDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        description: template.description || ''
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({ name: '', subject: '', content: '', description: '' });
    }
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // TODO: Delete from database
      toast({
        title: "Mall borttagen",
        description: "Email-mallen har tagits bort.",
      });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error) {
      toast({
        title: "Fel vid borttagning",
        description: "Det gick inte att ta bort mallen.",
        variant: "destructive",
      });
    }
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'course': return Users;
      case 'tickets': return Ticket;
      case 'interest': return Heart;
      case 'all': return Mail;
      default: return Users;
    }
  };

  const handleSaveContact = async () => {
    if (!contactForm.name || !contactForm.email) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Namn och e-postadress är obligatoriska.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast({
        title: "Ogiltig e-postadress",
        description: "Vänligen ange en giltig e-postadress.",
        variant: "destructive",
      });
      return;
    }

    saveContactMutation.mutate(contactForm);
  };

  const openContactDialog = (contact?: EmailContact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        name: contact.name || '',
        email: contact.email,
        phone: contact.phone || ''
      });
    } else {
      setEditingContact(null);
      setContactForm({ name: '', email: '', phone: '' });
    }
    setIsContactDialogOpen(true);
  };

  const handleAddMembersToGroup = async () => {
    if (!viewingGroupMembers || selectedContactsToAdd.length === 0) {
      toast({
        title: "Inga kontakter valda",
        description: "Välj minst en kontakt att lägga till.",
        variant: "destructive",
      });
      return;
    }

    addMembersToGroupMutation.mutate({
      groupId: viewingGroupMembers,
      contactIds: selectedContactsToAdd
    });
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContactsToAdd(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const openGroupDialog = (group?: EmailGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        description: group.description || ''
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
    }
    setIsGroupDialogOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupForm.name) {
      toast({
        title: "Namn krävs",
        description: "Gruppens namn är obligatoriskt.",
        variant: "destructive",
      });
      return;
    }

    saveGroupMutation.mutate(groupForm);
  };

  const handleImportCourseToGroup = async () => {
    if (!selectedCourseForImport || !selectedGroupForImport) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Välj både kurs och målgrupp för import.",
        variant: "destructive",
      });
      return;
    }

    importCourseToGroupMutation.mutate({
      courseTableName: selectedCourseForImport,
      groupId: selectedGroupForImport
    });
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'course': return 'Kurs';
      case 'ticket': return 'Biljett';
      case 'interest': return 'Intresse';
      case 'manual': return 'Manuell';
      default: return source;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} className="w-full">
        {/* Remove TabsList - navigation handled by AdminNavigation */}

        {/* Send Email Tab */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Skicka email
              </CardTitle>
              <CardDescription>
                Skicka meddelanden till valda mottagargrupper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipients">Mottagare</Label>
                <Select value={selectedRecipients} onValueChange={setSelectedRecipients}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj mottagargrupp" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Automatiskt skapade grupper */}
                    {recipientGroups?.map((group) => {
                      const IconComponent = getGroupIcon(group.type);
                      return (
                        <SelectItem key={group.id} value={group.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {group.name}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {group.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                    
                    {/* Manuellt skapade grupper */}
                    {emailGroups?.map((group) => (
                      <SelectItem key={`manual_${group.id}`} value={`manual_${group.id}`}>
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {group.name}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {group.member_count || 0}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Använd mall (valfritt)</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  const template = emailTemplates.find(t => t.id === value);
                  if (template) {
                    handleUseTemplate(template);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj en mall att börja med" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Ämne</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Ange ämnesrad för mejlet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Meddelande</Label>
                <Textarea
                  id="content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Skriv ditt meddelande här..."
                  rows={12}
                />
                <p className="text-sm text-muted-foreground">
                  Du kan använda följande variabler: [NAMN], [KURSNAMN], [FÖRESTÄLLNING], [DATUM], [TID], [PLATS], [ADRESS]
                </p>
              </div>

              <Button 
                onClick={handleSendEmail}
                disabled={isLoading || !selectedRecipients || !emailSubject || !emailContent}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Skickar...' : 'Skicka meddelande'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          {viewingGroupMembers ? (
            // Group Members View
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingGroupMembers(null)}
                    >
                      ← Tillbaka
                    </Button>
                    <Users className="w-5 h-5" />
                    Redigera grupp
                  </div>
                </CardTitle>
                <CardDescription>
                  Redigera gruppinformation och hantera medlemmar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Group Information Editor */}
                <div className="mb-6 p-4 border rounded-lg bg-muted/20">
                  <h3 className="text-lg font-semibold mb-4">Gruppinformation</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-group-name">Namn</Label>
                      <Input
                        id="edit-group-name"
                        value={groupForm.name}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Gruppnamn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-group-description">Beskrivning (valfritt)</Label>
                      <Textarea
                        id="edit-group-description"
                        value={groupForm.description}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Beskrivning av gruppen"
                        rows={2}
                      />
                    </div>
                    <Button 
                      onClick={handleSaveGroup} 
                      disabled={saveGroupMutation.isPending}
                      size="sm"
                    >
                      {saveGroupMutation.isPending ? 'Sparar...' : 'Spara ändringar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
               <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <span>Medlemmar</span>
                   <Button 
                     onClick={() => setIsAddMemberDialogOpen(true)}
                     size="sm"
                   >
                     <Plus className="w-4 h-4 mr-2" />
                     Lägg till medlemmar
                   </Button>
                 </CardTitle>
                 <CardDescription>
                   Hantera medlemmar i gruppen
                 </CardDescription>
               </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      Totalt: {groupMembers?.length || 0} medlemmar
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Namn</TableHead>
                          <TableHead>E-post</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Källa</TableHead>
                          <TableHead className="w-20">Åtgärder</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupMembers?.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell className="font-medium">
                              {contact.name || 'Okänt namn'}
                            </TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.phone || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getSourceLabel(contact.source)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Ta bort från grupp</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Är du säker på att du vill ta bort {contact.name || contact.email} från gruppen?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => removeMemberMutation.mutate({
                                        groupId: viewingGroupMembers,
                                        contactId: contact.id
                                      })}
                                    >
                                      Ta bort
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Groups Overview
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mottagargrupper
                </div>
                <Button onClick={() => openGroupDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ny grupp
                </Button>
              </CardTitle>
              <CardDescription>
                Hantera alla dina mottagargrupper
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupsLoading || emailGroupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Custom Groups */}
                  {emailGroups && emailGroups.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Egna grupper</h3>
                      <div className="space-y-3">
                        {emailGroups.map((group) => (
                          <Card key={group.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <h4 className="font-semibold">{group.name}</h4>
                                  {group.description && (
                                    <p className="text-sm text-muted-foreground">{group.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="px-3 py-1">
                                  {group.member_count || 0} medlemmar
                                </Badge>
                                 <div className="flex gap-1">
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => {
                                       const groupToEdit = emailGroups?.find(g => g.id === group.id);
                                       if (groupToEdit) {
                                         setGroupForm({
                                           name: groupToEdit.name,
                                           description: groupToEdit.description || ''
                                         });
                                         setEditingGroup(groupToEdit);
                                       }
                                       setViewingGroupMembers(group.id);
                                     }}
                                   >
                                     <Edit className="w-4 h-4" />
                                   </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Ta bort grupp</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Är du säker på att du vill ta bort gruppen "{group.name}"?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteGroupMutation.mutate(group.id)}>
                                          Ta bort
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Automatic Groups */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Automatiska grupper</h3>
                    <div className="space-y-3">
                      {recipientGroups?.map((group) => {
                        const IconComponent = getGroupIcon(group.type);
                        return (
                          <Card key={group.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <IconComponent className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <h4 className="font-semibold">{group.name}</h4>
                                  {group.description && (
                                    <p className="text-sm text-muted-foreground">{group.description}</p>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="px-3 py-1">
                                {group.count} personer
                              </Badge>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Alla kontakter
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => openContactDialog()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Lägg till kontakt
                  </Button>
                  <Button 
                    onClick={() => syncContactsMutation.mutate()}
                    disabled={syncContactsMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncContactsMutation.isPending ? 'animate-spin' : ''}`} />
                    Synkronisera
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Alla dina kontakter från kurser, biljetter och intresseanmälningar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Totalt: {emailContacts?.length || 0} kontakter
                  </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Namn</TableHead>
                          <TableHead>E-post</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Källa</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead className="w-24">Åtgärder</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailContacts?.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell className="font-medium">
                              {contact.name || 'Okänt namn'}
                            </TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.phone || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getSourceLabel(contact.source)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(contact.created_at).toLocaleDateString('sv-SE')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openContactDialog(contact)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ta bort kontakt</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Är du säker på att du vill ta bort {contact.name || contact.email}? 
                                        Detta kan inte ångras.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => deleteContactMutation.mutate(contact.id)}
                                      >
                                        Ta bort
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importera kontakter
              </CardTitle>
              <CardDescription>
                Importera kontakter från kurser till dina grupper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="course-select">Välj kurs att importera från</Label>
                <Select value={selectedCourseForImport} onValueChange={setSelectedCourseForImport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj en kurs" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseInstances?.map((course) => (
                      <SelectItem key={course.table_name} value={course.table_name}>
                        {course.course_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="group-select">Välj målgrupp</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openGroupDialog()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ny grupp
                  </Button>
                </div>
                <Select value={selectedGroupForImport} onValueChange={setSelectedGroupForImport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj grupp att importera till" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailGroups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.member_count || 0} medlemmar)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleImportCourseToGroup}
                disabled={
                  !selectedCourseForImport || 
                  !selectedGroupForImport || 
                  importCourseToGroupMutation.isPending
                }
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {importCourseToGroupMutation.isPending ? 'Importerar...' : 'Importera kontakter'}
              </Button>

              <div className="p-4 bg-muted/50 rounded-md">
                <h4 className="font-medium mb-2">Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Kontakter som redan finns uppdateras med ny information</li>
                  <li>• Inga dubbletter skapas - samma email-adress = samma kontakt</li>
                  <li>• Kontakter läggs till i den valda gruppen</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Email-mallar
                </div>
                <Button onClick={() => openTemplateDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ny mall
                </Button>
              </CardTitle>
              <CardDescription>
                Hantera dina email-mallar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>Ämne</TableHead>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead className="w-32">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {template.description || 'Ingen beskrivning'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTemplateDialog(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ta bort mall</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill ta bort mallen "{template.name}"? 
                                  Detta kan inte ångras.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
                                  Ta bort
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Redigera mall' : 'Skapa ny mall'}
            </DialogTitle>
            <DialogDescription>
              Skapa eller redigera en email-mall
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Namn</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="T.ex. Välkomstmejl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Beskrivning (valfritt)</Label>
              <Input
                id="template-description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="kort beskrivning av mallen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Ämne</Label>
              <Input
                id="template-subject"
                value={templateForm.subject}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ämnesrad för mejlet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content">Innehåll</Label>
              <Textarea
                id="template-content"
                value={templateForm.content}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Email-innehåll..."
                rows={10}
              />
              <p className="text-sm text-muted-foreground">
                Använd variabler som [NAMN], [KURSNAMN], [DATUM] etc.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate ? 'Uppdatera' : 'Skapa'} mall
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Redigera grupp' : 'Skapa ny grupp'}
            </DialogTitle>
            <DialogDescription>
              Skapa eller redigera en mottagargrupp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Namn</Label>
              <Input
                id="group-name"
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="T.ex. Vårterminens deltagare"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Beskrivning (valfritt)</Label>
              <Textarea
                id="group-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beskriv vad denna grupp används till"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Avbryt
              </Button>
              <Button onClick={handleSaveGroup} disabled={saveGroupMutation.isPending}>
                {saveGroupMutation.isPending ? 'Sparar...' : (editingGroup ? 'Uppdatera' : 'Skapa')} grupp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Redigera kontakt' : 'Lägg till ny kontakt'}
            </DialogTitle>
            <DialogDescription>
              {editingContact ? 'Redigera kontaktuppgifter' : 'Lägg till en kontakt manuellt'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Namn *</Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Förnamn Efternamn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">E-postadress *</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="exempel@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Telefonnummer</Label>
              <Input
                id="contact-phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="070-123 45 67"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleSaveContact} 
                disabled={saveContactMutation.isPending}
              >
                {saveContactMutation.isPending ? 'Sparar...' : (editingContact ? 'Uppdatera kontakt' : 'Spara kontakt')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lägg till medlemmar i grupp</DialogTitle>
            <DialogDescription>
              Välj kontakter att lägga till som medlemmar i gruppen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableContactsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableContacts && availableContacts.length > 0 ? (
              <div>
                <div className="mb-4 text-sm text-muted-foreground">
                  {availableContacts.length} tillgängliga kontakter (klicka för att välja)
                </div>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Namn</TableHead>
                        <TableHead>E-post</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Källa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableContacts.map((contact) => (
                        <TableRow 
                          key={contact.id}
                          className={`cursor-pointer hover:bg-muted/50 ${
                            selectedContactsToAdd.includes(contact.id) ? 'bg-muted' : ''
                          }`}
                          onClick={() => toggleContactSelection(contact.id)}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedContactsToAdd.includes(contact.id)}
                              onChange={() => toggleContactSelection(contact.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {contact.name || 'Okänt namn'}
                          </TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getSourceLabel(contact.source)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {selectedContactsToAdd.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>{selectedContactsToAdd.length}</strong> kontakt{selectedContactsToAdd.length > 1 ? 'er' : ''} vald{selectedContactsToAdd.length > 1 ? 'a' : ''}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Inga tillgängliga kontakter att lägga till.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Alla kontakter är redan medlemmar i denna grupp.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                Avbryt
              </Button>
              <Button 
                onClick={handleAddMembersToGroup}
                disabled={selectedContactsToAdd.length === 0 || addMembersToGroupMutation.isPending}
              >
                {addMembersToGroupMutation.isPending 
                  ? 'Lägger till...' 
                  : `Lägg till ${selectedContactsToAdd.length > 0 ? selectedContactsToAdd.length : ''} medlem${selectedContactsToAdd.length !== 1 ? 'mar' : ''}`
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
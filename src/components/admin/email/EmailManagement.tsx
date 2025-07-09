import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmailSendForm } from './EmailSendForm';
import { EmailTemplatesManager } from './EmailTemplatesManager';
import { EmailGroupsManager } from './EmailGroupsManager';
import { EmailContactsManager } from './EmailContactsManager';
import { ContactActivitiesDialog } from './ContactActivitiesDialog';
import { CourseImportDialog } from './CourseImportDialog';
import { GroupMembersDialog } from './GroupMembersDialog';
import { EmailTemplate, EmailGroup, EmailContact, GroupMember, EmailManagementProps } from './types';

export function EmailManagement({ activeTab = 'send' }: EmailManagementProps) {
  const [selectedRecipients, setSelectedRecipients] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<EmailGroup | null>(null);
  const [showGroupMembersDialog, setShowGroupMembersDialog] = useState(false);
  const [showActivitiesDialog, setShowActivitiesDialog] = useState(false);
  const [selectedContactEmail, setSelectedContactEmail] = useState('');
  const [groupMemberCounts, setGroupMemberCounts] = useState<{[key: string]: number}>({});

  // Fetch email templates
  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Fetch email groups
  const { data: emailGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['email-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as EmailGroup[];
    }
  });

  // Fetch email contacts
  const { data: emailContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['email-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailContact[];
    }
  });

  // Fetch group members for selected recipients
  const { data: groupMembers = [] } = useQuery({
    queryKey: ['group-members', selectedRecipients],
    queryFn: async () => {
      if (!selectedRecipients || selectedRecipients === 'all') return [];
      
      const { data, error } = await supabase
        .from('email_group_members')
        .select(`
          id,
          group_id,
          contact_id,
          contact:email_contacts(*)
        `)
        .eq('group_id', selectedRecipients);

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!selectedRecipients && selectedRecipients !== 'all'
  });

  // Fetch group members for the selected group dialog
  const { data: selectedGroupMembers = [] } = useQuery({
    queryKey: ['group-members-dialog', selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup?.id) return [];
      
      const { data, error } = await supabase
        .from('email_group_members')
        .select(`
          id,
          group_id,
          contact_id,
          contact:email_contacts(*)
        `)
        .eq('group_id', selectedGroup.id);

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!selectedGroup?.id
  });

  // Fetch group member counts
  useEffect(() => {
    const fetchGroupMemberCounts = async () => {
      if (!emailGroups.length) return;
      
      const counts: {[key: string]: number} = {};
      
      for (const group of emailGroups) {
        const { count, error } = await supabase
          .from('email_group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
        
        if (!error) {
          counts[group.id] = count || 0;
        }
      }
      
      setGroupMemberCounts(prevCounts => {
        const hasChanged = Object.keys(counts).some(key => counts[key] !== prevCounts[key]) || 
                          Object.keys(prevCounts).some(key => !(key in counts));
        return hasChanged ? counts : prevCounts;
      });
    };

    fetchGroupMemberCounts();
  }, [emailGroups]);

  const handleViewGroupMembers = (group: EmailGroup) => {
    setSelectedGroup(group);
    setShowGroupMembersDialog(true);
  };

  const handleViewActivities = (email: string) => {
    setSelectedContactEmail(email);
    setShowActivitiesDialog(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'send':
        return (
          <EmailSendForm
            emailTemplates={emailTemplates}
            emailGroups={emailGroups}
            emailContacts={emailContacts}
            groupMembers={groupMembers}
            templatesLoading={templatesLoading}
          />
        );
      
      case 'templates':
        return (
          <EmailTemplatesManager
            emailTemplates={emailTemplates}
            templatesLoading={templatesLoading}
          />
        );
      
      case 'groups':
        return (
          <EmailGroupsManager
            emailGroups={emailGroups}
            groupsLoading={groupsLoading}
            groupMemberCounts={groupMemberCounts}
            onViewGroupMembers={handleViewGroupMembers}
          />
        );
      
      case 'contacts':
        return (
          <div className="space-y-6">
            <CourseImportDialog
              emailGroups={emailGroups}
              groupMemberCounts={groupMemberCounts}
            />
            <EmailContactsManager
              emailContacts={emailContacts}
              contactsLoading={contactsLoading}
              onViewActivities={handleViewActivities}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Email-hantering</h2>
      </div>

      <div className="space-y-4">
        {renderContent()}
      </div>

      <ContactActivitiesDialog
        open={showActivitiesDialog}
        onOpenChange={setShowActivitiesDialog}
        contactEmail={selectedContactEmail}
      />

      <GroupMembersDialog
        open={showGroupMembersDialog}
        onOpenChange={setShowGroupMembersDialog}
        group={selectedGroup}
        groupMembers={selectedGroupMembers}
      />
    </div>
  );
}

export default EmailManagement;
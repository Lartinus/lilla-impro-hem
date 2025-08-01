import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, Mail, Phone, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailGroup, EmailContact } from './types';

interface AddContactsToGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailGroups: EmailGroup[];
  emailContacts: EmailContact[];
  groupMemberCounts: {[key: string]: number};
}

export function AddContactsToGroupsDialog({ 
  open, 
  onOpenChange,
  emailGroups,
  emailContacts,
  groupMemberCounts 
}: AddContactsToGroupsDialogProps) {
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!contactSearchTerm) return emailContacts;
    
    const term = contactSearchTerm.toLowerCase();
    return emailContacts.filter(contact => 
      contact.email.toLowerCase().includes(term) ||
      contact.name?.toLowerCase().includes(term) ||
      contact.phone?.includes(term)
    );
  }, [emailContacts, contactSearchTerm]);

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    if (!groupSearchTerm) return emailGroups;
    
    const term = groupSearchTerm.toLowerCase();
    return emailGroups.filter(group => 
      group.name.toLowerCase().includes(term) ||
      group.description?.toLowerCase().includes(term)
    );
  }, [emailGroups, groupSearchTerm]);

  // Get existing group memberships for selected contacts
  const { data: existingMemberships = [] } = useQuery({
    queryKey: ['existing-memberships', Array.from(selectedContacts)],
    queryFn: async () => {
      if (selectedContacts.size === 0) return [];
      
      const { data, error } = await supabase
        .from('email_group_members')
        .select('contact_id, group_id')
        .in('contact_id', Array.from(selectedContacts));

      if (error) throw error;
      return data;
    },
    enabled: selectedContacts.size > 0
  });

  const handleContactToggle = (contactId: string) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedContacts(newSelection);
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const handleSelectAllGroups = () => {
    if (selectedGroups.size === filteredGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(filteredGroups.map(g => g.id)));
    }
  };

  const handleGroupToggle = (groupId: string) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    setSelectedGroups(newSelection);
  };

  const getContactMembershipStatus = (contactId: string, groupId: string) => {
    return existingMemberships.some(m => m.contact_id === contactId && m.group_id === groupId);
  };

  const handleAddToGroups = async () => {
    if (selectedContacts.size === 0 || selectedGroups.size === 0) {
      toast({
        title: "Välj kontakter och grupper",
        description: "Du måste välja minst en kontakt och en grupp.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      const membershipsToAdd = [];
      
      for (const contactId of selectedContacts) {
        for (const groupId of selectedGroups) {
          // Skip if already a member
          if (!getContactMembershipStatus(contactId, groupId)) {
            membershipsToAdd.push({
              contact_id: contactId,
              group_id: groupId
            });
          }
        }
      }

      if (membershipsToAdd.length === 0) {
        toast({
          title: "Inga nya medlemskap",
          description: "Alla valda kontakter är redan medlemmar i de valda grupperna.",
        });
        return;
      }

      const { error } = await supabase
        .from('email_group_members')
        .insert(membershipsToAdd);

      if (error) throw error;

      const contactCount = selectedContacts.size;
      const groupCount = selectedGroups.size;
      const addedCount = membershipsToAdd.length;

      toast({
        title: "Kontakter tillagda!",
        description: `${addedCount} nya medlemskap skapade för ${contactCount} kontakter i ${groupCount} grupper.`,
      });

      // Reset selections
      setSelectedContacts(new Set());
      setSelectedGroups(new Set());
      setContactSearchTerm('');
      setGroupSearchTerm('');

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['group-members-dialog'] });

    } catch (error: any) {
      toast({
        title: "Fel vid tillägg",
        description: error.message || "Det gick inte att lägga till kontakter i grupperna.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedContacts(new Set());
    setSelectedGroups(new Set());
    setContactSearchTerm('');
    setGroupSearchTerm('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Lägg till kontakter i grupper
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Selection */}
          <div className="space-y-3 flex flex-col h-full">
            <Label className="text-sm font-medium">Välj grupper</Label>
            
            {/* Group Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök grupper..."
                value={groupSearchTerm}
                onChange={(e) => setGroupSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Select All Groups */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-groups"
                  checked={filteredGroups.length > 0 && selectedGroups.size === filteredGroups.length}
                  onCheckedChange={handleSelectAllGroups}
                />
                <Label htmlFor="select-all-groups" className="text-sm cursor-pointer">
                  Välj alla ({filteredGroups.length} grupper)
                </Label>
              </div>
              {selectedGroups.size > 0 && (
                <Badge variant="secondary">
                  {selectedGroups.size} valda
                </Badge>
              )}
            </div>

            {/* Groups Table */}
            <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Namn</TableHead>
                      <TableHead>Beskrivning</TableHead>
                      <TableHead>Medlemmar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedGroups.has(group.id)}
                            onCheckedChange={() => handleGroupToggle(group.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {group.description || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {groupMemberCounts[group.id] || 0}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Contact Search and Selection */}
          <div className="space-y-3 flex-1 min-h-0 flex flex-col">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Välj kontakter</Label>
              
              {/* Contact Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök kontakter (namn, e-post, telefon)..."
                  value={contactSearchTerm}
                  onChange={(e) => setContactSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Select All Contacts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all-contacts"
                    checked={filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length}
                    onCheckedChange={handleSelectAllContacts}
                  />
                  <Label htmlFor="select-all-contacts" className="text-sm cursor-pointer">
                    Välj alla ({filteredContacts.length} kontakter)
                  </Label>
                </div>
                {selectedContacts.size > 0 && (
                  <Badge variant="secondary">
                    {selectedContacts.size} valda
                  </Badge>
                )}
              </div>
            </div>

            {/* Contacts Table */}
            <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Namn</TableHead>
                      <TableHead>E-post</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Källa</TableHead>
                      <TableHead>Nuvarande grupper</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.has(contact.id)}
                            onCheckedChange={() => handleContactToggle(contact.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {contact.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {contact.phone}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {contact.source || 'Okänd'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {selectedGroups.size > 0 && Array.from(selectedGroups).map(groupId => {
                              const group = emailGroups.find(g => g.id === groupId);
                              const isMember = getContactMembershipStatus(contact.id, groupId);
                              return (
                                <Badge 
                                  key={groupId}
                                  variant={isMember ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {group?.name} {isMember ? '✓' : '+'}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Avbryt
          </Button>
          <Button 
            onClick={handleAddToGroups}
            disabled={isAdding || selectedContacts.size === 0 || selectedGroups.size === 0}
          >
            <Users className="w-4 h-4 mr-2" />
            {isAdding ? 'Lägger till...' : `Lägg till i grupper`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
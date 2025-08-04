import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit, Plus, Users, Eye, UserPlus, Search, Mail, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailGroup, GroupMember, EmailContact } from './types';

interface EmailGroupsManagerProps {
  emailGroups: EmailGroup[];
  groupsLoading: boolean;
  groupMemberCounts: {[key: string]: number};
  emailContacts: EmailContact[];
  onViewGroupMembers: (group: EmailGroup) => void;
  onAddContacts?: () => void;
  onCreateGroup?: () => void;
}

export function EmailGroupsManager({ 
  emailGroups, 
  groupsLoading, 
  groupMemberCounts,
  emailContacts,
  onViewGroupMembers,
  onAddContacts,
  onCreateGroup
}: EmailGroupsManagerProps) {
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EmailGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'course'>('manual');

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

  // Fetch course instances for import
  const { data: courseInstances = [] } = useQuery({
    queryKey: ['course-instances-for-import'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_instances')
        .select('id, course_title, table_name')
        .eq('is_active', true)
        .order('course_title');

      if (error) throw error;
      return data;
    },
    enabled: showCreateGroupDialog && activeTab === 'course'
  });

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      toast({
        title: "Namn krävs",
        description: "Du måste ange ett namn för gruppen.",
        variant: "destructive",
      });
      return;
    }

    try {
      let groupId: string;
      
      if (editingGroup) {
        const { error } = await supabase
          .from('email_groups')
          .update({
            name: groupForm.name.trim(),
            description: groupForm.description.trim() || null
          })
          .eq('id', editingGroup.id);

        if (error) throw error;
        groupId = editingGroup.id;

        // Clear existing members if editing
        await supabase
          .from('email_group_members')
          .delete()
          .eq('group_id', groupId);

        toast({
          title: "Grupp uppdaterad!",
          description: "Gruppen har uppdaterats.",
        });
      } else {
        const { data, error } = await supabase
          .from('email_groups')
          .insert({
            name: groupForm.name.trim(),
            description: groupForm.description.trim() || null
          })
          .select()
          .single();

        if (error) throw error;
        groupId = data.id;

        toast({
          title: "Grupp skapad!",
          description: "Den nya gruppen har skapats.",
        });
      }

      // Add selected contacts to the group
      if (selectedContacts.size > 0) {
        const members = Array.from(selectedContacts).map(contactId => ({
          group_id: groupId,
          contact_id: contactId
        }));

        const { error: membersError } = await supabase
          .from('email_group_members')
          .insert(members);

        if (membersError) throw membersError;
      }
      
      setShowCreateGroupDialog(false);
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
      setSelectedContacts(new Set());
      setContactSearchTerm('');
      setActiveTab('manual');
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
      queryClient.invalidateQueries({ queryKey: ['email-group-members'] });
    } catch (error: any) {
      console.error('Group save error:', error);
      toast({
        title: "Fel vid sparning",
        description: error.message || "Det gick inte att spara gruppen.",
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = async (group?: EmailGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        description: group.description || ''
      });
      
      // Load existing group members
      try {
        const { data: members, error } = await supabase
          .from('email_group_members')
          .select('contact_id')
          .eq('group_id', group.id);
        
        if (error) throw error;
        
        setSelectedContacts(new Set(members.map(m => m.contact_id)));
      } catch (error) {
        console.error('Error loading group members:', error);
      }
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
      setSelectedContacts(new Set());
    }
    setContactSearchTerm('');
    setActiveTab('manual');
    setShowCreateGroupDialog(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna grupp? Alla medlemmar kommer att tas bort från gruppen.')) return;

    try {
      const { error } = await supabase
        .from('email_groups')
        .update({ is_active: false })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Grupp borttagen",
        description: "Gruppen har tagits bort.",
      });

      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
    } catch (error: any) {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Det gick inte att ta bort gruppen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email-grupper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action buttons on separate row, left-aligned */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => handleEditGroup()}
              className="w-fit"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ny grupp
            </Button>
          </div>
          {groupsLoading ? (
            <div className="text-center py-4">Laddar grupper...</div>
          ) : emailGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Inga grupper hittades. Skapa din första grupp!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Beskrivning</TableHead>
                  <TableHead>Medlemmar</TableHead>
                  <TableHead>Skapad</TableHead>
                  <TableHead className="w-[150px]">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {groupMemberCounts[group.id] || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(group.created_at).toLocaleDateString('sv-SE')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewGroupMembers(group)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Redigera grupp' : 'Skapa ny grupp'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Group basic info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Gruppnamn</Label>
                <Input
                  id="group-name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  placeholder="Gruppens namn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="group-description">Beskrivning (valfritt)</Label>
                <Textarea
                  id="group-description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  placeholder="Kort beskrivning av gruppen"
                  rows={3}
                />
              </div>
            </div>

            {/* Contact selection */}
            <div className="space-y-4">
              <Label>Välj kontakter för gruppen</Label>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'manual' | 'course')}>
                <TabsList>
                  <TabsTrigger value="manual">Välj manuellt</TabsTrigger>
                  <TabsTrigger value="course">Importera från kurs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Sök kontakter..."
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
                                } else {
                                  setSelectedContacts(new Set());
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Namn</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefon</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContacts.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedContacts.has(contact.id)}
                                onCheckedChange={(checked) => {
                                  const newSelection = new Set(selectedContacts);
                                  if (checked) {
                                    newSelection.add(contact.id);
                                  } else {
                                    newSelection.delete(contact.id);
                                  }
                                  setSelectedContacts(newSelection);
                                }}
                              />
                            </TableCell>
                            <TableCell>{contact.name || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {contact.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              {contact.phone ? (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {contact.phone}
                                </div>
                              ) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {filteredContacts.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        {contactSearchTerm ? 'Inga kontakter matchar din sökning' : 'Inga kontakter hittades'}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {selectedContacts.size} av {filteredContacts.length} kontakter valda
                  </div>
                </TabsContent>
                
                <TabsContent value="course" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Välj en kurs för att importera alla dess deltagare till gruppen
                  </div>
                  
                  <div className="space-y-2">
                    {courseInstances.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{course.course_title}</div>
                          <div className="text-sm text-muted-foreground">Tabell: {course.table_name}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Get course participants
                              const { data: participants, error } = await supabase
                                .rpc('get_course_participants', { table_name: course.table_name });
                              
                              if (error) throw error;
                              
                              // Find matching contacts by email
                              const matchingContacts = emailContacts.filter(contact =>
                                participants.some((p: any) => p.email.toLowerCase() === contact.email.toLowerCase())
                              );
                              
                              setSelectedContacts(new Set(matchingContacts.map(c => c.id)));
                              setActiveTab('manual'); // Switch to manual tab to show selection
                              
                              toast({
                                title: "Kontakter importerade",
                                description: `${matchingContacts.length} kontakter från kursen har valts.`,
                              });
                            } catch (error: any) {
                              toast({
                                title: "Fel vid import",
                                description: error.message || "Kunde inte importera kontakter från kursen.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Importera deltagare
                        </Button>
                      </div>
                    ))}
                    
                    {courseInstances.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        Inga aktiva kurser hittades
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateGroupDialog(false);
              setSelectedContacts(new Set());
              setContactSearchTerm('');
              setActiveTab('manual');
            }}>
              Avbryt
            </Button>
            <Button onClick={handleSaveGroup}>
              {editingGroup ? 'Uppdatera' : 'Skapa'} grupp
              {selectedContacts.size > 0 && ` (${selectedContacts.size} kontakter)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
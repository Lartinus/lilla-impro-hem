import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Users, Eye, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailGroup, GroupMember, EmailContact } from './types';
import { AddContactsToGroupsDialog } from './AddContactsToGroupsDialog';

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
  const [showAddContactsDialog, setShowAddContactsDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<EmailGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: ''
  });

  const queryClient = useQueryClient();

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
      if (editingGroup) {
        const { error } = await supabase
          .from('email_groups')
          .update({
            name: groupForm.name.trim(),
            description: groupForm.description.trim() || null
          })
          .eq('id', editingGroup.id);

        if (error) throw error;

        toast({
          title: "Grupp uppdaterad!",
          description: "Gruppen har uppdaterats.",
        });
      } else {
        const { error } = await supabase
          .from('email_groups')
          .insert({
            name: groupForm.name.trim(),
            description: groupForm.description.trim() || null
          });

        if (error) throw error;

        toast({
          title: "Grupp skapad!",
          description: "Den nya gruppen har skapats.",
        });
      }
      
      setShowCreateGroupDialog(false);
      setEditingGroup(null);
      setGroupForm({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
    } catch (error: any) {
      console.error('Group save error:', error);
      toast({
        title: "Fel vid sparning",
        description: error.message || "Det gick inte att spara gruppen.",
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = (group?: EmailGroup) => {
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
          <CardTitle className="text-lg">Tillgängliga grupper</CardTitle>
        </CardHeader>
        <CardContent>
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
                {emailGroups.map((group, index) => (
                  <TableRow key={group.id} className={index > 0 ? "border-t" : ""}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Redigera grupp' : 'Skapa ny grupp'}
            </DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGroupDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSaveGroup}>
              {editingGroup ? 'Uppdatera' : 'Skapa'} grupp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddContactsToGroupsDialog
        open={showAddContactsDialog}
        onOpenChange={setShowAddContactsDialog}
        emailGroups={emailGroups}
        emailContacts={emailContacts}
        groupMemberCounts={groupMemberCounts}
      />
    </div>
  );
}
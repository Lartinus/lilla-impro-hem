import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Mail, Phone, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailGroup, GroupMember } from './types';

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: EmailGroup | null;
  groupMembers: GroupMember[];
}

export function GroupMembersDialog({ 
  open, 
  onOpenChange, 
  group,
  groupMembers 
}: GroupMembersDialogProps) {
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleRemoveMember = async (memberId: string, contactEmail: string) => {
    if (!confirm(`Är du säker på att du vill ta bort ${contactEmail} från gruppen?`)) return;

    setRemovingMember(memberId);
    
    try {
      const { error } = await supabase
        .from('email_group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Medlem borttagen",
        description: `${contactEmail} har tagits bort från gruppen.`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
    } catch (error: any) {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Det gick inte att ta bort medlemmen.",
        variant: "destructive",
      });
    } finally {
      setRemovingMember(null);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Medlemmar i "{group.name}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
          
          <div className="text-sm text-muted-foreground">
            <strong>{groupMembers.length}</strong> medlemmar i gruppen
          </div>

          {groupMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Inga medlemmar i denna grupp än.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Källa</TableHead>
                    <TableHead>Tillagd</TableHead>
                    <TableHead className="w-[100px]">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.contact.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {member.contact.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.contact.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {member.contact.phone}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">
                          {member.contact.source || 'Okänd'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(member.contact.created_at).toLocaleDateString('sv-SE')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.contact.email)}
                          disabled={removingMember === member.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
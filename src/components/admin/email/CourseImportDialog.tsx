import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailGroup } from './types';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface CourseImportDialogProps {
  emailGroups: EmailGroup[];
  groupMemberCounts: {[key: string]: number};
}

export function CourseImportDialog({ emailGroups, groupMemberCounts }: CourseImportDialogProps) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [createNewGroup, setCreateNewGroup] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const queryClient = useQueryClient();

  const { data: courseInstances = [] } = useQuery({
    queryKey: ['course-instances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_instances')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .order('course_title', { ascending: true });

      if (error) throw error;

      // Include only courses that have an existing booking table
      const validated = await Promise.all(
        (data || []).map(async (course: any) => {
          if (!course?.table_name || !course.table_name.trim()) return null;
          try {
            const { data: exists } = await supabase.rpc('table_exists', { table_name: course.table_name });
            return exists ? course : null;
          } catch {
            return null;
          }
        })
      );

      return validated.filter(Boolean);
    }
  });

  const handleImportCourse = async () => {
    if (!selectedCourse) {
      toast({
        title: "Välj en kurs",
        description: "Du måste välja en kurs att importera från.",
        variant: "destructive",
      });
      return;
    }

    if (!createNewGroup && !selectedTargetGroup) {
      toast({
        title: "Välj målgrupp",
        description: "Du måste välja en målgrupp att importera till.",
        variant: "destructive",
      });
      return;
    }

    if (createNewGroup && !newGroupName.trim()) {
      toast({
        title: "Ange gruppnamn",
        description: "Du måste ange ett namn för den nya gruppen.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      let targetGroupId = selectedTargetGroup;

      if (createNewGroup) {
        const { data: newGroup, error: groupError } = await supabase
          .from('email_groups')
          .insert({
            name: newGroupName.trim(),
            description: `Importerad från kursen: ${courseInstances.find(c => c.table_name === selectedCourse)?.course_title || selectedCourse}`
          })
          .select()
          .single();

        if (groupError) throw groupError;
        targetGroupId = newGroup.id;
      }

      const { data: importResult, error: importError } = await supabase
        .rpc('import_course_to_group', {
          course_table_name: selectedCourse,
          target_group_id: targetGroupId
        });

      if (importError) throw importError;

      toast({
        title: "Import slutförd!",
        description: `${importResult || 0} kontakter importerade till gruppen.`,
      });

      setSelectedCourse('');
      setSelectedTargetGroup('');
      setNewGroupName('');
      setCreateNewGroup(false);

      queryClient.invalidateQueries({ queryKey: ['email-groups'] });
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Importfel",
        description: error.message || "Det gick inte att importera kontakterna.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Importera kontakter från kurser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Importera deltagare från kurser direkt till dina mottagargrupper.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-select">Välj kurs</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Välj en kurs att importera från" />
              </SelectTrigger>
              <SelectContent>
                {courseInstances
                  .filter((course) => course.table_name && course.table_name.trim() !== '')
                  .map((course) => (
                    <SelectItem key={course.table_name} value={course.table_name}>
                      {`${course.course_title}${course.start_date ? ` — ${format(new Date(course.start_date), 'd MMM yyyy', { locale: sv })}${course.start_time ? ` kl. ${String(course.start_time).slice(0,5)}` : ''}` : ''}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="existing-group"
                name="group-type"
                checked={!createNewGroup}
                onChange={() => setCreateNewGroup(false)}
                className="w-4 h-4"
              />
              <Label htmlFor="existing-group">Importera till befintlig grupp</Label>
            </div>
            
            {!createNewGroup && (
              <div className="ml-6">
                <Select value={selectedTargetGroup} onValueChange={setSelectedTargetGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj målgrupp" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({groupMemberCounts[group.id] || 0} medlemmar)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="new-group"
                name="group-type"
                checked={createNewGroup}
                onChange={() => setCreateNewGroup(true)}
                className="w-4 h-4"
              />
              <Label htmlFor="new-group">Skapa ny grupp</Label>
            </div>
            
            {createNewGroup && (
              <div className="ml-6">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Namn på den nya gruppen"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleImportCourse}
            disabled={isImporting || !selectedCourse || (!createNewGroup && !selectedTargetGroup) || (createNewGroup && !newGroupName.trim())}
          >
            {isImporting ? 'Importerar...' : 'Importera kontakter'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Plus, Edit, Trash2, Users, UserX, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface InterestSignup {
  id: string;
  title: string;
  subtitle?: string | null;
  information?: string | null;
  is_visible: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

interface InterestSignupWithSubmissions extends InterestSignup {
  submissionCount: number;
}

interface InterestSubmission {
  id: string;
  interest_signup_id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  created_at: string;
}

interface NewInterestSignupForm {
  title: string;
  subtitle: string;
  information: string;
  is_visible: boolean;
}

// Row Component
function InterestRow({ item, onEdit, onToggleVisibility, onDelete, onViewSubmissions, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: {
  item: InterestSignupWithSubmissions;
  onEdit: (item: InterestSignupWithSubmissions) => void;
  onToggleVisibility: (item: InterestSignupWithSubmissions) => void;
  onDelete: (item: InterestSignupWithSubmissions) => void;
  onViewSubmissions: (item: InterestSignupWithSubmissions) => void;
  onMoveUp: (item: InterestSignupWithSubmissions) => void;
  onMoveDown: (item: InterestSignupWithSubmissions) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(item)}
              disabled={!canMoveUp}
              className="w-6 h-6 p-0"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(item)}
              disabled={!canMoveDown}
              className="w-6 h-6 p-0"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">#{item.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{item.title}</TableCell>
      <TableCell className="max-w-xs truncate">{item.subtitle || '-'}</TableCell>
      <TableCell>
        <span className="font-semibold">{item.submissionCount}</span>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_visible ? "default" : "secondary"}>
          {item.is_visible ? 'Synlig' : 'Dold'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewSubmissions(item)}
            disabled={item.submissionCount === 0}
          >
            <Users className="w-4 h-4 mr-1" />
            Visa anmälningar ({item.submissionCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleVisibility(item)}
          >
            {item.is_visible ? (
              <EyeOff className="w-4 h-4 mr-1" />
            ) : (
              <Eye className="w-4 h-4 mr-1" />
            )}
            {item.is_visible ? 'Dölj' : 'Visa'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm(`Är du säker på att du vill radera "${item.title}"? Detta kan inte ångras.`)) {
                onDelete(item);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Radera
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export const InterestSignupManagement = () => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<InterestSignupWithSubmissions | null>(null);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<InterestSubmission[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<InterestSignupWithSubmissions | null>(null);
  const [newItem, setNewItem] = useState<NewInterestSignupForm>({
    title: '',
    subtitle: '',
    information: '',
    is_visible: true
  });

  const queryClient = useQueryClient();

  // Fetch interest signups
  const { data: interestSignups, isLoading } = useQuery({
    queryKey: ['interest-signups'],
    queryFn: async (): Promise<InterestSignupWithSubmissions[]> => {
      const { data: signups, error } = await supabase
        .from('interest_signups')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get submission counts for each signup
      const signupsWithCounts = await Promise.all(
        (signups || []).map(async (signup) => {
          const { data: submissions, error: submissionsError } = await supabase
            .from('interest_signup_submissions')
            .select('id')
            .eq('interest_signup_id', signup.id);

          if (submissionsError) {
            console.warn(`Failed to get submission count for ${signup.title}:`, submissionsError);
          }

          return {
            ...signup,
            submissionCount: submissions?.length || 0
          };
        })
      );

      return signupsWithCounts;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Move interest up/down mutations
  const moveInterestUpMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const currentIndex = interestSignups!.findIndex(i => i.id === item.id);
      if (currentIndex > 0) {
        const prevItem = interestSignups![currentIndex - 1];
        const currentSortOrder = item.sort_order || 0;
        const prevSortOrder = prevItem.sort_order || 0;
        
        await Promise.all([
          supabase.from('interest_signups').update({ sort_order: prevSortOrder }).eq('id', item.id),
          supabase.from('interest_signups').update({ sort_order: currentSortOrder }).eq('id', prevItem.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const moveInterestDownMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const currentIndex = interestSignups!.findIndex(i => i.id === item.id);
      if (currentIndex < interestSignups!.length - 1) {
        const nextItem = interestSignups![currentIndex + 1];
        const currentSortOrder = item.sort_order || 0;
        const nextSortOrder = nextItem.sort_order || 0;
        
        await Promise.all([
          supabase.from('interest_signups').update({ sort_order: nextSortOrder }).eq('id', item.id),
          supabase.from('interest_signups').update({ sort_order: currentSortOrder }).eq('id', nextItem.id)
        ]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte flytta intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Create interest signup mutation
  const createMutation = useMutation({
    mutationFn: async (formData: NewInterestSignupForm) => {
      // Get the highest sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('interest_signups')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;

      const { error } = await supabase
        .from('interest_signups')
        .insert({
          title: formData.title,
          subtitle: formData.subtitle || null,
          information: formData.information || null,
          is_visible: formData.is_visible,
          sort_order: nextSortOrder
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Intresseanmälan skapad",
        description: "Intresseanmälan har skapats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skapa intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update interest signup mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { item: InterestSignupWithSubmissions; formData: NewInterestSignupForm }) => {
      const { item, formData } = data;
      
      const { error } = await supabase
        .from('interest_signups')
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          information: formData.information || null,
          is_visible: formData.is_visible
        })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
      resetForm();
      toast({
        title: "Intresseanmälan uppdaterad",
        description: "Intresseanmälan har uppdaterats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const { error } = await supabase
        .from('interest_signups')
        .update({ is_visible: !item.is_visible })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Synlighet uppdaterad",
        description: "Synlighet har ändrats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte ändra synlighet: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete interest signup mutation
  const deleteMutation = useMutation({
    mutationFn: async (item: InterestSignupWithSubmissions) => {
      const { error } = await supabase
        .from('interest_signups')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      toast({
        title: "Intresseanmälan raderad",
        description: "Intresseanmälan har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera intresseanmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete submission mutation
  const deleteSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('interest_signup_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;
      return submissionId; // Return the ID for use in onSuccess
    },
    onSuccess: (deletedSubmissionId) => {
      queryClient.invalidateQueries({ queryKey: ['interest-signups'] });
      
      // Remove the deleted submission from the current list
      setSelectedSubmissions(prev => 
        prev.filter(submission => submission.id !== deletedSubmissionId)
      );
      
      // Also update the selected interest count
      if (selectedInterest) {
        setSelectedInterest(prev => prev ? {
          ...prev,
          submissionCount: Math.max(0, prev.submissionCount - 1)
        } : null);
      }
      
      toast({
        title: "Anmälan raderad",
        description: "Personens anmälan har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera anmälan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setNewItem({
      title: '',
      subtitle: '',
      information: '',
      is_visible: true
    });
  };

  const handleEdit = (item: InterestSignupWithSubmissions) => {
    setEditingItem(item);
    setIsEditMode(true);
    setNewItem({
      title: item.title,
      subtitle: item.subtitle || '',
      information: item.information || '',
      is_visible: item.is_visible
    });
    setIsDialogOpen(true);
  };

  const handleViewSubmissions = async (item: InterestSignupWithSubmissions) => {
    try {
      const { data: submissions, error } = await supabase
        .from('interest_signup_submissions')
        .select('*')
        .eq('interest_signup_id', item.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSelectedSubmissions(submissions || []);
      setSelectedInterest(item);
      setIsSubmissionsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: `Kunde inte hämta anmälningar: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = () => {
    if (isEditMode && editingItem) {
      updateMutation.mutate({ item: editingItem, formData: newItem });
    } else {
      createMutation.mutate(newItem);
    }
  };

  const handleMoveUp = (item: InterestSignupWithSubmissions) => {
    moveInterestUpMutation.mutate(item);
  };

  const handleMoveDown = (item: InterestSignupWithSubmissions) => {
    moveInterestDownMutation.mutate(item);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intresseanmälningar</CardTitle>
          <CardDescription>Läser in intresseanmälningar...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle>Intresseanmälningar</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Lägg till intresseanmälan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Redigera intresseanmälan' : 'Skapa ny intresseanmälan'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="T.ex. House Teams & fortsättning"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Undertitel</Label>
                  <Input
                    id="subtitle"
                    value={newItem.subtitle}
                    onChange={(e) => setNewItem({...newItem, subtitle: e.target.value})}
                    placeholder="T.ex. Auditions hålls regelbundet"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="information">Information</Label>
                  <Textarea
                    id="information"
                    value={newItem.information}
                    onChange={(e) => setNewItem({...newItem, information: e.target.value})}
                    placeholder="Beskrivning av vad detta är för typ av kurs/aktivitet"
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={newItem.is_visible}
                    onCheckedChange={(checked) => setNewItem({...newItem, is_visible: checked})}
                  />
                  <Label htmlFor="is_visible">Visa på hemsidan</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setEditingItem(null);
                    resetForm();
                  }}>
                    Avbryt
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={(createMutation.isPending || updateMutation.isPending) || !newItem.title.trim()}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? 
                      (isEditMode ? 'Uppdaterar...' : 'Skapar...') : 
                      (isEditMode ? 'Uppdatera' : 'Skapa intresseanmälan')
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <p className="text-sm text-muted-foreground">
            Hantera intresseanmälningar för kommande kurser. Använd upp/ner-pilarna för att ändra ordning.
          </p>
        </div>
        
        {!interestSignups || interestSignups.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga intresseanmälningar</h3>
            <p className="text-muted-foreground">
              Det finns för närvarande inga intresseanmälningar i systemet.
            </p>
          </div>
        ) : isMobile ? (
          <div className="space-y-4">
            {interestSignups.map((item, index) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(item)}
                        disabled={index === 0}
                        className="w-6 h-6 p-0"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(item)}
                        disabled={index === interestSignups.length - 1}
                        className="w-6 h-6 p-0"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">#{item.sort_order || 0}</span>
                        <Badge variant={item.is_visible ? "default" : "secondary"}>
                          {item.is_visible ? 'Synlig' : 'Dold'}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{item.submissionCount}</div>
                    <div className="text-xs text-muted-foreground">anmälda</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewSubmissions(item)}
                    disabled={item.submissionCount === 0}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Visa anmälningar ({item.submissionCount})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Redigera
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleVisibilityMutation.mutate(item)}
                  >
                    {item.is_visible ? (
                      <EyeOff className="w-4 h-4 mr-1" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    {item.is_visible ? 'Dölj' : 'Visa'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (confirm(`Är du säker på att du vill radera "${item.title}"? Detta kan inte ångras.`)) {
                        deleteMutation.mutate(item);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Radera
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordning</TableHead>
                <TableHead>Titel</TableHead>
                <TableHead>Undertitel</TableHead>
                <TableHead>Anmälda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[400px]">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interestSignups.map((item, index) => (
                <InterestRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onToggleVisibility={item => toggleVisibilityMutation.mutate(item)}
                  onDelete={item => deleteMutation.mutate(item)}
                  onViewSubmissions={handleViewSubmissions}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  canMoveUp={index > 0}
                  canMoveDown={index < interestSignups.length - 1}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Submissions Dialog */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Anmälningar för: {selectedInterest?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inga anmälningar</h3>
                <p className="text-muted-foreground">
                  Det finns inga anmälningar för denna intresseanmälan ännu.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Meddelande</TableHead>
                    <TableHead>Anmäld</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.phone || '-'}</TableCell>
                      <TableCell className="max-w-xs">
                        {submission.message ? (
                          <div className="truncate" title={submission.message}>
                            {submission.message}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString('sv-SE')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Är du säker på att du vill ta bort ${submission.name}s anmälan? Detta kan inte ångras.`)) {
                              deleteSubmissionMutation.mutate(submission.id);
                            }
                          }}
                          disabled={deleteSubmissionMutation.isPending}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Ta bort
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
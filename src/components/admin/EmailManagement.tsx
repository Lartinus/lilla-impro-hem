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
import { Mail, Send, Users, Ticket, FileText, Plus, Edit, Trash2, Eye, Heart } from 'lucide-react';
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

interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  type: 'course' | 'tickets' | 'interest' | 'all';
  description?: string;
}

export const EmailManagement = () => {
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
      // TODO: Implement actual email sending through edge function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email skickat!",
        description: `Mejlet har skickats till den valda mottagargruppen.`,
      });
      
      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedRecipients('');
      setSelectedTemplate('');
    } catch (error) {
      toast({
        title: "Fel vid skickning",
        description: "Det gick inte att skicka mejlet. Försök igen.",
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Skicka meddelande</TabsTrigger>
          <TabsTrigger value="groups">Mottagargrupper</TabsTrigger>
          <TabsTrigger value="templates">Email-mallar</TabsTrigger>
        </TabsList>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mottagargrupper
              </CardTitle>
              <CardDescription>
                Översikt över alla tillgängliga mottagargrupper
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
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
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {group.count} personer
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
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
    </div>
  );
};
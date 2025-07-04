import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Users, Ticket, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  type: 'course' | 'tickets' | 'all';
}

export const EmailManagement = () => {
  const [selectedRecipients, setSelectedRecipients] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch recipient groups (courses and ticket purchases)
  const { data: recipientGroups } = useQuery({
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
                type: 'course'
              });
            }
          } catch (error) {
            console.warn(`Failed to get booking count for ${course.table_name}`);
          }
        }
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
          type: 'tickets'
        });
      }

      return groups;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Email skickat!",
        description: `Mejlet har skickats till den valda mottagargruppen.`,
      });
      
      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setSelectedRecipients('');
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

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Välkomstmejl',
      subject: 'Välkommen till [KURSNAMN]!',
      content: 'Hej [NAMN]!\n\nVälkommen till kursen [KURSNAMN]. Vi ser fram emot att träffa dig!\n\nMed vänliga hälsningar,\nLIT-teamet'
    },
    {
      id: 'practical_info',
      name: 'Praktisk information',
      subject: 'Praktisk information inför [KURSNAMN]',
      content: 'Hej [NAMN]!\n\nHär kommer praktisk information inför kursstarten:\n\n- Plats: [PLATS]\n- Tid: [TID]\n- Ta med: [UTRUSTNING]\n\nVi ses snart!\n\nLIT-teamet'
    },
    {
      id: 'reminder',
      name: 'Påminnelse',
      subject: 'Påminnelse: [KURSNAMN] startar snart!',
      content: 'Hej [NAMN]!\n\nEn påminnelse om att [KURSNAMN] startar [DATUM].\n\nVi ser fram emot att träffa dig!\n\nLIT-teamet'
    }
  ];

  const insertTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailContent(template.content);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Skriv meddelande</TabsTrigger>
          <TabsTrigger value="templates">Mallar</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Nytt meddelande
              </CardTitle>
              <CardDescription>
                Skicka meddelanden till kursdeltagare eller biljettköpare
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
                    {recipientGroups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-2">
                            {group.type === 'course' ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              <Ticket className="w-4 h-4" />
                            )}
                            {group.name}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {group.count}
                          </Badge>
                        </div>
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
                  rows={10}
                />
                <p className="text-sm text-muted-foreground">
                  Du kan använda följande variabler: [NAMN], [KURSNAMN], [DATUM], [PLATS], [TID]
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

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Email-mallar
              </CardTitle>
              <CardDescription>
                Fördefinierade mallar för vanliga meddelanden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertTemplate(template)}
                      >
                        Använd mall
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Ämne:</strong> {template.subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {template.content.substring(0, 100)}...
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
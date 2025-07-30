import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, RefreshCw, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailContact } from './types';

interface EmailContactsManagerProps {
  emailContacts: EmailContact[];
  contactsLoading: boolean;
  onViewActivities: (email: string) => void;
}

export function EmailContactsManager({ 
  emailContacts, 
  contactsLoading,
  onViewActivities 
}: EmailContactsManagerProps) {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<EmailContact | null>(null);
  const [contactForm, setContactForm] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 20;

  const queryClient = useQueryClient();

  useEffect(() => {
    const filteredContacts = emailContacts
      .filter(contact => 
        !searchTerm || 
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm)
      );
    
    const totalContacts = filteredContacts.length;
    const totalPages = Math.ceil(totalContacts / contactsPerPage);
    
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [emailContacts, searchTerm, currentPage, contactsPerPage]);

  const handleSaveContact = async () => {
    if (!contactForm.email.trim()) {
      toast({
        title: "Email krävs",
        description: "Du måste ange en email-adress.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingContact) {
        const { error } = await supabase
          .from('email_contacts')
          .update({
            email: contactForm.email.trim(),
            name: contactForm.name.trim() || null,
            phone: contactForm.phone.trim() || null
          })
          .eq('id', editingContact.id);

        if (error) throw error;

        toast({
          title: "Kontakt uppdaterad!",
          description: "Kontakten har uppdaterats.",
        });
      } else {
        const { error } = await supabase
          .from('email_contacts')
          .insert({
            email: contactForm.email.trim(),
            name: contactForm.name.trim() || null,
            phone: contactForm.phone.trim() || null,
            source: 'manual'
          });

        if (error) throw error;

        toast({
          title: "Kontakt skapad!",
          description: "Den nya kontakten har skapats.",
        });
      }
      
      setShowContactDialog(false);
      setEditingContact(null);
      setContactForm({ email: '', name: '', phone: '' });
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
    } catch (error: any) {
      console.error('Contact save error:', error);
      toast({
        title: "Fel vid sparning",
        description: error.message || "Det gick inte att spara kontakten.",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = (contact?: EmailContact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        email: contact.email,
        name: contact.name || '',
        phone: contact.phone || ''
      });
    } else {
      setEditingContact(null);
      setContactForm({ email: '', name: '', phone: '' });
    }
    setShowContactDialog(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna kontakt?')) return;

    try {
      const { error } = await supabase
        .from('email_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Kontakt borttagen",
        description: "Kontakten har tagits bort.",
      });

      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
    } catch (error: any) {
      toast({
        title: "Fel vid borttagning",
        description: error.message || "Det gick inte att ta bort kontakten.",
        variant: "destructive",
      });
    }
  };

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase
        .rpc('sync_email_contacts');
      
      if (error) throw error;
      
      toast({
        title: "Synkronisering slutförd",
        description: `${data || 0} kontakter synkroniserade.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['email-contacts'] });
    } catch (error: any) {
      toast({
        title: "Synkroniseringsfel",
        description: error.message || "Det gick inte att synkronisera kontakterna.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredContacts = emailContacts
    .filter(contact => 
      !searchTerm || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm)
    );

  const totalContacts = filteredContacts.length;
  const totalPages = Math.ceil(totalContacts / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, endIndex);

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'course':
        return <Badge variant="default">Kurs</Badge>;
      case 'ticket':
        return <Badge variant="secondary">Biljett</Badge>;
      case 'interest':
        return <Badge variant="outline">Intresse</Badge>;
      case 'manual':
        return <Badge variant="outline">Manuell</Badge>;
      default:
        return <Badge variant="outline">Okänd</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-medium">Alla kontakter ({totalContacts} st)</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncContacts} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Synkronisera
          </Button>
          <Button onClick={() => handleEditContact()} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till kontakt
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Sök efter email, namn eller telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {contactsLoading ? (
              <div className="text-center py-4">Laddar kontakter...</div>
            ) : currentContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Inga kontakter matchade sökningen.' : 'Inga kontakter hittades.'}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Namn</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Källa</TableHead>
                      <TableHead>Skapad</TableHead>
                      <TableHead className="w-[150px]">Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.email}</TableCell>
                        <TableCell>{contact.name || '-'}</TableCell>
                        <TableCell>{contact.phone || '-'}</TableCell>
                        <TableCell>{getSourceBadge(contact.source)}</TableCell>
                        <TableCell>
                          {new Date(contact.created_at).toLocaleDateString('sv-SE')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onViewActivities(contact.email)}
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Föregående
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      Sida {currentPage} av {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Nästa
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Redigera kontakt' : 'Lägg till kontakt'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                placeholder="kontakt@exempel.se"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-name">Namn (valfritt)</Label>
              <Input
                id="contact-name"
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                placeholder="För- och efternamn"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Telefon (valfritt)</Label>
              <Input
                id="contact-phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                placeholder="070-123 45 67"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSaveContact}>
              {editingContact ? 'Uppdatera' : 'Lägg till'} kontakt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
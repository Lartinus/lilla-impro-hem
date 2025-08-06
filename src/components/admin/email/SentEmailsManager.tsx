import { useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Mail, Trash2, Search, Filter, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSentEmails, useDeleteSentEmail, useDeleteMultipleSentEmails, type SentEmail } from '@/hooks/useSentEmails';

const emailTypeLabels: Record<string, string> = {
  'bulk': 'Masskicks',
  'course_confirmation': 'Kursbekräftelse',
  'ticket_confirmation': 'Biljettbekräftelse',
  'course_offer': 'Kurserbjudande',
  'inquiry': 'Förfrågan',
  'interest_confirmation': 'Intressebekräftelse',
  'newsletter': 'Nyhetsbrev',
};

const statusLabels: Record<string, string> = {
  'sent': 'Skickat',
  'failed': 'Misslyckades',
};

export const SentEmailsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const { data: sentEmails = [], isLoading } = useSentEmails();
  const deleteEmail = useDeleteSentEmail();
  const deleteMultipleEmails = useDeleteMultipleSentEmails();

  // Filter emails based on search and filters
  const filteredEmails = sentEmails.filter((email) => {
    const matchesSearch = 
      email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (email.recipient_name && email.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || email.email_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map(email => email.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectEmail = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
    setSelectAll(newSelected.size === filteredEmails.length);
  };

  const handleDeleteSelected = async () => {
    if (selectedEmails.size === 0) return;
    
    await deleteMultipleEmails.mutateAsync(Array.from(selectedEmails));
    setSelectedEmails(new Set());
    setSelectAll(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'bulk': return 'default';
      case 'course_confirmation': return 'secondary';
      case 'ticket_confirmation': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="p-4">Laddar skickade email...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {selectedEmails.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Radera markerade ({selectedEmails.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bekräfta radering</AlertDialogTitle>
                <AlertDialogDescription>
                  Är du säker på att du vill radera {selectedEmails.size} email? Denna åtgärd kan inte ångras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected}>
                  Radera
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök efter email, namn eller ämne..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Typ av email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  {Object.entries(emailTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla status</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {filteredEmails.length} email
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectAll ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              Markera alla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <button
                  onClick={() => handleSelectEmail(email.id)}
                  className="flex-shrink-0"
                >
                  {selectedEmails.has(email.id) ? 
                    <CheckSquare className="h-4 w-4 text-primary" /> : 
                    <Square className="h-4 w-4" />
                  }
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {email.recipient_name || email.recipient_email}
                    </p>
                    <Badge variant={getTypeBadgeVariant(email.email_type)} className="text-xs">
                      {emailTypeLabels[email.email_type] || email.email_type}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(email.status)} className="text-xs">
                      {statusLabels[email.status] || email.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(email.sent_at), 'dd MMM yyyy HH:mm', { locale: sv })}
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bekräfta radering</AlertDialogTitle>
                      <AlertDialogDescription>
                        Är du säker på att du vill radera detta email? Denna åtgärd kan inte ångras.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteEmail.mutate(email.id)}
                      >
                        Radera
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
            
            {filteredEmails.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Inga email matchar dina filter'
                  : 'Inga skickade email ännu'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
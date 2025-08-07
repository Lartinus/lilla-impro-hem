import { useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Mail, Trash2, Search, Filter, CheckSquare, Square, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSentEmails, useDeleteSentEmail, useDeleteMultipleSentEmails, type SentEmail } from '@/hooks/useSentEmails';
import { SentEmailPreviewDialog } from './SentEmailPreviewDialog';

const emailTypeLabels: Record<string, string> = {
  bulk: 'Massutskick',
  manual: 'Manuellt mejl',
  newsletter: 'Nyhetsbrev',
  newsletter_confirmation: 'Nyhetsbrevsbekräftelse',
  email_confirmation: 'E-postbekräftelse',
  interest_confirmation: 'Bekräftelse intresseanmälan',
  inquiry_notification: 'Ny förfrågan',
  inquiry: 'Förfrågan',
  course_confirmation: 'Kursbekräftelse',
  course_confirmation_resend: 'Kursbekräftelse (omskick)',
  course_offer: 'Kurserbjudande',
  course_offer_reminder: 'Påminnelse – kurserbjudande',
  waitlist_offer: 'Erbjudande från väntelista',
  waitlist_confirmation: 'Bekräftelse väntelista',
  ticket_confirmation: 'Biljettbekräftelse',
  ticket_confirmation_resend: 'Biljettbekräftelse (omskick)',
  payment_receipt: 'Kvitto på betalning',
  refund_receipt: 'Kvitto på återbetalning',
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
  const [previewEmail, setPreviewEmail] = useState<SentEmail | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleViewEmail = (email: SentEmail) => {
    setPreviewEmail(email);
    setIsPreviewOpen(true);
  };

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'sent': return 'default';
    case 'failed': return 'destructive';
    default: return 'secondary';
  }
};

const getEmailCategory = (type: string): 'course' | 'email' | 'show' => {
  const t = type.toLowerCase();
  if (t.includes('course') || t.includes('waitlist')) return 'course';
  if (t.includes('ticket') || t.includes('show')) return 'show';
  return 'email';
};

const getTypeBadgeClasses = (type: string) => {
  switch (getEmailCategory(type)) {
    case 'course':
      return 'bg-[rgb(var(--course-tag-gray))] text-white-override';
    case 'show':
      return 'bg-[rgb(var(--action-blue-hover))] text-white-override';
    default:
      return 'bg-[rgb(var(--guest-blue-gray))] text-white-override';
  }
};

const getEmailTypeLabel = (type: string) => {
  return emailTypeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center"
                    >
                      {selectAll ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    </button>
                  </TableHead>
                  <TableHead>Mottagare</TableHead>
                  <TableHead className="hidden md:table-cell">Typ</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead>Ämne</TableHead>
                  <TableHead className="hidden lg:table-cell">Datum</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow key={email.id} className="hover:bg-muted/30">
                    <TableCell>
                      <button
                        onClick={() => handleSelectEmail(email.id)}
                        className="flex items-center justify-center"
                      >
                        {selectedEmails.has(email.id) ? 
                          <CheckSquare className="h-4 w-4 text-primary" /> : 
                          <Square className="h-4 w-4" />
                        }
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px]">
                        <div className="truncate text-sm">
                          {email.recipient_name || email.recipient_email}
                        </div>
                        {email.recipient_name && (
                          <div className="truncate text-xs text-muted-foreground">
                            {email.recipient_email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
<Badge className={`text-xs px-2 py-1 border-transparent ${getTypeBadgeClasses(email.email_type)}`}>
  {getEmailTypeLabel(email.email_type)}
</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getStatusBadgeVariant(email.status)} className="text-xs px-2 py-1">
                        {statusLabels[email.status] || email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="truncate text-sm">{email.subject}</div>
                        <div className="sm:hidden flex gap-1 mt-1">
<Badge className={`text-xs px-1 py-0 border-transparent ${getTypeBadgeClasses(email.email_type)}`}>
  {getEmailTypeLabel(email.email_type)}
</Badge>
                          <Badge variant={getStatusBadgeVariant(email.status)} className="text-xs px-1 py-0">
                            {statusLabels[email.status] || email.status}
                          </Badge>
                        </div>
                        <div className="lg:hidden text-xs text-muted-foreground mt-1">
                          {format(new Date(email.sent_at), 'dd MMM yyyy HH:mm', { locale: sv })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {format(new Date(email.sent_at), 'dd MMM yyyy HH:mm', { locale: sv })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
<Button 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 p-0 justify-center"
  onClick={() => handleViewEmail(email)}
  title="Visa email"
>
  <Eye className="h-4 w-4" />
</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
<Button variant="ghost" size="icon" className="h-8 w-8 p-0 justify-center" title="Radera email">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
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

      <SentEmailPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        email={previewEmail}
      />
    </div>
  );
};
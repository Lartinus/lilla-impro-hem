import { useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Mail, Trash2, Search, Filter, CheckSquare, Square, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-600" />;
      default: return <Clock className="h-3 w-3 text-yellow-600" />;
    }
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

      {/* Email Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4" />
              {filteredEmails.length} email
            </CardTitle>
            <Checkbox
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              className="h-4 w-4"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'Inga email matchar dina filter'
                : 'Inga skickade email ännu'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="min-w-[200px]">Mottagare</TableHead>
                    <TableHead className="min-w-[120px]">Typ</TableHead>
                    <TableHead className="min-w-[300px]">Ämne</TableHead>
                    <TableHead className="min-w-[120px]">Datum</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email.id} className="hover:bg-muted/30">
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedEmails.has(email.id)}
                          onCheckedChange={() => handleSelectEmail(email.id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusIcon(email.status)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {email.recipient_name || email.recipient_email}
                          </div>
                          {email.recipient_name && (
                            <div className="text-xs text-muted-foreground truncate">
                              {email.recipient_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge 
                          variant={getTypeBadgeVariant(email.email_type)} 
                          className="text-xs px-2 py-0.5"
                        >
                          {emailTypeLabels[email.email_type] || email.email_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-sm truncate max-w-[300px]" title={email.subject}>
                          {email.subject}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(email.sent_at), 'dd MMM yyyy', { locale: sv })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(email.sent_at), 'HH:mm', { locale: sv })}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-3 w-3" />
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
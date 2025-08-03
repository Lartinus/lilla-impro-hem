import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, UserPlus, UserX, Clock } from 'lucide-react';
import { useWaitlistManagement } from '@/hooks/useWaitlistManagement';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface WaitlistDialogProps {
  courseInstanceId: string;
  courseTitle: string;
  courseTableName: string;
  waitlistCount: number;
  children: React.ReactNode;
}

export const WaitlistDialog: React.FC<WaitlistDialogProps> = ({
  courseInstanceId,
  courseTitle,
  courseTableName,
  waitlistCount,
  children
}) => {
  const {
    waitlistEntries,
    isLoadingWaitlist,
    moveFromWaitlist,
    removeFromWaitlist,
    isMoving,
    isRemoving
  } = useWaitlistManagement(courseInstanceId);

  const handleMoveToParticipants = (email: string, name: string) => {
    moveFromWaitlist({
      courseInstanceId,
      email,
      courseTableName
    });
  };

  const handleRemoveFromWaitlist = (email: string, name: string) => {
    removeFromWaitlist({
      courseInstanceId,
      email
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto sm:max-w-[95vw] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Väntelista - {courseTitle}
            <Badge variant="secondary" className="ml-2">
              {waitlistCount} personer
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingWaitlist ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Laddar väntelista...</div>
            </div>
          ) : waitlistEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ingen väntelista för denna kurs ännu.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Position</TableHead>
                    <TableHead>Namn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Meddelande</TableHead>
                    <TableHead>Anmäld</TableHead>
                    <TableHead className="text-right">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistEntries.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          #{entry.position_in_queue}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell className="max-w-xs truncate" title={entry.message || ''}>
                        {entry.message || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), 'dd MMM yyyy, HH:mm', { locale: sv })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isMoving || isRemoving}
                                className="h-8"
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Flytta till kurs
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Flytta till kurs</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill flytta <strong>{entry.name}</strong> från väntelistan till kursen? 
                                  Personen kommer att läggas till som kursdeltagare och tas bort från väntelistan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleMoveToParticipants(entry.email, entry.name)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Flytta till kurs
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isMoving || isRemoving}
                                className="h-8 text-red-600 hover:text-red-700"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Ta bort
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ta bort från väntelista</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill ta bort <strong>{entry.name}</strong> från väntelistan? 
                                  Denna åtgärd kan inte ångras.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemoveFromWaitlist(entry.email, entry.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
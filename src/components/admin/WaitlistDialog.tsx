import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, UserPlus, UserX, Clock, Mail } from 'lucide-react';
import { useWaitlistManagement } from '@/hooks/useWaitlistManagement';
import { useCourseOffers } from '@/hooks/useCourseOffers';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface WaitlistDialogProps {
  courseInstanceId: string;
  courseTitle: string;
  courseTableName: string;
  waitlistCount: number;
  coursePrice?: number;
  courseDiscountPrice?: number;
  children: React.ReactNode;
}

export const WaitlistDialog: React.FC<WaitlistDialogProps> = ({
  courseInstanceId,
  courseTitle,
  courseTableName,
  waitlistCount,
  coursePrice = 0,
  courseDiscountPrice = 0,
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

  const { sendCourseOffer, isSendingOffer } = useCourseOffers();

  const handleSendOffer = async (entry: any) => {
    const success = await sendCourseOffer({
      courseInstanceId,
      courseTitle,
      courseTableName,
      coursePrice,
      courseDiscountPrice,
      waitlistEmail: entry.email,
      waitlistName: entry.name,
      waitlistPhone: entry.phone,
      waitlistMessage: entry.message
    });
  };

  const handleMoveToParticipants = (email: string, name: string) => {
    moveFromWaitlist({
      courseInstanceId,
      email,
      courseTableName,
      coursePrice
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
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <Users className="h-5 w-5" />
            <span className="text-sm sm:text-base">Väntelista - {courseTitle}</span>
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
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Position</TableHead>
                      <TableHead>Namn</TableHead>
                      <TableHead>E-post</TableHead>
                      <TableHead>Meddelande</TableHead>
                      <TableHead>Anmäld</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {entry.offer_sent ? (
                              <Badge variant="secondary" className="text-xs text-white w-fit">
                                Erbjudande skickat
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-white w-fit">
                                Väntar
                              </Badge>
                            )}
                            {entry.offer_sent && entry.offer_sent_at && (
                              <span className="text-xs text-white/80">
                                {format(new Date(entry.offer_sent_at), 'dd MMM HH:mm', { locale: sv })}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button
                              size="sm"
                              onClick={() => handleSendOffer(entry)}
                              disabled={isSendingOffer}
                              className="h-8"
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              {isSendingOffer ? 'Skickar...' : 'Erbjud plats'}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isMoving || isRemoving}
                                  className="h-8"
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Flytta direkt
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Flytta till kurs</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Är du säker på att du vill flytta <strong>{entry.name}</strong> direkt från väntelistan till kursen? 
                                    Personen kommer att läggas till som kursdeltagare och tas bort från väntelistan.
                                    {coursePrice > 0 && " Detta kommer att öppna en betalningslänk."}
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {waitlistEntries.map((entry, index) => (
                  <Card key={entry.id} className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            #{entry.position_in_queue}
                          </Badge>
                          {entry.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">E-post:</span>
                          <div className="break-all">{entry.email}</div>
                        </div>
                        {entry.message && (
                          <div>
                            <span className="font-medium text-muted-foreground">Meddelande:</span>
                            <div className="text-sm">{entry.message}</div>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-muted-foreground">Anmäld:</span>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), 'dd MMM yyyy, HH:mm', { locale: sv })}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Status:</span>
                          <div className="mt-1 space-y-2">
                            {entry.offer_sent ? (
                              <>
                                <Badge variant="secondary" className="text-xs text-white w-fit">
                                  Erbjudande skickat
                                </Badge>
                                {entry.offer_sent_at && (
                                  <div className="text-xs text-white/80">
                                    {format(new Date(entry.offer_sent_at), 'dd MMM HH:mm', { locale: sv })}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs text-white w-fit">
                                Väntar
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendOffer(entry)}
                          disabled={isSendingOffer}
                          className="w-full"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {isSendingOffer ? 'Skickar...' : 'Erbjud plats'}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isMoving || isRemoving}
                              className="w-full"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Flytta direkt till kurs
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Flytta till kurs</AlertDialogTitle>
                              <AlertDialogDescription>
                                Är du säker på att du vill flytta <strong>{entry.name}</strong> direkt från väntelistan till kursen? 
                                Personen kommer att läggas till som kursdeltagare och tas bort från väntelistan.
                                {coursePrice > 0 && " Detta kommer att öppna en betalningslänk."}
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
                              className="w-full text-red-600 hover:text-red-700"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Ta bort från väntelista
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
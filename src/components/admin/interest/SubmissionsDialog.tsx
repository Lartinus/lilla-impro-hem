import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, UserX } from 'lucide-react';
import type { InterestSignupWithSubmissions, InterestSubmission } from '@/types/interestSignupManagement';

interface SubmissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInterest: InterestSignupWithSubmissions | null;
  submissions: InterestSubmission[];
  onDeleteSubmission: (submissionId: string) => void;
  isDeleting: boolean;
}

export function SubmissionsDialog({
  isOpen,
  onClose,
  selectedInterest,
  submissions,
  onDeleteSubmission,
  isDeleting
}: SubmissionsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Anmälningar för: {selectedInterest?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {submissions.length === 0 ? (
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
                {submissions.map((submission) => (
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
                            onDeleteSubmission(submission.id);
                          }
                        }}
                        disabled={isDeleting}
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
  );
}
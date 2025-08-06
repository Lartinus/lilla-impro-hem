import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { CourseParticipant } from '@/types/courseManagement';

interface ResendConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: CourseParticipant | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ResendConfirmationDialog: React.FC<ResendConfirmationDialogProps> = ({
  open,
  onOpenChange,
  participant,
  onConfirm,
  isLoading
}) => {
  if (!participant) return null;

  const resendCount = participant.resend_count || 0;
  const lastResent = participant.last_resent_at
    ? new Date(participant.last_resent_at).toLocaleString('sv-SE')
    : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Skicka bekräftelse igen
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Är du säker på att du vill skicka kursbekräftelsen igen till{' '}
              <strong>{participant.name}</strong> ({participant.email})?
            </div>
            
            {resendCount > 0 && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <div className="text-sm">
                  <div className="font-medium">Tidigare utskick:</div>
                  <div>Antal gånger skickat: <strong>{resendCount}</strong></div>
                  {lastResent && (
                    <div>Senast skickat: <strong>{lastResent}</strong></div>
                  )}
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Avbryt
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Skickar...' : 'Skicka bekräftelse'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
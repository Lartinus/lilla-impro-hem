import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContactActivities } from '@/hooks/useContactActivities';

interface ContactActivitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactEmail: string;
}

export function ContactActivitiesDialog({ 
  open, 
  onOpenChange, 
  contactEmail 
}: ContactActivitiesDialogProps) {
  const { data: contactActivities = [], isLoading: activitiesLoading } = useContactActivities(contactEmail);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Aktiviteter för {contactEmail}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {activitiesLoading ? (
            <div className="text-center py-4">Laddar aktiviteter...</div>
          ) : contactActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Inga aktiviteter hittades för denna kontakt.
            </div>
          ) : (
            <div className="space-y-3">
              {contactActivities.map((activity, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        activity.activity_type === 'course' ? 'default' :
                        activity.activity_type === 'ticket' ? 'secondary' :
                        'outline'
                      }>
                        {activity.activity_type === 'course' ? 'Kurs' :
                         activity.activity_type === 'ticket' ? 'Biljett' :
                         activity.activity_type === 'interest' ? 'Intresse' :
                         activity.activity_type}
                      </Badge>
                      <span className="font-medium">{activity.activity_title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.activity_date).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {activity.activity_type === 'ticket' && (
                        <div>
                          <span>Antal biljetter: {activity.details.total_tickets}</span>
                          <span className="ml-4">Datum: {activity.details.show_date}</span>
                          <span className="ml-4">Plats: {activity.details.show_location}</span>
                        </div>
                      )}
                      {activity.details.message && (
                        <div className="mt-1">
                          <span className="font-medium">Meddelande:</span> {activity.details.message}
                        </div>
                      )}
                      {activity.details.phone && (
                        <div className="mt-1">
                          <span className="font-medium">Telefon:</span> {activity.details.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Stäng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Power, PowerOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Performer {
  id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PerformerCardProps {
  performer: Performer;
  onEdit: (performer: Performer) => void;
  onToggleStatus: (performer: Performer) => void;
  onDelete: (performer: Performer) => void;
}

export function PerformerCard({ performer, onEdit, onToggleStatus, onDelete }: PerformerCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header Section with Avatar and Name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {performer.image_url ? (
              <img 
                src={performer.image_url} 
                alt={performer.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-border/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border/20">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{performer.name}</h3>
              <Badge variant={performer.is_active ? "default" : "secondary"} className="flex-shrink-0">
                {performer.is_active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {performer.bio && (
          <div className="mb-4 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {performer.bio}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(performer)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(performer)}
            className="flex-1 sm:flex-none"
          >
            {performer.is_active ? (
              <PowerOff className="h-4 w-4 mr-2" />
            ) : (
              <Power className="h-4 w-4 mr-2" />
            )}
            {performer.is_active ? 'Inaktivera' : 'Aktivera'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                <Trash2 className="h-4 w-4 mr-2" />
                Radera
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bekräfta borttagning</AlertDialogTitle>
                <AlertDialogDescription>
                  Är du säker på att du vill radera "{performer.name}"? Denna åtgärd kan inte ångras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(performer)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Radera
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
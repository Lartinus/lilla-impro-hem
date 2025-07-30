import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Edit, Trash2, ChevronUp, ChevronDown, MapPin, Clock, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ShowTag from '@/components/ShowTag';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { AdminShowWithPerformers } from '@/types/showManagement';

interface ShowCardProps {
  show: AdminShowWithPerformers;
  index: number;
  totalShows: number;
  onEdit: (show: AdminShowWithPerformers) => void;
  onToggleVisibility: (show: AdminShowWithPerformers) => void;
  onDelete: (show: AdminShowWithPerformers) => void;
  onMoveUp: (show: AdminShowWithPerformers) => void;
  onMoveDown: (show: AdminShowWithPerformers) => void;
}

export function ShowCard({
  show,
  index,
  totalShows,
  onEdit,
  onToggleVisibility,
  onDelete,
  onMoveUp,
  onMoveDown
}: ShowCardProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < totalShows - 1;

  const formattedDate = format(new Date(show.show_date), 'dd MMM yyyy', { locale: sv });

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 bg-card-background">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">{show.title}</h3>
              <Badge variant={show.is_active ? "default" : "secondary"} className="flex-shrink-0">
                {show.is_active ? 'Aktiv' : 'Inaktiv'}
              </Badge>
              {show.show_tag && (
                <ShowTag name={show.show_tag.name} color={show.show_tag.color} size="small" />
              )}
            </div>
          </div>

          {/* Order Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(show)}
              disabled={!canMoveUp}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground min-w-[2rem] text-center">
              {index + 1}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(show)}
              disabled={!canMoveDown}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Show Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formattedDate}</span>
            <Clock className="h-4 w-4 flex-shrink-0 ml-2" />
            <span>{show.show_time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{show.venue}</span>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Ordinarie: </span>
              <span className="font-medium">{show.regular_price} kr</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rabatt: </span>
              <span className="font-medium">{show.discount_price} kr</span>
            </div>
          </div>

          {/* Performers */}
          {show.performers && show.performers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {show.performers.map((performer) => (
                <Badge key={performer.id} variant="outline" className="text-xs">
                  {performer.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Description Preview */}
        {show.description && (
          <div className="mb-4 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {show.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(show)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleVisibility(show)}
            className="flex-1 sm:flex-none"
          >
            {show.is_active ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {show.is_active ? 'Inaktivera' : 'Aktivera'}
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
                  Är du säker på att du vill ta bort föreställningen "{show.title}"? 
                  Denna åtgärd kan inte ångras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(show)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Ta bort
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
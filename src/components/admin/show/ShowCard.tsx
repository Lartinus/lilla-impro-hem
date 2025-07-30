import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Edit, Trash2, ArrowUp, ArrowDown, MapPin, Clock, Calendar, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ShowTag from '@/components/ShowTag';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AdminShowWithPerformers } from '@/types/showManagement';

interface ShowCardProps {
  show: AdminShowWithPerformers;
  index: number;
  totalShows: number;
  showCompleted?: boolean;
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
  showCompleted = false,
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
    <Card className={cn(
      "shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4",
      show.is_active ? "border-l-primary bg-card" : "border-l-muted bg-muted/30 opacity-75",
    )}>
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header with title and status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!showCompleted && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 font-mono shrink-0">
                    #{index + 1}
                  </Badge>
                )}
                <Badge variant={show.is_active ? "default" : "secondary"} className="shrink-0">
                  {show.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
                {show.show_tag && (
                  <ShowTag name={show.show_tag.name} color={show.show_tag.color} size="small" />
                )}
              </div>
              <h3 className="text-lg font-semibold leading-tight text-foreground">{show.title}</h3>
            </div>
            
            {/* Move buttons - compact (only for active shows) */}
            {!showCompleted && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(show)}
                  disabled={!canMoveUp}
                  className="w-7 h-7 p-0 hover:bg-muted"
                  title="Flytta upp"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(show)}
                  disabled={!canMoveDown}
                  className="w-7 h-7 p-0 hover:bg-muted"
                  title="Flytta ner"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Show details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-3 border-t border-border/50">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Datum</span>
              <div className="text-sm font-medium">{formattedDate}</div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tid</span>
              <div className="text-sm font-medium">{show.show_time.substring(0, 5)}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plats</span>
              <div className="text-sm font-medium">{show.venue}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pris</span>
              <div className="text-sm font-medium">
                {show.regular_price} / {show.discount_price} kr
              </div>
            </div>
          </div>

          {/* Performers */}
          {show.performers && show.performers.length > 0 && (
            <div className="py-2 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skådespelare</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {show.performers.map((performer) => (
                  <Badge key={performer.id} variant="outline" className="text-xs">
                    {performer.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description Preview */}
          {show.description && (
            <div className="py-2 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beskrivning</span>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {show.description}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(show)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Edit className="w-3 h-3" />
              Redigera
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleVisibility(show)}
              className="flex items-center gap-1.5 text-xs"
            >
              {show.is_active ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  Inaktivera
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  Aktivera
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1.5 text-xs ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  Ta bort
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Denna åtgärd kan inte ångras. Föreställningen "{show.title}" kommer att tas bort permanent från systemet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(show)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ta bort
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
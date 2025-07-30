import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Edit, Trash2, Users, ChevronUp, ChevronDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { InterestSignupWithSubmissions } from '@/types/interestSignupManagement';

interface InterestCardProps {
  item: InterestSignupWithSubmissions;
  index: number;
  totalItems: number;
  onEdit: (item: InterestSignupWithSubmissions) => void;
  onToggleVisibility: (item: InterestSignupWithSubmissions) => void;
  onDelete: (item: InterestSignupWithSubmissions) => void;
  onViewSubmissions: (item: InterestSignupWithSubmissions) => void;
  onMoveUp: (item: InterestSignupWithSubmissions) => void;
  onMoveDown: (item: InterestSignupWithSubmissions) => void;
}

export function InterestCard({
  item,
  index,
  totalItems,
  onEdit,
  onToggleVisibility,
  onDelete,
  onViewSubmissions,
  onMoveUp,
  onMoveDown
}: InterestCardProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < totalItems - 1;

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground truncate">{item.title}</h3>
              <Badge variant={item.is_visible ? "default" : "secondary"} className="flex-shrink-0">
                {item.is_visible ? 'Synlig' : 'Dold'}
              </Badge>
            </div>
            
            {item.subtitle && (
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            )}
          </div>

          {/* Order Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(item)}
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
              onClick={() => onMoveDown(item)}
              disabled={!canMoveDown}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Submission Count */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.submissionCount}</span> anmälningar
          </span>
        </div>

        {/* Information Preview */}
        {item.information && (
          <div className="mb-4 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.information}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewSubmissions(item)}
            className="flex-1 sm:flex-none"
          >
            <Users className="h-4 w-4 mr-2" />
            Visa anmälningar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex-1 sm:flex-none"
          >
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleVisibility(item)}
            className="flex-1 sm:flex-none"
          >
            {item.is_visible ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {item.is_visible ? 'Dölj' : 'Visa'}
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
                  Är du säker på att du vill ta bort intresseanmälan "{item.title}"? 
                  Alla tillhörande anmälningar kommer också att tas bort. Denna åtgärd kan inte ångras.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
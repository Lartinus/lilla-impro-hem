import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUp, 
  ArrowDown, 
  Edit, 
  Users,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CourseWithBookings, Performer } from '@/types/courseManagement';

interface CourseCardProps {
  course: CourseWithBookings;
  index: number;
  performers?: Performer[];
  showCompleted: boolean;
  onEdit: (course: CourseWithBookings) => void;
  onToggleStatus: (course: CourseWithBookings) => void;
  onDelete: (course: CourseWithBookings) => void;
  onViewParticipants: (course: CourseWithBookings) => void;
  onMarkCompleted?: (course: CourseWithBookings) => void;
  onRestore?: (course: CourseWithBookings) => void;
  onMoveUp: (course: CourseWithBookings) => void;
  onMoveDown: (course: CourseWithBookings) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  sortedCourses: CourseWithBookings[];
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  performers,
  showCompleted,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewParticipants,
  onMarkCompleted,
  onRestore,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  sortedCourses
}) => {
  // Find instructors by their IDs
  const instructor1 = course.instructor_id_1 
    ? performers?.find(p => p.id === course.instructor_id_1)
    : null;
  const instructor2 = course.instructor_id_2 
    ? performers?.find(p => p.id === course.instructor_id_2)
    : null;

  const instructorNames = [instructor1?.name, instructor2?.name]
    .filter(Boolean)
    .join(', ') || 'Ej tilldelad';

  return (
    <Card className={cn(
      "shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4",
      course.is_active ? "border-l-blue-500 bg-card" : "border-l-muted bg-muted/30 opacity-75",
    )}>
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header with title and status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!showCompleted && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 font-mono shrink-0">
                    #{course.sort_order || index + 1}
                  </Badge>
                )}
                <Badge variant={course.is_active ? "default" : "secondary"} className="shrink-0">
                  {course.is_active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold leading-tight text-foreground">{course.course_title}</h3>
              {course.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{course.subtitle}</p>
              )}
            </div>
            
            {/* Move buttons - compact (only for active courses) */}
            {!showCompleted && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveUp(course)}
                  disabled={!canMoveUp}
                  className="w-7 h-7 p-0 hover:bg-muted"
                  title="Flytta upp"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMoveDown(course)}
                  disabled={!canMoveDown}
                  className="w-7 h-7 p-0 hover:bg-muted"
                  title="Flytta ner"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Course details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-3 border-t border-border/50">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Startdatum</span>
              <div className="text-sm font-medium">
                {course.start_date 
                  ? format(new Date(course.start_date), 'yyyy-MM-dd')
                  : 'Ej satt'
                }
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kursledare</span>
              <div className="text-sm font-medium">{instructorNames}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Anmälda</span>
              <div className="text-sm font-medium">
                <span className={course.bookingCount >= (course.max_participants || 0) ? 'font-bold text-destructive' : ''}>
                  {course.bookingCount}
                </span>
                <span className="text-muted-foreground"> / {course.max_participants || '∞'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Session</span>
              <div className="text-sm font-medium">
                {course.sessions || 1} × {course.hours_per_session || 2}h
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewParticipants(course)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Users className="w-3 h-3" />
              Deltagare
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(course)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Edit className="w-3 h-3" />
              Redigera
            </Button>

            {showCompleted && onRestore ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(course)}
                className="flex items-center gap-1.5 text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                Återställ
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(course)}
                  className="flex items-center gap-1.5 text-xs"
                >
                  {course.is_active ? (
                    <>
                      <ToggleLeft className="w-3 h-3" />
                      Inaktivera
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-3 h-3" />
                      Aktivera
                    </>
                  )}
                </Button>

                {onMarkCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkCompleted(course)}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Genomförd
                  </Button>
                )}
              </>
            )}

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
                    Denna åtgärd kan inte ångras. Kursen "{course.course_title}" kommer att tas bort permanent från systemet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(course)}
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
};
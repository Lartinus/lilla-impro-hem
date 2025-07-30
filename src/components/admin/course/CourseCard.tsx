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
    <Card className={course.is_active ? '' : 'opacity-60'}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Move buttons */}
          <div className="flex flex-col gap-1 order-first lg:order-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveUp(course)}
              disabled={!canMoveUp}
              className="w-8 h-8 p-0"
              title="Flytta upp"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveDown(course)}
              disabled={!canMoveDown}
              className="w-8 h-8 p-0"
              title="Flytta ner"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </div>

          {/* Course content */}
          <div className="flex-1 space-y-3">
            {/* Header with sort order and title */}
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs px-2 py-1 font-mono">
                #{course.sort_order || index + 1}
              </Badge>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{course.course_title}</h3>
                {course.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{course.subtitle}</p>
                )}
              </div>
            </div>

            {/* Course details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Startdatum:</span>
                <div>
                  {course.start_date 
                    ? format(new Date(course.start_date), 'yyyy-MM-dd')
                    : 'Ej satt'
                  }
                </div>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Kursledare:</span>
                <div>{instructorNames}</div>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Anmälda:</span>
                <div>
                  <span className={course.bookingCount >= (course.max_participants || 0) ? 'font-bold text-destructive' : ''}>
                    {course.bookingCount}
                  </span>
                  <span className="text-muted-foreground"> / {course.max_participants || 'Obegränsat'}</span>
                </div>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <div>
                  <Badge variant={course.is_active ? "default" : "secondary"}>
                    {course.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewParticipants(course)}
              className="flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Deltagare
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(course)}
              className="flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Redigera
            </Button>

            {showCompleted && onRestore ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(course)}
                className="flex items-center gap-1"
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
                  className="flex items-center gap-1"
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
                    className="flex items-center gap-1"
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
                  className="flex items-center gap-1"
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
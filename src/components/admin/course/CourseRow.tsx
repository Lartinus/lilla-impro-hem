import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Edit, 
  RotateCcw, 
  PowerOff, 
  Power, 
  Archive, 
  Trash2 
} from 'lucide-react';
import { CourseWithBookings, Performer } from '@/types/courseManagement';

interface CourseRowProps {
  course: CourseWithBookings;
  onEdit: (course: CourseWithBookings) => void;
  onToggleStatus: (course: CourseWithBookings) => void;
  onDelete: (course: CourseWithBookings) => void;
  onViewParticipants: (course: CourseWithBookings) => void;
  onMarkCompleted?: (course: CourseWithBookings) => void;
  onRestore?: (course: CourseWithBookings) => void;
  onMoveUp: (course: CourseWithBookings) => void;
  onMoveDown: (course: CourseWithBookings) => void;
  onToggleSmallCard: (course: CourseWithBookings) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  performers?: Performer[];
  showCompleted: boolean;
}

export function CourseRow({
  course,
  onEdit,
  onToggleStatus,
  onDelete,
  onViewParticipants,
  onMarkCompleted,
  onRestore,
  onMoveUp,
  onMoveDown,
  onToggleSmallCard,
  canMoveUp,
  canMoveDown,
  performers,
  showCompleted
}: CourseRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveUp(course)}
              disabled={!canMoveUp}
              className="w-6 h-6 p-0"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMoveDown(course)}
              disabled={!canMoveDown}
              className="w-6 h-6 p-0"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">#{course.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{course.course_title}</TableCell>
      <TableCell>
        {course.start_date ? new Date(course.start_date).toLocaleDateString('sv-SE') : '-'}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {(() => {
          const instructor1 = performers?.find(p => p.id === course.instructor_id_1);
          const instructor2 = performers?.find(p => p.id === course.instructor_id_2);
          const instructors = [instructor1?.name, instructor2?.name].filter(Boolean);
          return instructors.length > 0 ? instructors.join(', ') : 'Ingen kursledare';
        })()}
      </TableCell>
      <TableCell>
        <span className="font-semibold">{course.bookingCount}</span>
      </TableCell>
      <TableCell>{course.max_participants || '-'}</TableCell>
      <TableCell>
        <Badge variant={course.is_active ? "default" : "secondary"}>
          {course.is_active ? 'Aktiv' : 'Inaktiv'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          {/* Första raden - Primära åtgärder */}
          <div className="flex gap-2 min-w-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewParticipants(course)}
              className="flex-1 min-w-0 text-xs px-2"
            >
              <Users className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">Deltagare ({course.bookingCount})</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(course)}
              className="flex-1 min-w-0 text-xs px-2"
            >
              <Edit className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">Redigera</span>
            </Button>
          </div>
          
          {/* Andra raden - Sekundära åtgärder */}
          <div className="flex gap-2 min-w-0">
            {showCompleted && onRestore && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRestore(course)}
                className="flex-1 min-w-0 text-xs px-2"
              >
                <RotateCcw className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Återställ</span>
              </Button>
            )}
            {!showCompleted && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onToggleStatus(course)}
                className="flex-1 min-w-0 text-xs px-2"
              >
                {course.is_active ? (
                  <PowerOff className="w-3 h-3 mr-1 flex-shrink-0" />
                ) : (
                  <Power className="w-3 h-3 mr-1 flex-shrink-0" />
                )}
                <span className="truncate">{course.is_active ? 'Inaktivera' : 'Aktivera'}</span>
              </Button>
            )}
            {!showCompleted && onMarkCompleted && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onMarkCompleted(course)}
                className="flex-1 min-w-0 text-xs px-2"
              >
                <Archive className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Genomförd</span>
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm(`Är du säker på att du vill radera kursen "${course.course_title}"? Detta kan inte ångras.`)) {
                  onDelete(course);
                }
              }}
              className={`min-w-0 px-2 ${showCompleted ? (onRestore ? "w-10" : "flex-1") : "w-10"}`}
            >
              <Trash2 className="w-3 h-3 flex-shrink-0" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
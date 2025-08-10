import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Edit, 
  RotateCcw, 
  PowerOff, 
  Power, 
  Archive, 
  Trash2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { CourseWithBookings, Performer } from '@/types/courseManagement';
import { useWaitlistManagement } from '@/hooks/useWaitlistManagement';
import { WaitlistDialog } from '../WaitlistDialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface MobileCourseCardProps {
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

export function MobileCourseCard({
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
}: MobileCourseCardProps) {
  // Get waitlist data for this course
  const { waitlistCount, isLoadingCount } = useWaitlistManagement(course.id);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
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
          <Badge variant={course.is_active ? "default" : "secondary"}>
            {course.is_active ? 'Aktiv' : 'Inaktiv'}
          </Badge>
        </div>

        {/* Mobile: size toggle centered at top */}
        <div className="flex justify-center mb-3">
          <ToggleGroup
            type="single"
            value={course.use_small_card ? 'small' : 'large'}
            onValueChange={(val) => {
              if (!val) return
              const wantSmall = val === 'small'
              if (wantSmall !== !!course.use_small_card) onToggleSmallCard(course)
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSmallCard(course)
            }}
            className="relative h-7 rounded-full bg-primary-red text-background p-0.5 overflow-hidden select-none shadow"
          >
            {/* Sliding indicator - white pill */}
            <span
              aria-hidden
              className={cn(
                "absolute top-0.5 left-0.5 h-[calc(100%-4px)] w-[calc(50%-4px)] rounded-full bg-background shadow-md ring-1 ring-primary-red transition-[left] duration-200",
                course.use_small_card ? "left-[calc(50%+2px)]" : "left-0.5"
              )}
            />
            <ToggleGroupItem
              value="large"
              className="relative z-10 inline-flex h-7 px-3 items-center justify-center text-[11px] font-medium rounded-full text-background data-[state=on]:text-primary-red bg-transparent hover:!bg-transparent data-[state=on]:!bg-transparent focus-visible:ring-0 focus:outline-none pointer-events-none"
              aria-label="Visa stort kort"
            >
              Stort
            </ToggleGroupItem>
            <ToggleGroupItem
              value="small"
              className="relative z-10 inline-flex h-7 px-3 items-center justify-center text-[11px] font-medium rounded-full text-background data-[state=on]:text-primary-red bg-transparent hover:!bg-transparent data-[state=on]:!bg-transparent focus-visible:ring-0 focus:outline-none pointer-events-none"
              aria-label="Visa litet kort"
            >
              Litet
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-base leading-5">{course.course_title}</h3>
            {course.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{course.subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Startdatum:</span>
              <div>{course.start_date ? format(new Date(course.start_date), 'yyyy-MM-dd') : 'Ej satt'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Kursledare:</span>
              <div>
                {(() => {
                  const instructor1 = performers?.find(p => p.id === course.instructor_id_1);
                  const instructor2 = performers?.find(p => p.id === course.instructor_id_2);
                  const instructors = [instructor1?.name, instructor2?.name].filter(Boolean);
                  return instructors.length > 0 ? instructors.join(', ') : 'Ej satt';
                })()}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Anmälningar:</span>
              <div className="font-medium">{course.bookingCount}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Max antal:</span>
              <div>{course.max_participants || 12}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
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
              
              <WaitlistDialog
                courseInstanceId={course.id}
                courseTitle={course.course_title}
                courseTableName={course.table_name}
                waitlistCount={waitlistCount}
                coursePrice={course.price}
                courseDiscountPrice={course.discount_price || 0}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 min-w-0 text-xs px-2"
                  disabled={isLoadingCount}
                >
                  <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">Väntelista {waitlistCount > 0 && `(${waitlistCount})`}</span>
                </Button>
              </WaitlistDialog>
            </div>
            
            {/* Andra raden - Sekundära åtgärder */}
            <div className="flex gap-2 min-w-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(course)}
                className="flex-1 min-w-0 text-xs px-2"
              >
                <Edit className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Redigera</span>
              </Button>
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
            </div>
            
            {/* Tredje raden - Destruktiva/admin åtgärder */}
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
                  if (confirm(`Är du säker på att du vill radera "${course.course_title}"? Detta kan inte ångras.`)) {
                    onDelete(course);
                  }
                }}
                className={`min-w-0 px-2 ${showCompleted ? (onRestore ? "w-10" : "flex-1") : "w-10"}`}
              >
                <Trash2 className="w-3 h-3 flex-shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
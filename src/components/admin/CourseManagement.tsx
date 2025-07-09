import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, Users, ArrowUpDown, ArrowUp, ArrowDown, Plus, Trash2, Power, PowerOff, Edit, CalendarIcon, GripVertical, User, Download, Archive, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface CourseInstance {
  id: string;
  course_title: string;
  table_name: string;
  start_date: string | null;
  end_date: string | null;
  max_participants: number | null;
  is_active: boolean;
  created_at: string;
  course_info?: string | null;
  practical_info?: string | null;
  instructor?: string | null;
  instructor_id_1?: string | null;
  instructor_id_2?: string | null;
  subtitle?: string | null;
  sessions?: number;
  hours_per_session?: number;
  price?: number;
  discount_price?: number;
  sort_order?: number;
}

interface CourseWithBookings extends CourseInstance {
  bookingCount: number;
}

interface CourseParticipant {
  email: string;
  name: string;
}

type SortField = 'course_title' | 'start_date' | 'bookingCount' | 'sort_order';
type SortDirection = 'asc' | 'desc';

interface NewCourseForm {
  courseType: string;
  customName: string;
  subtitle: string;
  instructor1: string;
  instructor2: string;
  sessions: number;
  hoursPerSession: number;
  startDate: Date | undefined;
  maxParticipants: number;
  price: number;
  discountPrice: number;
  courseInfo: string;
  practicalInfo: string;
}

// Mobile Course Card Component
function MobileCourseCard({ course, onEdit, onToggleStatus, onDelete, onViewParticipants, onMarkCompleted, onRestore, performers, showCompleted }: {
  course: CourseWithBookings;
  onEdit: (course: CourseWithBookings) => void;
  onToggleStatus: (course: CourseWithBookings) => void;
  onDelete: (course: CourseWithBookings) => void;
  onViewParticipants: (course: CourseWithBookings) => void;
  onMarkCompleted?: (course: CourseWithBookings) => void;
  onRestore?: (course: CourseWithBookings) => void;
  performers?: any[];
  showCompleted: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground">#{course.sort_order || 0}</span>
          </div>
          <Badge variant={course.is_active ? "default" : "secondary"}>
            {course.is_active ? 'Aktiv' : 'Inaktiv'}
          </Badge>
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
                {/* Visa båda kursledarna om de finns */}
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

// Sortable Row Component
function SortableRow({ course, onEdit, onToggleStatus, onDelete, onViewParticipants, onMarkCompleted, onRestore, performers, showCompleted }: {
  course: CourseWithBookings;
  onEdit: (course: CourseWithBookings) => void;
  onToggleStatus: (course: CourseWithBookings) => void;
  onDelete: (course: CourseWithBookings) => void;
  onViewParticipants: (course: CourseWithBookings) => void;
  onMarkCompleted?: (course: CourseWithBookings) => void;
  onRestore?: (course: CourseWithBookings) => void;
  performers?: any[];
  showCompleted: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">#{course.sort_order || 0}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">{course.course_title}</TableCell>
      <TableCell>
        {course.start_date ? new Date(course.start_date).toLocaleDateString('sv-SE') : '-'}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {/* Visa båda kursledarna om de finns */}
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

export const CourseManagement = ({ showCompleted = false }: { showCompleted?: boolean }) => {
  const [sortField, setSortField] = useState<SortField>('sort_order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithBookings | null>(null);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithBookings | null>(null);
  const [participants, setParticipants] = useState<CourseParticipant[]>([]);
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    courseType: '',
    customName: '',
    subtitle: '',
    instructor1: '',
    instructor2: '',
    sessions: 1,
    hoursPerSession: 2,
    startDate: undefined,
    maxParticipants: 12,
    price: 0,
    discountPrice: 0,
    courseInfo: '',
    practicalInfo: ''
  });

  const queryClient = useQueryClient();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch performers from local database
  const { data: performers } = useQuery({
    queryKey: ['performers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    retry: 1
  });

  // Update sort order mutation
  const updateSortOrderMutation = useMutation({
    mutationFn: async (updates: { id: string, sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from('course_instances')
          .update({ sort_order })
          .eq('id', id)
      );
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera sorteringsordning: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      // Delete the booking table first
      await supabase.rpc('drop_course_booking_table', {
        table_name: course.table_name
      });

      // Delete the course instance
      const { error } = await supabase
        .from('course_instances')
        .delete()
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Kurs raderad",
        description: "Kursen har raderats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte radera kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle course status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const { error } = await supabase
        .from('course_instances')
        .update({ is_active: !course.is_active })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Status uppdaterad",
        description: "Kursstatus har ändrats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte ändra kursstatus: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mark course as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const { error } = await supabase
        .from('course_instances')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: "Kurs markerad som genomförd",
        description: "Kursen har flyttats till arkivet",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte markera kurs som genomförd: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Restore course from completed to active mutation
  const restoreCourseMutation = useMutation({
    mutationFn: async (course: CourseWithBookings) => {
      const { error } = await supabase
        .from('course_instances')
        .update({ completed_at: null })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      toast({
        title: "Kurs återställd",
        description: "Kursen har flyttats tillbaka till aktiva kurser",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte återställa kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Template data mapping
  const getTemplateData = (courseType: string) => {
    const templates = {
      'niv1': {
        subtitle: 'Grundkurs i improvisationsteater',
        course_info: 'En introduktionskurs för nybörjare inom improvisationsteater.',
        practical_info: 'Ta med bekväma kläder och vara beredd att ha kul!',
        price: 2400,
        discount_price: 1800,
        max_participants: 12,
        sessions: 8,
        hours_per_session: 2,
      },
      'niv2': {
        subtitle: 'Fördjupningskurs i improvisationsteater',
        course_info: 'En fortsättningskurs för dig som redan har grundläggande kunskaper.',
        practical_info: 'Kräver tidigare erfarenhet av improvisationsteater.',
        price: 2800,
        discount_price: 2100,
        max_participants: 10,
        sessions: 8,
        hours_per_session: 2.5,
      },
      'houseteam': {
        subtitle: 'Regelbunden träning för erfarna improvisatörer',
        course_info: 'Kontinuerlig träning och utveckling för medlemmar i LIT:s house team.',
        practical_info: 'Endast för inbjudna medlemmar.',
        price: 1500,
        discount_price: 1200,
        max_participants: 8,
        sessions: 12,
        hours_per_session: 2,
      },
      'helgworkshop': {
        subtitle: 'Intensiv workshop under en helg',
        course_info: 'En koncentrerad workshop som sträcker sig över en helg.',
        practical_info: 'Fredag kväll, lördag och söndag.',
        price: 1800,
        discount_price: 1400,
        max_participants: 15,
        sessions: 3,
        hours_per_session: 4,
      }
    };
    return templates[courseType as keyof typeof templates];
  };

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (courseData: { course: CourseWithBookings; formData: NewCourseForm }) => {
      const { course, formData } = courseData;
      
      const { error } = await supabase
        .from('course_instances')
        .update({
          course_title: formData.courseType === 'custom' ? formData.customName :
                       formData.courseType === 'helgworkshop' ? formData.customName : 
                       formData.courseType === 'niv1' ? 'Nivå 1 - Scenarbete & Improv Comedy' :
                       formData.courseType === 'niv2' ? 'Nivå 2 - Långform improviserad komik' :
                       formData.courseType === 'houseteam' ? 'House Team & fortsättning' : course.course_title,
          subtitle: formData.subtitle,
          start_date: formData.startDate?.toISOString().split('T')[0],
          max_participants: formData.maxParticipants,
          course_info: formData.courseInfo,
          practical_info: formData.practicalInfo,
          instructor_id_1: formData.instructor1 ? performers?.find(p => p.id === formData.instructor1)?.id || null : null,
          instructor_id_2: formData.instructor2 ? performers?.find(p => p.id === formData.instructor2)?.id || null : null,
          price: formData.price,
          discount_price: formData.discountPrice,
          sessions: formData.sessions,
          hours_per_session: formData.hoursPerSession,
        })
        .eq('id', course.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingCourse(null);
      resetForm();
      toast({
        title: "Kurs uppdaterad",
        description: "Kursen har uppdaterats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte uppdatera kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: NewCourseForm) => {
      // Get the highest sort_order and add 1
      const { data: maxOrderData } = await supabase
        .from('course_instances')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextSortOrder = (maxOrderData?.[0]?.sort_order || 0) + 1;

      // Generate course title based on type
      let courseTitle = '';
      let tableName = '';
      
      switch (courseData.courseType) {
        case 'custom':
          courseTitle = courseData.customName;
          tableName = `course_custom_${courseData.customName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
          break;
        case 'niv1':
          courseTitle = 'Nivå 1 - Scenarbete & Improv Comedy';
          tableName = `course_niv_1_scenarbete_improv_comedy_${Date.now()}`;
          break;
        case 'niv2':
          courseTitle = 'Nivå 2 - Långform improviserad komik';
          tableName = `course_niv_2_langform_improviserad_komik_${Date.now()}`;
          break;
        case 'helgworkshop':
          courseTitle = courseData.customName;
          tableName = `course_helgworkshop_${courseData.customName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
          break;
        case 'houseteam':
          courseTitle = 'House Team & fortsättning';
          tableName = `course_house_team_fortsattning_${Date.now()}`;
          break;
      }

      // Create course instance
      const { data: courseInstance, error: courseError } = await supabase
        .from('course_instances')
        .insert({
          course_title: courseTitle,
          subtitle: courseData.subtitle,
          table_name: tableName,
          start_date: courseData.startDate?.toISOString().split('T')[0],
          max_participants: courseData.maxParticipants,
          course_info: courseData.courseInfo,
          practical_info: courseData.practicalInfo,
          instructor_id_1: courseData.instructor1 ? performers?.find(p => p.id === courseData.instructor1)?.id || null : null,
          instructor_id_2: courseData.instructor2 ? performers?.find(p => p.id === courseData.instructor2)?.id || null : null,
          price: courseData.price,
          discount_price: courseData.discountPrice,
          sessions: courseData.sessions,
          hours_per_session: courseData.hoursPerSession,
          sort_order: nextSortOrder,
          is_active: true
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create the booking table
      await supabase.rpc('create_course_booking_table', {
        table_name: tableName
      });

      return courseInstance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses-formatted'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Kurs skapad",
        description: "Kursen har skapats framgångsrikt",
      });
    },
    onError: (error) => {
      toast({
        title: "Fel",
        description: `Kunde inte skapa kurs: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses', showCompleted],
    queryFn: async (): Promise<CourseWithBookings[]> => {
      let query = supabase
        .from('course_instances')
        .select('*')
        .order('sort_order', { ascending: true });

      if (showCompleted) {
        query = query.not('completed_at', 'is', null);
      } else {
        query = query.is('completed_at', null);
      }

      const { data: courseInstances, error } = await query;

      if (error) throw error;

      // Get booking counts for each course using a more direct approach
      const coursesWithBookings = await Promise.all(
        (courseInstances || []).map(async (course) => {
          try {
            console.log(`Checking bookings for course: ${course.course_title}, table: ${course.table_name}`);
            
            // Try the RPC function first, then fallback to Edge Function
            const { data: bookingCount, error: rpcError } = await supabase.rpc('get_course_booking_count', {
              table_name: course.table_name
            });

            if (rpcError) {
              console.warn(`RPC failed for ${course.table_name}, trying Edge Function:`, rpcError);
              
              // Fallback to Edge Function
              const { data: result, error: edgeError } = await supabase.functions.invoke('get-course-bookings', {
                body: { table_name: course.table_name }
              });

              if (edgeError) {
                console.warn(`Edge Function also failed for ${course.table_name}:`, edgeError);
                return {
                  ...course,
                  bookingCount: 0
                };
              }

              return {
                ...course,
                bookingCount: result?.count || 0
              };
            }

            console.log(`Successfully got booking count for ${course.table_name}: ${bookingCount}`);
            return {
              ...course,
              bookingCount: bookingCount || 0
            };
          } catch (error) {
            console.warn(`Failed to get booking count for ${course.table_name}:`, error);
            return {
              ...course,
              bookingCount: 0
            };
          }
        })
      );

      // Show all courses
      return coursesWithBookings;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const resetForm = () => {
    setNewCourse({
      courseType: '',
      customName: '',
      subtitle: '',
      instructor1: '',
      instructor2: '',
      sessions: 1,
      hoursPerSession: 2,
      startDate: undefined,
      maxParticipants: 12,
      price: 0,
      discountPrice: 0,
      courseInfo: '',
      practicalInfo: ''
    });
  };

  const handleEditCourse = (course: CourseWithBookings) => {
    setEditingCourse(course);
    setIsEditMode(true);
    
    // Determine course type from title
    let courseType = '';
    if (course.course_title.includes('Nivå 1')) courseType = 'niv1';
    else if (course.course_title.includes('Nivå 2')) courseType = 'niv2';
    else if (course.course_title.includes('House Team')) courseType = 'houseteam';
    else courseType = 'helgworkshop';

    setNewCourse({
      courseType,
      customName: courseType === 'helgworkshop' ? course.course_title : '',
      subtitle: course.subtitle || '',
      instructor1: course.instructor_id_1 || '',
      instructor2: course.instructor_id_2 || '',
      sessions: course.sessions || 1,
      hoursPerSession: course.hours_per_session || 2,
      startDate: course.start_date ? new Date(course.start_date) : undefined,
      maxParticipants: course.max_participants || 12,
      price: course.price || 0,
      discountPrice: course.discount_price || 0,
      courseInfo: course.course_info || '',
      practicalInfo: course.practical_info || ''
    });
    
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isEditMode && editingCourse) {
      updateCourseMutation.mutate({ course: editingCourse, formData: newCourse });
    } else {
      createCourseMutation.mutate(newCourse);
    }
  };

  const handleViewParticipants = async (course: CourseWithBookings) => {
    setSelectedCourse(course);
    setIsParticipantsDialogOpen(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-course-participants', {
        body: { table_name: course.table_name }
      });

      if (error) {
        console.error('Error fetching participants:', error);
        toast({
          title: "Fel",
          description: "Kunde inte hämta deltagare",
          variant: "destructive"
        });
        setParticipants([]);
      } else {
        setParticipants(data?.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta deltagare",
        variant: "destructive"
      });
      setParticipants([]);
    }
  };

  const exportParticipants = () => {
    if (!selectedCourse || participants.length === 0) return;
    
    const csvContent = [
      ['Namn', 'E-post'].join(','),
      ...participants.map(p => [p.name, p.email].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedCourse.course_title.replace(/[^a-zA-Z0-9]/g, '_')}_deltagare.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && courses) {
      const oldIndex = courses.findIndex(course => course.id === active.id);
      const newIndex = courses.findIndex(course => course.id === over.id);
      
      const newOrder = arrayMove(courses, oldIndex, newIndex);
      
      // Update sort_order for all affected courses
      const updates = newOrder.map((course, index) => ({
        id: course.id,
        sort_order: index + 1
      }));
      
      updateSortOrderMutation.mutate(updates);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const sortedCourses = courses ? [...courses].sort((a, b) => {
    if (sortField === 'sort_order') {
      // For sort_order, always use ascending order to maintain drag order
      return (a.sort_order || 0) - (b.sort_order || 0);
    }

    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortField) {
      case 'course_title':
        aValue = a.course_title.toLowerCase();
        bValue = b.course_title.toLowerCase();
        break;
      case 'start_date':
        aValue = a.start_date ? new Date(a.start_date) : new Date(0);
        bValue = b.start_date ? new Date(b.start_date) : new Date(0);
        break;
      case 'bookingCount':
        aValue = a.bookingCount;
        bValue = b.bookingCount;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  }) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{showCompleted ? 'Genomförda kurser' : 'Aktiva kurser'}</CardTitle>
          <CardDescription>{showCompleted ? 'Läser in genomförda kurser...' : 'Läser in aktiva kurser...'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle>{showCompleted ? 'Genomförda kurser' : 'Aktiva kurser'}</CardTitle>
          </div>
          {!showCompleted && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till ny kurs
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Redigera kurs' : 'Skapa ny kurs'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="courseType">Kurstyp</Label>
                  <Select 
                    value={newCourse.courseType} 
                    onValueChange={(value) => {
                      setNewCourse({...newCourse, courseType: value});
                      // Auto-fill form fields if selecting a template
                      if (value === 'custom') {
                        // Reset to defaults for custom course
                        setNewCourse(prev => ({
                          ...prev,
                          courseType: value,
                          customName: '',
                          subtitle: '',
                          sessions: 8,
                          hoursPerSession: 2,
                          maxParticipants: 12,
                          price: 0,
                          discountPrice: 0,
                          courseInfo: '',
                          practicalInfo: ''
                        }));
                      } else {
                        // Fill with template data
                        const templateData = getTemplateData(value);
                        if (templateData) {
                          setNewCourse(prev => ({
                            ...prev,
                            courseType: value,
                            subtitle: templateData.subtitle || '',
                            sessions: templateData.sessions,
                            hoursPerSession: templateData.hours_per_session,
                            maxParticipants: templateData.max_participants,
                            price: templateData.price,
                            discountPrice: templateData.discount_price || 0,
                            courseInfo: templateData.course_info || '',
                            practicalInfo: templateData.practical_info || ''
                          }));
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kurstyp eller skapa anpassad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Anpassad kurs (eget namn)</SelectItem>
                      <SelectItem value="niv1">Nivå 1 - Scenarbete & Improv Comedy</SelectItem>
                      <SelectItem value="niv2">Nivå 2 - Långform & Improviserad komik</SelectItem>
                      <SelectItem value="helgworkshop">Helgworkshop (eget namn)</SelectItem>
                      <SelectItem value="houseteam">House Team & fortsättning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newCourse.courseType === 'helgworkshop' || newCourse.courseType === 'custom') && (
                  <div className="grid gap-2">
                    <Label htmlFor="customName">
                      {newCourse.courseType === 'custom' ? 'Kurstitel' : 'Namn på helgworkshop'}
                    </Label>
                    <Input
                      id="customName"
                      value={newCourse.customName}
                      onChange={(e) => setNewCourse({...newCourse, customName: e.target.value})}
                      placeholder={newCourse.courseType === 'custom' ? "T.ex. Avancerad karaktärsutveckling" : "T.ex. Comedy writing workshop"}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Undertitel</Label>
                  <Input
                    id="subtitle"
                    value={newCourse.subtitle}
                    onChange={(e) => setNewCourse({...newCourse, subtitle: e.target.value})}
                    placeholder="T.ex. För rutinerade improvisatörer och nybörjare"
                  />
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="instructor1">Kursledare 1 (valfritt)</Label>
                    <Select 
                      value={newCourse.instructor1} 
                      onValueChange={(value) => setNewCourse({...newCourse, instructor1: value === 'none' ? '' : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Välj första kursledare (valfritt)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ingen kursledare</SelectItem>
                        {performers?.map((performer: any) => (
                          <SelectItem key={performer.id} value={performer.id}>
                            {performer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instructor2">Kursledare 2 (valfritt)</Label>
                    <Select 
                      value={newCourse.instructor2} 
                      onValueChange={(value) => setNewCourse({...newCourse, instructor2: value === 'none' ? '' : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Välj andra kursledare (valfritt)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ingen kursledare</SelectItem>
                        {performers?.map((performer: any) => (
                          <SelectItem key={performer.id} value={performer.id}>
                            {performer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sessions">Antal tillfällen (0 = dölj)</Label>
                    <Input
                      id="sessions"
                      type="number"
                      min="0"
                      value={newCourse.sessions}
                      onChange={(e) => setNewCourse({...newCourse, sessions: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hoursPerSession">Timmar per tillfälle (0 = dölj)</Label>
                    <Input
                      id="hoursPerSession"
                      type="number"
                      min="0"
                      step="0.5"
                      value={newCourse.hoursPerSession}
                      onChange={(e) => setNewCourse({...newCourse, hoursPerSession: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Startdatum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newCourse.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newCourse.startDate ? format(newCourse.startDate, "PPP") : <span>Välj datum</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newCourse.startDate}
                        onSelect={(date) => setNewCourse({...newCourse, startDate: date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxParticipants">Max deltagare (0 = dölj)</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="0"
                    value={newCourse.maxParticipants}
                    onChange={(e) => setNewCourse({...newCourse, maxParticipants: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Pris (SEK)</Label>
                    <Input
                      id="price"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCourse.price === 0 ? '' : newCourse.price.toString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewCourse({...newCourse, price: parseInt(value) || 0});
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountPrice">Rabatterat pris (SEK)</Label>
                    <Input
                      id="discountPrice"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCourse.discountPrice === 0 ? '' : newCourse.discountPrice.toString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setNewCourse({...newCourse, discountPrice: parseInt(value) || 0});
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="courseInfo">Kursinformation</Label>
                  <Textarea
                    id="courseInfo"
                    value={newCourse.courseInfo}
                    onChange={(e) => setNewCourse({...newCourse, courseInfo: e.target.value})}
                    placeholder="Beskrivning av kursen, innehåll, mål, etc."
                    rows={4}
                    className="resize-y min-h-[100px] max-h-[200px] overflow-y-auto"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="practicalInfo">Praktisk information</Label>
                  <Textarea
                    id="practicalInfo"
                    value={newCourse.practicalInfo}
                    onChange={(e) => setNewCourse({...newCourse, practicalInfo: e.target.value})}
                    placeholder="Tider, plats, vad man ska ta med sig, etc."
                    rows={3}
                    className="resize-y min-h-[80px] max-h-[150px] overflow-y-auto"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                    setEditingCourse(null);
                    resetForm();
                  }}>
                    Avbryt
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={(createCourseMutation.isPending || updateCourseMutation.isPending) || !newCourse.courseType || ((newCourse.courseType === 'helgworkshop' || newCourse.courseType === 'custom') && !newCourse.customName.trim())}
                  >
                    {(createCourseMutation.isPending || updateCourseMutation.isPending) ? 
                      (isEditMode ? 'Uppdaterar...' : 'Skapar...') : 
                      (isEditMode ? 'Uppdatera kurs' : 'Skapa kurs')
                    }
                  </Button>
                 </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
          <p className="text-sm text-muted-foreground">
            Dra kurserna för att ändra ordning - kurser sorteras efter ordningsnummer på hemsidan
          </p>
        </div>
        
        {!courses || courses.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inga kurser hittades</h3>
            <p className="text-muted-foreground">
              Det finns för närvarande inga kurser i systemet.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort('sort_order')}
                      >
                        #
                        <span className="ml-2">{getSortIcon('sort_order')}</span>
                      </Button>
                    </TableHead>
                    <TableHead className="w-96">
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort('course_title')}
                      >
                        Kurstitel
                        <span className="ml-2">{getSortIcon('course_title')}</span>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => handleSort('start_date')}
                      >
                        Startdatum
                        <span className="ml-2">{getSortIcon('start_date')}</span>
                      </Button>
                    </TableHead>
                    <TableHead className="w-[180px]">Kursledare</TableHead>
                    <TableHead className="w-20">
                      Anmälda
                    </TableHead>
                    <TableHead className="w-24">Max antal</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-[280px]">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={sortedCourses.map(course => course.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedCourses.map((course) => (
                      <SortableRow
                        key={course.id}
                        course={course}
                        performers={performers}
                        showCompleted={showCompleted}
                        onEdit={handleEditCourse}
                        onToggleStatus={course => toggleStatusMutation.mutate(course)}
                        onDelete={course => deleteCourseMutation.mutate(course)}
                        onViewParticipants={handleViewParticipants}
                        onMarkCompleted={course => markCompletedMutation.mutate(course)}
                        onRestore={course => restoreCourseMutation.mutate(course)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              <SortableContext
                items={sortedCourses.map(course => course.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCourses.map((course) => (
                  <MobileCourseCard
                    key={course.id}
                    course={course}
                    performers={performers}
                    showCompleted={showCompleted}
                    onEdit={handleEditCourse}
                    onToggleStatus={course => toggleStatusMutation.mutate(course)}
                    onDelete={course => deleteCourseMutation.mutate(course)}
                    onViewParticipants={handleViewParticipants}
                    onMarkCompleted={course => markCompletedMutation.mutate(course)}
                    onRestore={course => restoreCourseMutation.mutate(course)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </CardContent>

      {/* Participants Dialog */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Deltagare - {selectedCourse?.course_title}</span>
              {participants.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportParticipants}
                  className="ml-2"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Exportera CSV
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Inga anmälningar än</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Totalt {participants.length} anmälda deltagare
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Namn</TableHead>
                        <TableHead>E-post</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((participant, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{participant.name}</TableCell>
                          <TableCell>{participant.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
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
import { Eye, Users, ArrowUpDown, ArrowUp, ArrowDown, Plus, Trash2, Power, PowerOff, Edit, CalendarIcon, GripVertical, User } from 'lucide-react';
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

type SortField = 'course_title' | 'start_date' | 'bookingCount' | 'sort_order';
type SortDirection = 'asc' | 'desc';

interface NewCourseForm {
  courseType: string;
  customName: string;
  subtitle: string;
  instructor: string;
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
function MobileCourseCard({ course, onEdit, onToggleStatus, onDelete }: {
  course: CourseWithBookings;
  onEdit: (course: CourseWithBookings) => void;
  onToggleStatus: (course: CourseWithBookings) => void;
  onDelete: (course: CourseWithBookings) => void;
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
                {course.instructor || 'Ej satt'}
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

          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(course)}
              className="flex-1 min-w-0"
            >
              <Edit className="w-4 h-4 mr-1" />
              Redigera
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onToggleStatus(course)}
              className="flex-1 min-w-0"
            >
              {course.is_active ? (
                <PowerOff className="w-4 h-4 mr-1" />
              ) : (
                <Power className="w-4 h-4 mr-1" />
              )}
              {course.is_active ? 'Inaktivera' : 'Aktivera'}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm(`Är du säker på att du vill radera "${course.course_title}"? Detta kan inte ångras.`)) {
                  onDelete(course);
                }
              }}
              className="min-w-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sortable Row Component
function SortableRow({ course, onEdit, onToggleStatus, onDelete }: {
  course: CourseWithBookings;
  onEdit: (course: CourseWithBookings) => void;
  onToggleStatus: (course: CourseWithBookings) => void;
  onDelete: (course: CourseWithBookings) => void;
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
      <TableCell>
        {course.instructor || 'Ingen kursledare'}
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(course)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Redigera
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleStatus(course)}
          >
            {course.is_active ? (
              <PowerOff className="w-4 h-4 mr-1" />
            ) : (
              <Power className="w-4 h-4 mr-1" />
            )}
            {course.is_active ? 'Inaktivera' : 'Aktivera'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm(`Är du säker på att du vill radera kursen "${course.course_title}"? Detta kan inte ångras.`)) {
                onDelete(course);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Radera
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export const CourseManagement = () => {
  const [sortField, setSortField] = useState<SortField>('sort_order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithBookings | null>(null);
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    courseType: '',
    customName: '',
    subtitle: '',
    instructor: '',
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

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (courseData: { course: CourseWithBookings; formData: NewCourseForm }) => {
      const { course, formData } = courseData;
      
      const { error } = await supabase
        .from('course_instances')
        .update({
          course_title: formData.courseType === 'helgworkshop' ? formData.customName : 
                       formData.courseType === 'niv1' ? 'Nivå 1 - Scenarbete & Improv Comedy' :
                       formData.courseType === 'niv2' ? 'Nivå 2 - Långform improviserad komik' :
                       formData.courseType === 'houseteam' ? 'House Team & fortsättning' : course.course_title,
          subtitle: formData.subtitle,
          start_date: formData.startDate?.toISOString().split('T')[0],
          max_participants: formData.maxParticipants,
          course_info: formData.courseInfo,
          practical_info: formData.practicalInfo,
          instructor: formData.instructor,
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
          instructor: courseData.instructor,
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
    queryKey: ['admin-courses'],
    queryFn: async (): Promise<CourseWithBookings[]> => {
      const { data: courseInstances, error } = await supabase
        .from('course_instances')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Get booking counts for each course
      const coursesWithBookings = await Promise.all(
        (courseInstances || []).map(async (course) => {
          try {
            const { data: bookingCount } = await supabase.rpc('get_course_booking_count', {
              table_name: course.table_name
            });
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
      instructor: '',
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
      instructor: course.instructor || 'none',
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
          <CardTitle>Kurshantering</CardTitle>
          <CardDescription>Läser in kurser...</CardDescription>
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Kurshantering</CardTitle>
            <CardDescription>
              Dra kurserna för att ändra ordning - kurser sorteras efter ordningsnummer på hemsidan
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Lägg till ny kurs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Redigera kurs' : 'Skapa ny kurs'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="courseType">Kurstyp</Label>
                  <Select 
                    value={newCourse.courseType} 
                    onValueChange={(value) => setNewCourse({...newCourse, courseType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kurstyp" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="niv1">Nivå 1 - Scenarbete & Improv Comedy</SelectItem>
                      <SelectItem value="niv2">Nivå 2 - Långform improviserad komik</SelectItem>
                      <SelectItem value="helgworkshop">Helgworkshop (eget namn)</SelectItem>
                      <SelectItem value="houseteam">House Team & fortsättning</SelectItem>
                    </SelectContent>
                  </Select>

                {newCourse.courseType === 'helgworkshop' && (
                  <div className="grid gap-2">
                    <Label htmlFor="customName">Namn på helgworkshop</Label>
                    <Input
                      id="customName"
                      value={newCourse.customName}
                      onChange={(e) => setNewCourse({...newCourse, customName: e.target.value})}
                      placeholder="T.ex. Comedy writing workshop"
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

                <div className="grid gap-2">
                  <Label htmlFor="instructor">Kursledare (valfritt)</Label>
                  <Select 
                    value={newCourse.instructor} 
                    onValueChange={(value) => setNewCourse({...newCourse, instructor: value === 'none' ? '' : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj kursledare (valfritt)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen kursledare</SelectItem>
                      {performers?.map((performer: any) => (
                        <SelectItem key={performer.id} value={performer.name}>
                          {performer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    disabled={(createCourseMutation.isPending || updateCourseMutation.isPending) || !newCourse.courseType || (newCourse.courseType === 'helgworkshop' && !newCourse.customName.trim())}
                  >
                    {(createCourseMutation.isPending || updateCourseMutation.isPending) ? 
                      (isEditMode ? 'Uppdaterar...' : 'Skapar...') : 
                      (isEditMode ? 'Uppdatera kurs' : 'Skapa kurs')
                    }
                  </Button>
                </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
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
                    <TableHead>Kursledare</TableHead>
                    <TableHead className="w-20">
                      Anmälda
                    </TableHead>
                    <TableHead>Max antal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[300px]">Åtgärder</TableHead>
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
                        onEdit={handleEditCourse}
                        onToggleStatus={course => toggleStatusMutation.mutate(course)}
                        onDelete={course => deleteCourseMutation.mutate(course)}
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
                    onEdit={handleEditCourse}
                    onToggleStatus={course => toggleStatusMutation.mutate(course)}
                    onDelete={course => deleteCourseMutation.mutate(course)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};
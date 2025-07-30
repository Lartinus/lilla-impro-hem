import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  CalendarIcon, 
  Download, 
  UserPlus, 
  UserMinus,
  Users,
  X
} from 'lucide-react';
import { RepeatablePracticalInfo } from './RepeatablePracticalInfo';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Import types and utilities
import {
  CourseWithBookings,
  NewCourseForm,
  SortField,
  SortDirection,
  CourseTemplate,
  Performer
} from '@/types/courseManagement';
import { getTemplateData } from '@/utils/courseTemplateHelpers';
import { handleSort as handleSortUtil, sortCourses, exportParticipants } from '@/utils/courseTableUtils';
import { useCourseManagementMutations } from '@/hooks/useCourseManagementMutations';
import { useCourseParticipants } from '@/hooks/useCourseParticipants';

// Import components
import { MobileCourseCard } from './course/MobileCourseCard';
import { CourseRow } from './course/CourseRow';
import { CourseCard } from './course/CourseCard';

export const CourseManagement = ({ showCompleted = false }: { showCompleted?: boolean }) => {
  const [sortField, setSortField] = useState<SortField>('sort_order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithBookings | null>(null);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithBookings | null>(null);
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    courseType: '',
    customName: '',
    subtitle: '',
    instructor1: '',
    instructor2: '',
    sessions: 1,
    hoursPerSession: 2,
    startDate: undefined,
    startTime: '18:00',
    maxParticipants: 12,
    price: 2800,
    discountPrice: 2200,
    courseInfo: '',
    practicalInfo: ''
  });

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
      return data as Performer[] || [];
    },
    retry: 1
  });

  // Fetch course templates from database
  const { data: courseTemplates = [] } = useQuery({
    queryKey: ['course-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as CourseTemplate[] || [];
    },
    retry: 1
  });

  // Fetch courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses', showCompleted],
    queryFn: async (): Promise<CourseWithBookings[]> => {
      let query = supabase
        .from('course_instances')
        .select('*')
        .order('sort_order', { ascending: true });

      if (showCompleted) {
        // For completed courses, sort by end_date DESC (newest first)
        query = query.not('completed_at', 'is', null)
                    .order('end_date', { ascending: false });
      } else {
        // For active courses, use manual sort_order
        query = query.is('completed_at', null)
                    .order('sort_order', { ascending: true });
      }

      const { data: courseInstances, error } = await query;

      if (error) throw error;

      // Get booking counts for each course
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

      return coursesWithBookings;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Sort courses (only apply manual sorting for active courses)
  const sortedCourses = courses ? (showCompleted ? courses : sortCourses(courses, sortField, sortDirection)) : [];

  // Get mutations
  const {
    moveCourseUpMutation,
    moveCourseDownMutation,
    deleteCourseMutation,
    toggleStatusMutation,
    markCompletedMutation,
    restoreCourseMutation,
    updateCourseMutation,
    createCourseMutation
  } = useCourseManagementMutations(sortedCourses, courseTemplates, performers);

  // Get participant management
  const {
    participants,
    isLoadingParticipants,
    isAddParticipantFormOpen,
    setIsAddParticipantFormOpen,
    newParticipant,
    setNewParticipant,
    handleViewParticipants,
    handleDeleteParticipant,
    handleAddParticipant,
    addParticipantMutation,
    deleteParticipantMutation
  } = useCourseParticipants();

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
      startTime: '18:00',
      maxParticipants: 12,
      price: 2800,
      discountPrice: 2200,
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
      startTime: course.start_time || '18:00',
      maxParticipants: course.max_participants || 12,
      price: course.price || 2800,
      discountPrice: course.discount_price || 2200,
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

  const handleViewParticipantsWrapper = async (course: CourseWithBookings) => {
    setSelectedCourse(course);
    setIsParticipantsDialogOpen(true);
    await handleViewParticipants(course);
  };

  const handleMoveUp = (course: CourseWithBookings) => {
    moveCourseUpMutation.mutate(course);
  };

  const handleMoveDown = (course: CourseWithBookings) => {
    moveCourseDownMutation.mutate(course);
  };

  const handleSort = (field: SortField) => {
    handleSortUtil(field, sortField, sortDirection, setSortField, setSortDirection);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const exportParticipantsWrapper = () => {
    if (!selectedCourse || participants.length === 0) return;
    exportParticipants(selectedCourse.course_title, participants);
  };

  // Update form mutations to reset and close dialog
  React.useEffect(() => {
    if (updateCourseMutation.isSuccess || createCourseMutation.isSuccess) {
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingCourse(null);
      resetForm();
    }
  }, [updateCourseMutation.isSuccess, createCourseMutation.isSuccess]);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{showCompleted ? 'Genomförda kurser' : 'Aktiva kurser'}</h2>
          <p className="text-muted-foreground mt-1">
            Hantera kursinstanser och deras deltagare
          </p>
        </div>
        {!showCompleted && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
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
                          startTime: '18:00',
                          maxParticipants: 12,
                          price: 2800,
                          discountPrice: 2200,
                          courseInfo: '',
                          practicalInfo: ''
                        }));
                      } else {
                        // Fill with template data
                        const templateData = getTemplateData(value, courseTemplates);
                        if (templateData) {
                          setNewCourse(prev => ({
                            ...prev,
                            courseType: value,
                            customName: templateData.title_template || '',
                            subtitle: templateData.subtitle || '',
                            sessions: templateData.sessions,
                            hoursPerSession: templateData.hours_per_session,
                            startTime: templateData.start_time || '18:00',
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
                      {courseTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title_template}
                        </SelectItem>
                      ))}
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
                      step="0.5"
                      min="0"
                      value={newCourse.hoursPerSession}
                      onChange={(e) => setNewCourse({...newCourse, hoursPerSession: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Startdatum (valfritt)</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !newCourse.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newCourse.startDate ? format(newCourse.startDate, "PPP") : "Välj datum"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newCourse.startDate}
                            onSelect={(date) => setNewCourse({...newCourse, startDate: date})}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {newCourse.startDate && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setNewCourse({...newCourse, startDate: undefined})}
                          title="Rensa startdatum"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Starttid (valfritt)</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newCourse.startTime}
                      onChange={(e) => setNewCourse({...newCourse, startTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Max antal deltagare</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      value={newCourse.maxParticipants}
                      onChange={(e) => setNewCourse({...newCourse, maxParticipants: parseInt(e.target.value) || 12})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Ordinarie pris (kr)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountPrice">Rabatterat pris (kr)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      min="0"
                      value={newCourse.discountPrice}
                      onChange={(e) => setNewCourse({...newCourse, discountPrice: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Underrubrik (valfritt)</Label>
                  <Input
                    id="subtitle"
                    value={newCourse.subtitle}
                    onChange={(e) => setNewCourse({...newCourse, subtitle: e.target.value})}
                    placeholder="Kort beskrivning av kursen"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="courseInfo">Kursinformation</Label>
                  <Textarea
                    id="courseInfo"
                    value={newCourse.courseInfo}
                    onChange={(e) => setNewCourse({...newCourse, courseInfo: e.target.value})}
                    placeholder="Detaljerad beskrivning av kursen..."
                    rows={4}
                  />
                </div>

                <RepeatablePracticalInfo
                  value={newCourse.practicalInfo}
                  baseInfo={(() => {
                    const baseItems = [];
                    if (newCourse.sessions && newCourse.sessions > 0) {
                      baseItems.push(`Antal tillfällen: ${newCourse.sessions}`);
                    }
                    if (newCourse.hoursPerSession && newCourse.hoursPerSession > 0) {
                      baseItems.push(`Timmar per tillfälle: ${newCourse.hoursPerSession}`);
                    }
                    if (newCourse.maxParticipants) {
                      baseItems.push(`Max antal deltagare: ${newCourse.maxParticipants}`);
                    }
                    if (newCourse.price && newCourse.price > 0) {
                      baseItems.push(`Ordinarie pris: ${newCourse.price} kr`);
                    }
                    if (newCourse.discountPrice && newCourse.discountPrice > 0) {
                      baseItems.push(`Rabatterat pris: ${newCourse.discountPrice} kr (pensionär, student eller omtag)`);
                    }
                    return baseItems.join('\n');
                  })()}
                  onChange={(value) => setNewCourse({...newCourse, practicalInfo: value})}
                />

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
      
      {/* Info box - compact (only for active courses) */}
      {!showCompleted && (
        <div className="px-3 py-2 bg-muted/50 rounded text-xs text-muted-foreground">
          💡 Använd upp/ner-pilarna för att ändra ordning på hemsidan
        </div>
      )}
        
      {!courses || courses.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Inga kurser hittades</h3>
          <p className="text-muted-foreground">
            Det finns för närvarande inga kurser i systemet.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Card View */}
          <div className="hidden md:block space-y-3">
            {sortedCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                performers={performers}
                showCompleted={showCompleted}
                onEdit={handleEditCourse}
                onToggleStatus={course => toggleStatusMutation.mutate(course)}
                onDelete={course => deleteCourseMutation.mutate(course)}
                onViewParticipants={handleViewParticipantsWrapper}
                onMarkCompleted={course => markCompletedMutation.mutate(course)}
                onRestore={course => restoreCourseMutation.mutate(course)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                canMoveUp={index > 0}
                canMoveDown={index < sortedCourses.length - 1}
                sortedCourses={sortedCourses}
              />
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {sortedCourses.map((course, index) => (
              <MobileCourseCard
                key={course.id}
                course={course}
                performers={performers}
                showCompleted={showCompleted}
                onEdit={handleEditCourse}
                onToggleStatus={course => toggleStatusMutation.mutate(course)}
                onDelete={course => deleteCourseMutation.mutate(course)}
                onViewParticipants={handleViewParticipantsWrapper}
                onMarkCompleted={course => markCompletedMutation.mutate(course)}
                onRestore={course => restoreCourseMutation.mutate(course)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                canMoveUp={index > 0}
                canMoveDown={index < sortedCourses.length - 1}
              />
            ))}
          </div>
        </>
      )}

      {/* Participants Dialog */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Deltagare - {selectedCourse?.course_title}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddParticipantFormOpen(!isAddParticipantFormOpen)}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Lägg till deltagare
                </Button>
                {participants.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportParticipantsWrapper}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportera CSV
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Add Participant Form */}
            {isAddParticipantFormOpen && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Lägg till ny deltagare</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="participantName">Namn *</Label>
                      <Input
                        id="participantName"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                        placeholder="Förnamn Efternamn"
                      />
                    </div>
                    <div>
                      <Label htmlFor="participantEmail">E-post *</Label>
                      <Input
                        id="participantEmail"
                        type="email"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                        placeholder="namn@exempel.se"
                      />
                    </div>
                    <div>
                      <Label htmlFor="participantPhone">Telefon</Label>
                      <Input
                        id="participantPhone"
                        value={newParticipant.phone}
                        onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
                        placeholder="070-123 45 67"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddParticipantFormOpen(false);
                        setNewParticipant({ name: '', email: '', phone: '' });
                      }}
                    >
                      Avbryt
                    </Button>
                    <Button 
                      onClick={() => selectedCourse && handleAddParticipant(selectedCourse.table_name)}
                      disabled={addParticipantMutation.isPending || !newParticipant.name.trim() || !newParticipant.email.trim()}
                    >
                      {addParticipantMutation.isPending ? 'Lägger till...' : 'Lägg till'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants List */}
            <div className="flex-1 overflow-hidden">
              {isLoadingParticipants ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Laddar deltagare...</p>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Inga anmälningar än</p>
                </div>
              ) : (
                <div className="space-y-4 h-full overflow-hidden flex flex-col">
                  <div className="text-sm text-muted-foreground">
                    Totalt {participants.length} anmälda deltagare
                  </div>
                  <div className="border rounded-lg flex-1 overflow-hidden">
                    <div className="overflow-auto h-full">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead>Namn</TableHead>
                            <TableHead>E-post</TableHead>
                            <TableHead className="w-20">Åtgärder</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {participants.map((participant, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{participant.name}</TableCell>
                              <TableCell>{participant.email}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => selectedCourse && handleDeleteParticipant(participant.email, selectedCourse.table_name)}
                                  disabled={deleteParticipantMutation.isPending}
                                  className="p-2"
                                >
                                  <UserMinus className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
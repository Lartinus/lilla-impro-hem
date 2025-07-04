import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, ArrowUpDown, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
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
}

interface CourseWithBookings extends CourseInstance {
  bookingCount: number;
}

type SortField = 'course_title' | 'start_date' | 'bookingCount' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface NewCourseForm {
  courseType: string;
  customName: string;
  instructor: string;
  sessions: number;
  hoursPerSession: number;
  startDate: Date | undefined;
  maxParticipants: number;
  price: number;
  discountPrice: number;
  additionalInfo: string;
}

export const CourseManagement = () => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    courseType: '',
    customName: '',
    instructor: '',
    sessions: 1,
    hoursPerSession: 2,
    startDate: undefined,
    maxParticipants: 12,
    price: 0,
    discountPrice: 0,
    additionalInfo: ''
  });
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async (): Promise<CourseWithBookings[]> => {
      const { data: courseInstances, error } = await supabase
        .from('course_instances')
        .select('*')
        .order('created_at', { ascending: false });

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

      // Filter out helgworkshops & specialkurser
      return coursesWithBookings.filter(course => 
        !course.course_title.toLowerCase().includes('helgworkshop') &&
        !course.course_title.toLowerCase().includes('specialkurs')
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

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
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
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
              Översikt över alla kurser och antal anmälda deltagare
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
                <DialogTitle>Skapa ny kurs</DialogTitle>
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
                </div>

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
                  <Label htmlFor="instructor">Kursledare</Label>
                  <Input
                    id="instructor"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                    placeholder="Namn på kursledaren"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sessions">Antal tillfällen</Label>
                    <Input
                      id="sessions"
                      type="number"
                      min="1"
                      value={newCourse.sessions}
                      onChange={(e) => setNewCourse({...newCourse, sessions: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hoursPerSession">Timmar per tillfälle</Label>
                    <Input
                      id="hoursPerSession"
                      type="number"
                      min="1"
                      step="0.5"
                      value={newCourse.hoursPerSession}
                      onChange={(e) => setNewCourse({...newCourse, hoursPerSession: parseFloat(e.target.value) || 2})}
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
                  <Label htmlFor="maxParticipants">Max deltagare</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    value={newCourse.maxParticipants}
                    onChange={(e) => setNewCourse({...newCourse, maxParticipants: parseInt(e.target.value) || 12})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Pris (SEK)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountPrice">Rabatterat pris (SEK)</Label>
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
                  <Label htmlFor="additionalInfo">Ytterligare information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={newCourse.additionalInfo}
                    onChange={(e) => setNewCourse({...newCourse, additionalInfo: e.target.value})}
                    placeholder="Ev. extra information om kursen"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button onClick={() => {
                    // TODO: Implement course creation
                    toast({
                      title: "Kursskapande",
                      description: "Funktionen implementeras snart",
                    });
                  }}>
                    Skapa kurs
                  </Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
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
                <TableHead>Slutdatum</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort('bookingCount')}
                  >
                    Anmälda
                    <span className="ml-2">{getSortIcon('bookingCount')}</span>
                  </Button>
                </TableHead>
                <TableHead>Max antal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.course_title}</TableCell>
                  <TableCell>
                    {course.start_date ? new Date(course.start_date).toLocaleDateString('sv-SE') : '-'}
                  </TableCell>
                  <TableCell>
                    {course.end_date ? new Date(course.end_date).toLocaleDateString('sv-SE') : '-'}
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
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Visa detaljer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
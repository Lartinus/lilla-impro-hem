import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

export const CourseManagement = () => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
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

      return coursesWithBookings;
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
        <CardTitle>Kurshantering</CardTitle>
        <CardDescription>
          Översikt över alla kurser och antal anmälda deltagare
        </CardDescription>
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
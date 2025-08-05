import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { getCurrentCourseBookings } from '@/hooks/useCourseInstances';

interface Course {
  id: string;
  course_title: string;
  start_date: string | null;
  table_name: string;
  max_participants: number | null;
  current_participants: number;
}

export const AdminCoursesOverview = () => {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses-overview'],
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
    queryFn: async (): Promise<Course[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get upcoming active courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('course_instances')
        .select('id, course_title, start_date, table_name, max_participants')
        .eq('is_active', true)
        .gte('start_date', today)
        .is('completed_at', null)
        .order('start_date', { ascending: true })
        .limit(3);

      if (coursesError) throw coursesError;

      // Get current participants for each course
      const coursesWithParticipants = await Promise.all(
        (coursesData || []).map(async (course) => {
          let currentParticipants = 0;
          try {
            if (course.table_name && !course.table_name.includes('_l_ngform_')) {
              currentParticipants = await getCurrentCourseBookings(course.table_name);
            }
          } catch (error) {
            console.warn(`Could not get booking count for ${course.table_name}:`, error);
          }

          return {
            ...course,
            current_participants: currentParticipants
          };
        })
      );

      // Filter out courses with problematic names
      return coursesWithParticipants.filter(course => {
        const title = course.course_title.toLowerCase();
        return !title.includes('helgworkshop') && 
               !title.includes('specialkurs') && 
               !title.includes('helgworkshops') &&
               !title.includes('specialkurser');
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="w-4 h-4" />
            Kurser
          </CardTitle>
          <CardDescription>Nästkommande kurser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="w-4 h-4" />
            Kurser
          </CardTitle>
          <CardDescription>Nästkommande kurser</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Inga kommande kurser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="w-4 h-4" />
          Kurser
        </CardTitle>
        <CardDescription>Nästkommande kurser</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => {
            const maxParticipants = course.max_participants || 12;
            const bookingPercentage = Math.round((course.current_participants / maxParticipants) * 100);
            
            return (
              <div key={course.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{course.course_title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {course.start_date 
                          ? format(new Date(course.start_date), 'dd MMM', { locale: sv })
                          : 'Datum ej satt'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {maxParticipants} platser
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">{course.current_participants}/{maxParticipants}</div>
                    <div className="text-muted-foreground">{bookingPercentage}%</div>
                  </div>
                </div>
                <Progress value={bookingPercentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
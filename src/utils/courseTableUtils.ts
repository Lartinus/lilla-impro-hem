import { supabase } from '@/integrations/supabase/client';
import { CourseWithBookings, SortField, SortDirection } from '@/types/courseManagement';

export const handleSort = (
  field: SortField,
  currentSortField: SortField,
  currentSortDirection: SortDirection,
  setSortField: (field: SortField) => void,
  setSortDirection: (direction: SortDirection) => void
) => {
  if (currentSortField === field) {
    setSortDirection(currentSortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortField(field);
    setSortDirection('asc');
  }
};

export const sortCourses = (
  courses: CourseWithBookings[],
  sortField: SortField,
  sortDirection: SortDirection
): CourseWithBookings[] => {
  return [...courses].sort((a, b) => {
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
  });
};

export const exportParticipants = (courseName: string, participants: Array<{ name: string; email: string }>) => {
  if (participants.length === 0) return;
  
  const csvContent = [
    ['Namn', 'E-post'].join(','),
    ...participants.map(p => [p.name, p.email].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_deltagare.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const ensureCourseTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('table_exists', {
      table_name: tableName
    });

    if (error) {
      console.error('Error checking table existence:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in ensureCourseTableExists:', error);
    return false;
  }
};
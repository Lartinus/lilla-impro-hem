// Course Management Types
export interface CourseInstance {
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
  start_time?: string | null;
  completed_at?: string | null;
}

export interface CourseWithBookings extends CourseInstance {
  bookingCount: number;
}

export interface CourseParticipant {
  email: string;
  name: string;
  phone?: string;
}

export type SortField = 'course_title' | 'start_date' | 'bookingCount' | 'sort_order';
export type SortDirection = 'asc' | 'desc';

export interface NewCourseForm {
  courseType: string;
  customName: string;
  subtitle: string;
  instructor1: string;
  instructor2: string;
  sessions: number;
  hoursPerSession: number;
  startDate: Date | undefined;
  startTime: string;
  maxParticipants: number;
  price: number;
  discountPrice: number;
  courseInfo: string;
  practicalInfo: string;
}

export interface CourseTemplate {
  id: string;
  name: string;
  title_template: string;
  subtitle?: string | null;
  course_info?: string | null;
  practical_info?: string | null;
  price: number;
  discount_price?: number | null;
  max_participants: number;
  sessions: number;
  hours_per_session: number;
  start_time?: string | null;
  is_active: boolean;
}

export interface Performer {
  id: string;
  name: string;
  is_active: boolean;
}
export interface ConfirmationEmailRequest {
  name: string;
  email: string;
  courseTitle: string;
  isAvailable: boolean;
  courseStartDate?: string;
  courseStartTime?: string;
  courseTableName?: string;
}
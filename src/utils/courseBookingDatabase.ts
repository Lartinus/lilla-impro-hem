import { supabase } from '@/integrations/supabase/client';
import type { CourseBookingData } from '@/schemas/courseBookingSchemas';

export const checkDuplicateBooking = async (
  email: string,
  courseTitle: string,
  tableName: string
): Promise<boolean> => {
  try {
    if (tableName === 'course_bookings') {
      // For the general course_bookings table, check differently
      const { data: existingBookings, error: duplicateCheckError } = await supabase
        .from('course_bookings')
        .select('id')
        .eq('course_title', courseTitle)
        .eq('email', email.toLowerCase())
        .limit(1);
        
      if (duplicateCheckError) {
        console.error('⚠️ Error checking for duplicate booking:', duplicateCheckError);
        return false; // Continue with booking attempt - don't block on this check
      }
      
      return existingBookings && existingBookings.length > 0;
    } else {
      // For specific course tables, use the RPC function
      const { data: isDuplicate, error: duplicateCheckError } = await supabase.rpc('check_duplicate_course_booking', {
        table_name: tableName,
        email_address: email.toLowerCase()
      });
      
      if (duplicateCheckError) {
        console.error('⚠️ Error checking for duplicate booking:', duplicateCheckError);
        return false; // Continue with booking attempt - don't block on this check
      }
      
      return !!isDuplicate;
    }
  } catch (duplicateError) {
    console.error('⚠️ Duplicate check failed:', duplicateError);
    return false; // Continue anyway - better to allow a potential duplicate than block a valid booking
  }
};

export const insertBooking = async (
  formData: CourseBookingData,
  courseTitle: string,
  tableName: string
): Promise<void> => {
  console.log('💾 Attempting to insert booking...');
  
  if (tableName === 'course_bookings') {
    // Use direct insert to course_bookings table for courses without specific tables
    const { error: insertError } = await supabase
      .from('course_bookings')
      .insert({
        course_title: courseTitle,
        name: formData.name,
        phone: formData.phone,
        email: formData.email.toLowerCase(),
        address: 'address' in formData ? formData.address || null : null,
        postal_code: 'postalCode' in formData ? formData.postalCode || null : null,
        city: 'city' in formData ? formData.city || null : null,
        message: 'message' in formData ? formData.message || null : null
      });
      
    if (insertError) {
      console.error('❌ Database error during booking (course_bookings):', insertError);
      throw insertError;
    }
  } else {
    // Use RPC function for courses with specific tables
    const { error: insertError } = await supabase.rpc('insert_course_booking', {
      table_name: tableName,
      booking_name: formData.name,
      booking_phone: formData.phone,
      booking_email: formData.email,
      booking_address: 'address' in formData ? formData.address || '' : '',
      booking_postal_code: 'postalCode' in formData ? formData.postalCode || '' : '',
      booking_city: 'city' in formData ? formData.city || '' : '',
      booking_message: 'message' in formData ? formData.message || '' : ''
    });
    
    if (insertError) {
      console.error('❌ Database error during booking (RPC):', insertError);
      throw insertError;
    }
  }
  
  console.log('✅ Course booking submitted successfully to table:', tableName);
};
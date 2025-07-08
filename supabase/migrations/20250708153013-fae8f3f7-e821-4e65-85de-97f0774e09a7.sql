-- Grant proper permissions to the function
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_course_booking_count(text) TO service_role;
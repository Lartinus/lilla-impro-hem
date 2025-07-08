-- Fix the search_path security issue for get_course_booking_count function
CREATE OR REPLACE FUNCTION public.get_course_booking_count(table_name text)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
        ) THEN (
            -- Use a direct query without dynamic SQL to avoid permission issues
            CASE table_name
                WHEN 'course_niv_1_scenarbete_improv_comedy_1749454350362' THEN 
                    (SELECT COUNT(*)::integer FROM public.course_niv_1_scenarbete_improv_comedy_1749454350362)
                WHEN 'course_niv_2_l_ngform_improviserad_komik_1749806847850' THEN 
                    (SELECT COUNT(*)::integer FROM public.course_niv_2_l_ngform_improviserad_komik_1749806847850)
                ELSE 0
            END
        )
        ELSE 0
    END;
$function$;
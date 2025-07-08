
-- Update the get_course_participants function to handle RLS properly
CREATE OR REPLACE FUNCTION public.get_course_participants(table_name text)
RETURNS TABLE(email text, name text)
LANGUAGE sql
SECURITY DEFINER
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
                    (SELECT ROW(p.email, p.name)::RECORD 
                     FROM course_niv_1_scenarbete_improv_comedy_1749454350362 p)
                WHEN 'course_niv_2_l_ngform_improviserad_komik_1749806847850' THEN 
                    (SELECT ROW(p.email, p.name)::RECORD 
                     FROM course_niv_2_l_ngform_improviserad_komik_1749806847850 p)
                ELSE ROW(NULL, NULL)::RECORD
            END
        )
        ELSE ROW(NULL, NULL)::RECORD
    END;
$function$;

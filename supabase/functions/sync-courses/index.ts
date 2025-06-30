
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const syncCourses = async () => {
  try {
    console.log('Starting course sync...');
    
    if (!strapiToken) {
      throw new Error('STRAPI_API_TOKEN not configured');
    }

    // Fetch courses from Strapi
    const strapiResponse = await fetch(`${strapiUrl}/api/courses?fields[0]=titel`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!strapiResponse.ok) {
      throw new Error(`Failed to fetch courses from Strapi: ${strapiResponse.status}`);
    }

    const strapiData = await strapiResponse.json();
    const courses = strapiData.data || [];
    
    console.log(`Found ${courses.length} courses in Strapi`);

    for (const course of courses) {
      const courseTitle = course.attributes?.titel || course.titel;
      if (!courseTitle) continue;

      console.log(`Processing course: ${courseTitle}`);

      // Check if course instance already exists
      const { data: existingInstances } = await supabase
        .from('course_instances')
        .select('*')
        .eq('course_title', courseTitle)
        .eq('is_active', true);

      if (existingInstances && existingInstances.length > 0) {
        console.log(`Course instance already exists for: ${courseTitle}`);
        continue;
      }

      // Generate table name
      const timestamp = Date.now();
      const sanitizedTitle = courseTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
      
      const tableName = `course_${sanitizedTitle}_${timestamp}`;

      // Create course instance
      const { data: instanceData, error: instanceError } = await supabase
        .from('course_instances')
        .insert({
          course_title: courseTitle,
          table_name: tableName,
          max_participants: 12,
          is_active: true
        })
        .select()
        .single();

      if (instanceError) {
        console.error('Error creating course instance:', instanceError);
        continue;
      }

      // Create the booking table using RPC function
      const { error: tableError } = await supabase.rpc('create_course_booking_table', {
        table_name: tableName
      });

      if (tableError) {
        console.error('Error creating course booking table:', tableError);
        // Clean up the instance if table creation failed
        await supabase
          .from('course_instances')
          .delete()
          .eq('id', instanceData.id);
        continue;
      }

      console.log(`Successfully created course table: ${tableName}`);
    }

    return { success: true, syncedCourses: courses.length };
  } catch (error) {
    console.error('Error syncing courses:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await syncCourses();
    
    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      },
    });
  } catch (error) {
    console.error('Sync courses function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to sync courses',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

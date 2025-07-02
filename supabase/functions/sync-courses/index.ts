
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
    if (!strapiToken) {
      console.error('STRAPI_API_TOKEN not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'STRAPI_API_TOKEN not configured',
        message: 'Course sync failed - missing API token'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting course sync...');

    // Fetch courses from Strapi with error handling
    let strapiResponse;
    try {
      strapiResponse = await fetch('https://lit-backend-b3a2f4db3c92.herokuapp.com/api/courses?populate=*', {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError) {
      console.error('Failed to fetch from Strapi:', fetchError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to connect to Strapi',
        message: 'Course sync failed - connection error',
        details: fetchError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!strapiResponse.ok) {
      console.error(`Strapi API error: ${strapiResponse.status} ${strapiResponse.statusText}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Strapi API error: ${strapiResponse.status}`,
        message: 'Course sync failed - API error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const strapiData = await strapiResponse.json();
    const courses = strapiData.data || [];

    console.log(`Fetched ${courses.length} courses from Strapi`);

    // Process each course and ensure course instances exist
    let processedCount = 0;
    let errorCount = 0;

    for (const course of courses) {
      try {
        const courseTitle = course.attributes?.title || course.attributes?.titel;
        if (!courseTitle) {
          console.warn('Course missing title, skipping:', course.id);
          continue;
        }

        // Check if we already have an active instance for this course
        const { data: existingInstances, error: fetchInstanceError } = await supabaseClient
          .from('course_instances')
          .select('*')
          .eq('course_title', courseTitle)
          .eq('is_active', true)
          .limit(1);

        if (fetchInstanceError) {
          console.error(`Error fetching instances for "${courseTitle}":`, fetchInstanceError);
          errorCount++;
          continue;
        }

        if (existingInstances && existingInstances.length > 0) {
          console.log(`Course "${courseTitle}" already has active instance, skipping`);
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
        const { error: instanceError } = await supabaseClient
          .from('course_instances')
          .insert({
            course_title: courseTitle,
            table_name: tableName,
            max_participants: 12,
            is_active: true
          });

        if (instanceError) {
          console.error(`Error creating instance for "${courseTitle}":`, instanceError);
          errorCount++;
          continue;
        }

        // Create booking table using the fixed function
        const { error: tableError } = await supabaseClient.rpc('create_course_booking_table', {
          table_name: tableName
        });

        if (tableError) {
          console.error(`Error creating table for "${courseTitle}":`, tableError);
          errorCount++;
          continue;
        }

        processedCount++;
        console.log(`Successfully processed course: "${courseTitle}"`);

      } catch (error) {
        console.error(`Error processing course ${course.id}:`, error);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Course sync completed: ${processedCount} courses processed, ${errorCount} errors`,
      processedCount,
      errorCount,
      totalCourses: courses.length
    };

    console.log('Course sync result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Course sync error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Course sync failed',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

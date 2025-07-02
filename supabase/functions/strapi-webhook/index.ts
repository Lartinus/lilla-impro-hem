
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

    // Verify webhook is POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON body',
        message: 'Webhook body must be valid JSON'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Handle different Strapi webhook events
    const { event, model, entry } = body;

    // Only process course-related events
    if (model !== 'course') {
      console.log('Ignoring non-course webhook for model:', model);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Webhook received but not for course model (received: ${model})` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const courseTitle = entry?.titel || entry?.title;
    if (!courseTitle) {
      console.error('Course title missing from webhook payload:', entry);
      return new Response(JSON.stringify({ 
        error: 'Course title missing',
        message: 'Course title (titel or title) is required in webhook payload',
        received: body 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${event} event for course: "${courseTitle}"`);

    // Handle course creation/update
    if (event === 'entry.create' || event === 'entry.update') {
      try {
        // Check if we already have an active instance for this course
        const { data: existingInstances, error: fetchError } = await supabaseClient
          .from('course_instances')
          .select('*')
          .eq('course_title', courseTitle)
          .eq('is_active', true)
          .limit(1);

        if (fetchError) {
          console.error(`Error checking existing instances for "${courseTitle}":`, fetchError);
          return new Response(JSON.stringify({ 
            error: 'Database query failed',
            details: fetchError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (existingInstances && existingInstances.length > 0) {
          console.log(`Course "${courseTitle}" already has active instance`);
          return new Response(JSON.stringify({
            success: true,
            message: `Course "${courseTitle}" already has active booking table`,
            existingInstance: existingInstances[0]
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
        const { data: instanceData, error: instanceError } = await supabaseClient
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
          console.error(`Error creating instance for "${courseTitle}":`, instanceError);
          return new Response(JSON.stringify({ 
            error: 'Failed to create course instance',
            details: instanceError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Create booking table using the fixed function
        const { error: tableError } = await supabaseClient.rpc('create_course_booking_table', {
          table_name: tableName
        });

        if (tableError) {
          console.error(`Error creating table for "${courseTitle}":`, tableError);
          
          // Try to clean up the instance we just created
          try {
            await supabaseClient
              .from('course_instances')
              .delete()
              .eq('id', instanceData.id);
          } catch (cleanupError) {
            console.error('Failed to clean up course instance:', cleanupError);
          }
          
          return new Response(JSON.stringify({ 
            error: 'Failed to create booking table',
            details: tableError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Successfully created booking system for course: "${courseTitle}"`);

        return new Response(JSON.stringify({
          success: true,
          message: `Booking system created for course: "${courseTitle}"`,
          courseInstance: instanceData,
          tableName: tableName
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (processingError) {
        console.error(`Unexpected error processing course "${courseTitle}":`, processingError);
        return new Response(JSON.stringify({ 
          error: 'Unexpected processing error',
          details: processingError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle course deletion
    if (event === 'entry.delete') {
      try {
        // Deactivate course instances instead of deleting them (to preserve booking data)
        const { error: deactivateError } = await supabaseClient
          .from('course_instances')
          .update({ is_active: false })
          .eq('course_title', courseTitle);

        if (deactivateError) {
          console.error(`Error deactivating course "${courseTitle}":`, deactivateError);
          return new Response(JSON.stringify({ 
            error: 'Failed to deactivate course',
            details: deactivateError.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        console.log(`Successfully deactivated course: "${courseTitle}"`);

        return new Response(JSON.stringify({
          success: true,
          message: `Course "${courseTitle}" deactivated (booking data preserved)`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (deletionError) {
        console.error(`Unexpected error deleting course "${courseTitle}":`, deletionError);
        return new Response(JSON.stringify({ 
          error: 'Unexpected deletion error',
          details: deletionError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Unknown event
    console.log(`Unknown webhook event: ${event}`);
    return new Response(JSON.stringify({
      success: true,
      message: `Webhook received but event "${event}" not handled`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Webhook processing failed',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

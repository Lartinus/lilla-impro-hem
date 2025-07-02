
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating missing course table...');

    // Create the missing table for "Nivå 1: Scenarbete Improv Comedy"
    const { error: tableError } = await supabaseClient.rpc('create_course_booking_table', {
      table_name: 'course_niv_1_scenarbete_improv_comedy_1749454350362'
    });

    if (tableError) {
      console.error('Error creating missing course booking table:', tableError);
      return new Response(JSON.stringify({ 
        error: 'Failed to create missing table',
        details: tableError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully created missing table: course_niv_1_scenarbete_improv_comedy_1749454350362');

    return new Response(JSON.stringify({
      success: true,
      message: 'Missing course table created successfully',
      tableName: 'course_niv_1_scenarbete_improv_comedy_1749454350362'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fix-missing-course-table function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Failed to create missing course table'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

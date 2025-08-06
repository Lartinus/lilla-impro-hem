import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { participant_email, participant_name, course_title, course_table_name } = await req.json()

    if (!participant_email || !participant_name || !course_title) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: participant_email, participant_name, course_title' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get course instance details if course_table_name is provided
    let courseStartDate = ''
    let courseStartTime = ''
    
    if (course_table_name) {
      const { data: courseInstance } = await supabase
        .from('course_instances')
        .select('start_date, start_time')
        .eq('table_name', course_table_name)
        .single()
      
      if (courseInstance) {
        courseStartDate = courseInstance.start_date || ''
        courseStartTime = courseInstance.start_time || ''
      }
    }

    // Call the send-course-confirmation function
    const { data, error } = await supabase.functions.invoke('send-course-confirmation', {
      body: {
        name: participant_name,
        email: participant_email,
        courseTitle: course_title,
        startDate: courseStartDate,
        startTime: courseStartTime
      }
    })

    if (error) {
      console.error('Error sending confirmation email:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Kunde inte skicka bekräftelse: ${error.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully resent course confirmation email to:', participant_email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Kursbekräftelse skickad' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in resend-course-confirmation:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internt serverfel' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
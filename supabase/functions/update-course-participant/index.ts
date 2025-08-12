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
    
    // Require admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No authorization header' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    , { global: { headers: { Authorization: authHeader } } });
    const { data: isAdmin, error: roleError } = await userSupabase.rpc('current_user_is_admin');
    if (roleError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Admin access required' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { table_name, old_email, new_name, new_email, new_phone } = await req.json()

    console.log('🔧 update-course-participant called with:', { table_name, old_email, new_name, new_email, new_phone })

    if (!table_name || !old_email || !new_name || !new_email || !new_phone) {
      console.error('❌ Missing required parameters:', { table_name, old_email, new_name, new_email, new_phone })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: table_name, old_email, new_name, new_email, new_phone' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(new_email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ogiltig e-postadress' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate phone format (6-20 characters, only numbers, +, -, (), and spaces)
    const phoneRegex = /^[+0-9\s\-()]+$/
    if (new_phone.length < 6 || new_phone.length > 20 || !phoneRegex.test(new_phone)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ogiltigt telefonnummer. Måste vara 6-20 tecken och får endast innehålla siffror, +, -, (), och mellanslag.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔍 Checking if table exists:', table_name)
    
    // Check if table exists by trying to query it directly
    const { data: tableCheck, error: tableError } = await supabase
      .from(table_name)
      .select('id')
      .limit(1)

    console.log('📊 Table check result:', { tableCheck, tableError })

    if (tableError && tableError.code === 'PGRST116') {
      console.error('❌ Table does not exist:', table_name, tableError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Kurstabell finns inte' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if old participant exists
    const { data: existingParticipant, error: checkError } = await supabase
      .from(table_name)
      .select('*')
      .eq('email', old_email)
      .single()

    if (checkError || !existingParticipant) {
      console.error('Participant not found:', checkError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Deltagaren finns inte i kursen' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If email is changing, check for duplicates
    if (old_email.toLowerCase() !== new_email.toLowerCase()) {
      const { data: duplicateCheck } = await supabase
        .from(table_name)
        .select('email')
        .eq('email', new_email.toLowerCase())
        .single()

      if (duplicateCheck) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'En deltagare med denna e-postadress finns redan i kursen' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Update participant
    const { data, error } = await supabase
      .from(table_name)
      .update({
        name: new_name.trim(),
        email: new_email.toLowerCase().trim(),
        phone: new_phone.trim()
      })
      .eq('email', old_email)
      .select()

    if (error) {
      console.error('Error updating participant:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Databasfel: ${error.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully updated participant:', { old_email, new_email, new_name, table_name })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data?.[0] || null 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-course-participant:', error)
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
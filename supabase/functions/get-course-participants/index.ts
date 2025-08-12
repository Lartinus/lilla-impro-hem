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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Create a client that uses the caller's JWT so RLS applies
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { table_name } = await req.json()

    if (!table_name) {
      return new Response(
        JSON.stringify({ error: 'Missing table_name parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Authorize: only admins/superadmins may read participant data
    const { data: isAdmin, error: roleError } = await supabase.rpc('current_user_is_admin')
    if (roleError) {
      console.error('Role check failed:', roleError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized', participants: [] }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try to get participants directly - if table doesn't exist, it will throw an error
    try {
      // First try with the new columns (resend tracking)
      let { data, error } = await supabase
        .from(table_name)
        .select('email, name, phone, created_at, resend_count, last_resent_at')
        .order('created_at', { ascending: true })
      
      // If that fails (columns don't exist), try without the new columns
      if (error && error.message.includes('column')) {
        console.log('Resend tracking columns not found, trying without them')
        const fallbackResult = await supabase
          .from(table_name)
          .select('email, name, phone, created_at')
          .order('created_at', { ascending: true })
        
        data = fallbackResult.data
        error = fallbackResult.error
      }

      if (error) {
        console.error('Error getting participants:', error)
        return new Response(
          JSON.stringify({ participants: [] }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ participants: data || [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (tableError) {
      console.log('Table probably does not exist:', table_name)
      return new Response(
        JSON.stringify({ participants: [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in get-course-participants:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', participants: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
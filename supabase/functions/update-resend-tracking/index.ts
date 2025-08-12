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

    const { table_name, participant_email } = await req.json()

    if (!table_name || !participant_email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: table_name, participant_email' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if table exists by trying to query it directly
    const { data: tableCheck, error: tableError } = await supabase
      .from(table_name)
      .select('id')
      .limit(1)

    if (tableError && tableError.code === 'PGRST116') {
      console.error('Table does not exist:', table_name, tableError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Kurstabellen existerar inte' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update resend tracking
    const { data, error } = await supabase
      .from(table_name)
      .update({
        resend_count: supabase.rpc('COALESCE', { value: 'resend_count', fallback: 0 }) + 1,
        last_resent_at: new Date().toISOString()
      })
      .eq('email', participant_email)
      .select('resend_count, last_resent_at')

    if (error) {
      // Try a more basic approach if the RPC doesn't work
      const { data: currentData } = await supabase
        .from(table_name)
        .select('resend_count')
        .eq('email', participant_email)
        .single()

      const currentCount = currentData?.resend_count || 0

      const { data: updateData, error: updateError } = await supabase
        .from(table_name)
        .update({
          resend_count: currentCount + 1,
          last_resent_at: new Date().toISOString()
        })
        .eq('email', participant_email)
        .select('resend_count, last_resent_at')

      if (updateError) {
        console.error('Error updating resend tracking:', updateError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Kunde inte uppdatera spårning: ${updateError.message}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          resend_count: updateData?.[0]?.resend_count || (currentCount + 1),
          last_resent_at: updateData?.[0]?.last_resent_at
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully updated resend tracking for:', participant_email)

    return new Response(
      JSON.stringify({ 
        success: true, 
        resend_count: data?.[0]?.resend_count || 1,
        last_resent_at: data?.[0]?.last_resent_at
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-resend-tracking:', error)
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
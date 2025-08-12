import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { table_name, participant_name, participant_email, participant_phone, participant_address, participant_postal_code, participant_city, participant_message } = await req.json();

    console.log('Adding participant with data:', {
      table_name,
      participant_name,
      participant_email,
      participant_phone: participant_phone || '',
      participant_address: participant_address || '',
      participant_postal_code: participant_postal_code || '',
      participant_city: participant_city || '',
      participant_message: participant_message || ''
    });

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the Authorization header from the request to verify the calling user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a client with the user's token to verify they're admin (use anon key + caller JWT)
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify current user is admin/superadmin via RPC (respects RLS)
    const { data: isAdmin, error: roleError } = await userSupabase.rpc('current_user_is_admin');
    if (roleError) {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Now use the service role client to insert the participant (bypassing RLS)
    const { data, error } = await supabase
      .from(table_name)
      .insert({
        name: participant_name,
        email: participant_email.toLowerCase(),
        phone: participant_phone || '',
        address: participant_address || '',
        postal_code: participant_postal_code || '',
        city: participant_city || '',
        message: participant_message || ''
      });

    if (error) {
      console.error('Database function error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error.details,
          hint: error.hint
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Participant added successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
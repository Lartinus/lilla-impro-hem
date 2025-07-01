
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseTitle } = await req.json();
    
    if (!courseTitle) {
      return new Response(JSON.stringify({ 
        error: 'courseTitle is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simulate Strapi webhook payload
    const webhookPayload = {
      event: 'entry.create',
      model: 'course',
      entry: {
        id: 999,
        titel: courseTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Call the strapi-webhook function
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/strapi-webhook`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify(webhookPayload)
    });

    const result = await response.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'Test webhook sent',
      webhookResponse: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

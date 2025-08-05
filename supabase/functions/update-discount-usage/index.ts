import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Rabattkod krävs' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Increment usage counter
    const { data, error } = await supabase
      .from('discount_codes')
      .update({ 
        current_uses: supabase.raw('current_uses + 1') 
      })
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating discount code usage:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Kunde inte uppdatera rabattkod' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: data || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating discount code usage:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Ett fel uppstod vid uppdatering av rabattkoden' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
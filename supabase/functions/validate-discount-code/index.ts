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
    
    const { code, totalAmount } = await req.json();

    const trimmed = (code || '').toString().trim().toUpperCase();

    if (!trimmed || trimmed.length < 3 || typeof totalAmount !== 'number') {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Ogiltig förfrågan' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch discount code from database
    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', trimmed)
      .eq('is_active', true)
      .single();

    if (error || !discountCode) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Rabattkoden är ogiltig' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const now = new Date();
    
    // Check validity dates
    if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Rabattkoden är inte aktiv ännu' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Rabattkoden har gått ut' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check usage limits
    if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Rabattkoden har använts maximalt antal gånger' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate discount amount - preserve exact decimals
    let discountAmount = 0;
    if (discountCode.discount_type === 'percentage') {
      // Use exact calculation without rounding
      discountAmount = totalAmount * (discountCode.discount_amount / 100);
    } else if (discountCode.discount_type === 'fixed') {
      discountAmount = Math.min(discountCode.discount_amount, totalAmount);
    }

    return new Response(JSON.stringify({ 
      valid: true,
      discountAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'Ett fel uppstod vid validering av rabattkoden' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
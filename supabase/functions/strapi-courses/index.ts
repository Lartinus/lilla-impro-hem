
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the secure token from Supabase secrets instead of hardcoded value
const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if we have the required API token
    if (!strapiToken) {
      console.error('STRAPI_API_TOKEN not found in environment variables');
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // HYPER-OPTIMIZED endpoint - absolute minimum fields only
    const endpoint = '/api/courses?fields[0]=titel&fields[1]=undertitel&fields[2]=description&fields[3]=praktisk_info&fields[4]=prioritet&populate[teacher][fields][0]=name&populate[teacher][fields][1]=bio&populate[teacher][populate][bild][fields][0]=url';
    
    console.log(`Fetching hyper-optimized courses from Strapi: ${strapiUrl}${endpoint}`);

    const response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=14400',
      },
      // Add timeout and retry logic
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Strapi API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched hyper-optimized courses data');
    console.log(`Fetched ${data?.data?.length || 0} courses with minimal fields`);
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=21600, s-maxage=28800', // 6 hours client, 8 hours CDN
        'ETag': `"courses-v2-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString(),
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Error in strapi-courses function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      strapiUrl: strapiUrl
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

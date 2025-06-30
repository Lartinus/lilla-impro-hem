
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

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    // If we have a slug from URL params, use it; otherwise check request body
    let targetSlug = slug;
    if (!targetSlug && req.method === 'POST') {
      try {
        const body = await req.json();
        targetSlug = body.slug;
      } catch {
        // No body or invalid JSON, continue without slug
      }
    }
    
    // Ultra-optimized endpoint - only essential fields
    let endpoint;
    if (targetSlug) {
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&fields[0]=titel&fields[1]=slug&fields[2]=datum&fields[3]=beskrivning&fields[4]=praktisk_info&fields[5]=ticket_price&fields[6]=discount_price&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[location][fields][0]=name&populate[location][fields][1]=google_maps_link&populate[bild][fields][0]=url&populate[bild][fields][1]=formats`;
    } else {
      endpoint = '/api/shows?fields[0]=titel&fields[1]=slug&fields[2]=datum&fields[3]=beskrivning&fields[4]=ticket_price&populate[location][fields][0]=name&populate[bild][fields][0]=url&populate[bild][fields][1]=formats';
    }

    console.log(`Fetching ultra-optimized shows from: ${strapiUrl}${endpoint}`);

    const response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Strapi API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched ultra-optimized shows data');
    console.log(`Fetched ${data?.data?.length || 0} shows with minimal fields`);
    
    // Aggressive caching headers
    const cacheControl = targetSlug 
      ? 'public, max-age=3600, s-maxage=7200' // 1 hour client, 2 hours CDN for details
      : 'public, max-age=1800, s-maxage=3600'; // 30 min client, 1 hour CDN for list
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        'ETag': `"${Date.now()}"`,
        'Vary': 'Accept-Encoding',
      },
    });
  } catch (error) {
    console.error('Error in strapi-shows function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

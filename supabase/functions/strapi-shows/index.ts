

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = '9a3a9a56fbae0db8fe99e0a028b83a604c8405e66983d616cf7db4f71229e53bb5536c585dad8159cd28cb27a934710ea0020305f9c850d99851cb2c95feb314ecbc77d2734a67f4ab6f0b32e4eada07f10dd3a2583f016e23bd01000ea5ae8f4381ae610e4febd221cf1464973d5d20bff2f95ad783147bcffb4e7405121ec4';
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
    
    // Use simple populate=deep which should work with Strapi v5
    let endpoint;
    if (targetSlug) {
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&populate=deep`;
      console.log(`Fetching single show: ${strapiUrl}${endpoint}`);
    } else {
      endpoint = '/api/shows?populate=deep';
      console.log(`Fetching all shows: ${strapiUrl}${endpoint}`);
    }

    const response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Final fallback to simple populate=*
      console.log('Trying final fallback with populate=*...');
      const fallbackEndpoint = targetSlug 
        ? `/api/shows?filters[slug][$eq]=${targetSlug}&populate=*`
        : '/api/shows?populate=*';
      
      const fallbackResponse = await fetch(`${strapiUrl}${fallbackEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`All Strapi API attempts failed: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('Using fallback data:', JSON.stringify(fallbackData, null, 2));
      return new Response(JSON.stringify(fallbackData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Successfully fetched shows data:', JSON.stringify(data, null, 2));
    
    // Extra logging for performers when fetching single show
    if (targetSlug && data.data && data.data.length > 0) {
      const show = data.data[0];
      console.log('=== SINGLE SHOW ANALYSIS ===');
      
      // Log main show image (now using "bild")
      if (show.attributes?.bild) {
        console.log('Show main bild:', JSON.stringify(show.attributes.bild, null, 2));
      }
      
      // Log performers and their images
      if (show.attributes?.performers) {
        console.log('=== PERFORMERS ANALYSIS ===');
        show.attributes.performers.forEach((perf: any, i: number) => {
          console.log(`Performer ${i}:`, JSON.stringify(perf, null, 2));
          if (perf.bild) {
            console.log(`Performer ${i} bild:`, JSON.stringify(perf.bild, null, 2));
          }
        });
      }
      
      // Log location
      if (show.attributes?.location) {
        console.log('Show location:', JSON.stringify(show.attributes.location, null, 2));
      }
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in strapi-shows function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


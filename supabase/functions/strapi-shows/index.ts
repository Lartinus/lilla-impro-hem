
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
    
    // Use simpler populate syntax that works with Strapi v4/v5
    let endpoint;
    if (targetSlug) {
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&populate=*`;
      console.log(`Fetching single show with all relations: ${strapiUrl}${endpoint}`);
    } else {
      endpoint = '/api/shows?populate=*';
      console.log(`Fetching all shows with all relations: ${strapiUrl}${endpoint}`);
    }

    console.log(`Making request to: ${strapiUrl}${endpoint}`);
    console.log(`Using token: ${strapiToken.substring(0, 20)}...`);

    const response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Strapi API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched shows data:', JSON.stringify(data, null, 2));
    
    // Log specific image data for debugging
    if (data.data && data.data.length > 0) {
      data.data.forEach((show: any, index: number) => {
        console.log(`Show ${index} - Title:`, show.titel || show.title);
        console.log(`Show ${index} - All fields:`, Object.keys(show));
        if (show.bild) {
          console.log(`Show ${index} bild data:`, JSON.stringify(show.bild, null, 2));
        }
        if (show.performers && Array.isArray(show.performers)) {
          console.log(`Show ${index} - Number of performers:`, show.performers.length);
          show.performers.forEach((performer: any, perfIndex: number) => {
            console.log(`Show ${index}, Performer ${perfIndex} fields:`, Object.keys(performer));
            if (performer.bild) {
              console.log(`Show ${index}, Performer ${perfIndex} bild:`, JSON.stringify(performer.bild, null, 2));
            }
          });
        }
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

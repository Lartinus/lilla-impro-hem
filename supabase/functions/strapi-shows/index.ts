
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
    
    // Build API endpoint with very specific populate for performers
    let endpoint;
    if (targetSlug) {
      // For single show details - try explicit performer image populate
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&populate[location]=*&populate[bild]=*&populate[performers][populate][bild]=*&populate[performers][populate][image]=*&populate[performers][populate][media]=*`;
      console.log(`Fetching show details with explicit performer image populate: ${strapiUrl}${endpoint}`);
    } else {
      // Basic info for show listing
      endpoint = '/api/shows?populate=location&populate=bild';
    }

    console.log(`Fetching from Strapi: ${strapiUrl}${endpoint}`);

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
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched shows data:`, JSON.stringify(data, null, 2));
    
    // Extra detailed logging for performers if this is a detailed request
    if (targetSlug && data.data?.[0]?.performers) {
      console.log('=== EXPLICIT PERFORMER IMAGE POPULATE ANALYSIS ===');
      data.data[0].performers.forEach((performer: any, index: number) => {
        console.log(`Performer ${index}:`, JSON.stringify(performer, null, 2));
        
        // Check what image fields are available at different levels
        console.log(`Performer ${index} direct fields:`, Object.keys(performer));
        if (performer.attributes) {
          console.log(`Performer ${index} attributes fields:`, Object.keys(performer.attributes));
          
          // Check for image fields in attributes
          if (performer.attributes.bild) {
            console.log(`Performer ${index} bild in attributes:`, JSON.stringify(performer.attributes.bild, null, 2));
          }
          if (performer.attributes.image) {
            console.log(`Performer ${index} image in attributes:`, JSON.stringify(performer.attributes.image, null, 2));
          }
          if (performer.attributes.media) {
            console.log(`Performer ${index} media in attributes:`, JSON.stringify(performer.attributes.media, null, 2));
          }
        }
        
        // Check for direct image fields
        if (performer.bild) {
          console.log(`Performer ${index} direct bild:`, JSON.stringify(performer.bild, null, 2));
        }
        if (performer.image) {
          console.log(`Performer ${index} direct image:`, JSON.stringify(performer.image, null, 2));
        }
        if (performer.media) {
          console.log(`Performer ${index} direct media:`, JSON.stringify(performer.media, null, 2));
        }
      });
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

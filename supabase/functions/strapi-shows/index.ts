
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
    
    let endpoint;
    if (targetSlug) {
      // For single show details - use the same approach that works for about page
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&populate[performers][populate][image]=*`;
      console.log(`Fetching show with detailed performers: ${strapiUrl}${endpoint}`);
    } else {
      // For listing - just basic data
      endpoint = '/api/shows';
      console.log(`Fetching all shows: ${strapiUrl}${endpoint}`);
    }

    console.log(`Fetching from Strapi: ${strapiUrl}${endpoint}`);

    let response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // If detailed populate failed, try with simpler populate like courses function does
      if (targetSlug && response.status === 400) {
        console.log('Detailed populate failed, trying simpler populate...');
        const simpleEndpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&populate=performers`;
        console.log(`Trying simple populate: ${strapiUrl}${simpleEndpoint}`);
        
        response = await fetch(`${strapiUrl}${simpleEndpoint}`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error(`Simple populate also failed: ${response.status}`);
          
          // Final fallback - basic fetch without populate
          const basicEndpoint = `/api/shows?filters[slug][$eq]=${targetSlug}`;
          console.log(`Final fallback to basic: ${strapiUrl}${basicEndpoint}`);
          
          response = await fetch(`${strapiUrl}${basicEndpoint}`, {
            headers: {
              'Authorization': `Bearer ${strapiToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`All Strapi API attempts failed: ${response.status}`);
          }
        }
      } else {
        throw new Error(`Strapi API error: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log(`Successfully fetched shows data:`, JSON.stringify(data, null, 2));
    
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

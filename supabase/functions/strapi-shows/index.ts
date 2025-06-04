
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = '9a3a9a56fbae0db8fe99e0a028b83a604c8405e66983d616cf7db4f71229e53bb5536c585dad8159cd28cb27a934710ea0020305f9c850d99851cb2c95feb314ecbc77d2734a67f4ab6f0b32e4eada07f10dd3a2583f016e23bd01000ea5ae8f4381ae610e4febd221cf1464973d5d20bff2f95ad783147bcffb4e7405121ec4';
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to fetch performer with image
const fetchPerformerWithImage = async (performerId: number) => {
  try {
    const response = await fetch(`${strapiUrl}/api/performers/${performerId}?populate=bild`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Fetched performer ${performerId} with image:`, JSON.stringify(data, null, 2));
      return data.data;
    } else {
      console.log(`Failed to fetch performer ${performerId}:`, response.status);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching performer ${performerId}:`, error);
    return null;
  }
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
    
    // Build endpoint
    let endpoint;
    if (targetSlug) {
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&populate[performers]=*&populate[location]=*&populate[bild]=*`;
    } else {
      endpoint = '/api/shows?populate[performers]=*&populate[location]=*&populate[bild]=*';
    }

    console.log(`Fetching shows from: ${strapiUrl}${endpoint}`);

    const response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
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
    console.log('Successfully fetched shows data');
    
    // Enhance performer data with images by making separate API calls
    if (data.data && data.data.length > 0) {
      for (let showIndex = 0; showIndex < data.data.length; showIndex++) {
        const show = data.data[showIndex];
        console.log(`Processing show ${showIndex}: ${show.titel || show.title}`);
        
        if (show.performers && Array.isArray(show.performers)) {
          console.log(`Show ${showIndex} has ${show.performers.length} performers`);
          
          // Fetch detailed performer data with images
          for (let perfIndex = 0; perfIndex < show.performers.length; perfIndex++) {
            const performer = show.performers[perfIndex];
            console.log(`Fetching detailed data for performer ${perfIndex}: ${performer.name} (ID: ${performer.id})`);
            
            const detailedPerformer = await fetchPerformerWithImage(performer.id);
            if (detailedPerformer) {
              // Merge the detailed data (including image) with existing performer data
              show.performers[perfIndex] = {
                ...performer, // Keep existing data
                ...detailedPerformer, // Add detailed data including bild
              };
              console.log(`Enhanced performer ${perfIndex} data:`, JSON.stringify(show.performers[perfIndex], null, 2));
            } else {
              console.log(`Could not enhance performer ${perfIndex} data`);
            }
          }
        }
      }
    }
    
    console.log('Final enhanced data ready to return');
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

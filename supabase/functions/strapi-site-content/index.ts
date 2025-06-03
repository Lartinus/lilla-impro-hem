
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = '9a3a9a56fbae0db8fe99e0a028b83a604c8405e66983d616cf7db4f71229e53bb5536c585dad8159cd28cb27a934710ea0020305f9c850d99851cb2c95feb314ecbc77d2734a67f4ab6f0b32e4eada07f10dd3a2583f016e23bd01000ea5ae8f4381ae610e4febd221cf1464973d5d20bff2f95ad783147bcffb4e7405121ec4';
// Use your production Strapi URL
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
    const { type } = await req.json();
    const contentType = type || 'site-settings';
    
    // For 'about' content type, try multiple populate strategies like courses and shows functions
    let apiUrl;
    
    if (contentType === 'about') {
      // Try multiple populate strategies for Strapi v5 - same approach as courses and shows
      let endpoint = `/api/${contentType}?populate[performers][populate][image]=*`;
      
      console.log(`Fetching about content from Strapi: ${strapiUrl}${endpoint}`);

      let response = await fetch(`${strapiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Strapi API error with specific populate: ${response.status} - ${response.statusText}`);
        
        // Try alternative populate syntax
        endpoint = `/api/${contentType}?populate=performers.image`;
        console.log(`Trying alternative populate: ${strapiUrl}${endpoint}`);
        
        response = await fetch(`${strapiUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error(`Alternative populate failed: ${response.status}`);
          
          // Final fallback with deep populate
          endpoint = `/api/${contentType}?populate=deep`;
          console.log(`Trying deep populate: ${strapiUrl}${endpoint}`);
          
          response = await fetch(`${strapiUrl}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${strapiToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            // Last resort - simple populate
            endpoint = `/api/${contentType}?populate=*`;
            console.log(`Final fallback to populate=*: ${strapiUrl}${endpoint}`);
            
            response = await fetch(`${strapiUrl}${endpoint}`, {
              headers: {
                'Authorization': `Bearer ${strapiToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              throw new Error(`All Strapi API attempts failed: ${response.status}`);
            }
          }
        }
      }

      const data = await response.json();
      console.log(`Successfully fetched about data:`, JSON.stringify(data, null, 2));
      
      // Log specific performer data to see what we're getting - same as shows function
      if (data.data?.performers) {
        console.log('=== CHECKING PERFORMERS FOR IMAGES ===');
        data.data.performers.forEach((performer: any, index: number) => {
          console.log(`Performer ${index}:`, JSON.stringify(performer, null, 2));
          if (performer.image) {
            console.log(`Performer ${index} - IMAGE FIELD:`, JSON.stringify(performer.image, null, 2));
          }
          if (performer.bild) {
            console.log(`Performer ${index} - BILD FIELD:`, JSON.stringify(performer.bild, null, 2));
          }
        });
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // For other content types, use simple populate
      apiUrl = `${strapiUrl}/api/${contentType}?populate=*`;
      console.log(`Fetching ${contentType} from Strapi: ${apiUrl}`);

      const response = await fetch(apiUrl, {
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
      console.log(`Successfully fetched ${contentType}:`, JSON.stringify(data, null, 2));
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in strapi-site-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      strapiUrl: strapiUrl,
      contentType: 'about'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

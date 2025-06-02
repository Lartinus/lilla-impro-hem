
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
    
    // For 'about' content type, try multiple populate strategies with "bild" field
    let apiUrl;
    let response;
    
    if (contentType === 'about') {
      // Strategy 1: Try detailed populate with nested fields including "bild" images
      const detailedPopulate = 'populate[performers][populate][bild][populate]=*';
      apiUrl = `${strapiUrl}/api/${contentType}?${detailedPopulate}`;
      console.log(`Trying detailed populate for about: ${apiUrl}`);

      response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      // If detailed populate fails, try simpler bild populate
      if (!response.ok) {
        console.log('Detailed populate failed, trying bild populate');
        apiUrl = `${strapiUrl}/api/${contentType}?populate[performers][populate]=bild`;
        console.log(`Trying bild populate for about: ${apiUrl}`);
        
        response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // If both fail, try simple populate
      if (!response.ok) {
        console.log('Bild populate failed, trying simple populate');
        apiUrl = `${strapiUrl}/api/${contentType}?populate=*`;
        console.log(`Trying simple populate for about: ${apiUrl}`);
        
        response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // If all fail, try just performers
      if (!response.ok) {
        console.log('Simple populate failed, trying performers only');
        apiUrl = `${strapiUrl}/api/${contentType}?populate=performers`;
        console.log(`Trying performers only for about: ${apiUrl}`);
        
        response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } else {
      // For other content types, use simple populate
      apiUrl = `${strapiUrl}/api/${contentType}?populate=*`;
      console.log(`Fetching ${contentType} from Strapi: ${apiUrl}`);

      response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${contentType}:`, JSON.stringify(data, null, 2));
    
    // Extra detailed logging for performers and their images
    if (contentType === 'about' && data.data?.performers) {
      console.log('=== DETAILED PERFORMERS ANALYSIS ===');
      data.data.performers.forEach((performer: any, index: number) => {
        console.log(`Performer ${index}:`, JSON.stringify(performer, null, 2));
        if (performer.bild) {
          console.log(`Performer ${index} - BILD FIELD:`, JSON.stringify(performer.bild, null, 2));
        }
        if (performer.image) {
          console.log(`Performer ${index} - IMAGE FIELD:`, JSON.stringify(performer.image, null, 2));
        }
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in strapi-site-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      strapiUrl: strapiUrl,
      contentType: 'course-main-info'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


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
    
    // Special handling for 'about' content type to properly populate performers
    let populateQuery = 'populate=*';
    if (contentType === 'about') {
      // Try to populate performers with all their related fields
      populateQuery = 'populate=performers,performers.media';
    }
    
    const apiUrl = `${strapiUrl}/api/${contentType}?${populateQuery}`;
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
      
      // Fallback to simple populate if the complex one fails
      if (contentType === 'about') {
        console.log('Trying fallback populate for about');
        const fallbackResponse = await fetch(`${strapiUrl}/api/${contentType}?populate=*`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log(`Successfully fetched ${contentType} with fallback:`, JSON.stringify(fallbackData, null, 2));
          return new Response(JSON.stringify(fallbackData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${contentType}:`, JSON.stringify(data, null, 2));
    
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

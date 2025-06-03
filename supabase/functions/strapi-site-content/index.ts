
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
    
    // For 'about' content type, try multiple populate strategies
    let apiUrl;
    
    if (contentType === 'about') {
      // First, let's try to get the content without any specific populate to see the raw structure
      let endpoint = `/api/${contentType}`;
      
      console.log(`=== DEBUGGING ABOUT CONTENT STRUCTURE ===`);
      console.log(`Fetching basic about content from Strapi: ${strapiUrl}${endpoint}`);

      let response = await fetch(`${strapiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const basicData = await response.json();
        console.log(`=== BASIC ABOUT DATA STRUCTURE ===`);
        console.log(JSON.stringify(basicData, null, 2));
        
        // Now check what relations are available
        if (basicData.data?.performers) {
          console.log(`=== PERFORMERS RELATION FOUND ===`);
          console.log('Performers data:', JSON.stringify(basicData.data.performers, null, 2));
        }
      }

      // Now try with deep populate to get everything
      endpoint = `/api/${contentType}?populate=deep`;
      console.log(`Trying deep populate: ${strapiUrl}${endpoint}`);
      
      response = await fetch(`${strapiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback to populate all
        endpoint = `/api/${contentType}?populate=*`;
        console.log(`Deep populate failed, trying populate all: ${strapiUrl}${endpoint}`);
        
        response = await fetch(`${strapiUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Final fallback - try specific performer populate
          endpoint = `/api/${contentType}?populate[performers]=*`;
          console.log(`Populate all failed, trying specific performers: ${strapiUrl}${endpoint}`);
          
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

      const data = await response.json();
      console.log(`=== FINAL ABOUT DATA WITH POPULATE ===`);
      console.log(JSON.stringify(data, null, 2));
      
      // Let's also check if we can fetch performers separately to see their structure
      try {
        console.log(`=== FETCHING PERFORMERS SEPARATELY ===`);
        const performersResponse = await fetch(`${strapiUrl}/api/performers?populate=*`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (performersResponse.ok) {
          const performersData = await performersResponse.json();
          console.log(`=== SEPARATE PERFORMERS DATA ===`);
          console.log(JSON.stringify(performersData, null, 2));
          
          // Check each performer's available fields
          if (performersData.data && Array.isArray(performersData.data)) {
            performersData.data.forEach((performer: any, index: number) => {
              console.log(`=== PERFORMER ${index} AVAILABLE FIELDS ===`);
              const performerData = performer.attributes || performer;
              console.log(`Available fields:`, Object.keys(performerData));
              
              // Check all possible image field names
              const imageFields = ['image', 'bild', 'foto', 'picture', 'avatar', 'media', 'poster'];
              imageFields.forEach(field => {
                if (performerData[field]) {
                  console.log(`Found ${field} field:`, JSON.stringify(performerData[field], null, 2));
                }
              });
            });
          }
        }
      } catch (performersError) {
        console.log('Could not fetch performers separately:', performersError);
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

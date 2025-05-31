
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
    // Try multiple populate strategies for Strapi v5
    let endpoint = '/api/courses?populate[teacher][populate][bild]=*';
    
    console.log(`Fetching courses from Strapi: ${strapiUrl}${endpoint}`);

    let response = await fetch(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Strapi API error with specific populate: ${response.status} - ${response.statusText}`);
      
      // Try alternative populate syntax
      endpoint = '/api/courses?populate=teacher.bild';
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
        endpoint = '/api/courses?populate=deep';
        console.log(`Trying deep populate: ${strapiUrl}${endpoint}`);
        
        response = await fetch(`${strapiUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Last resort - simple populate
          endpoint = '/api/courses?populate=*';
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
    console.log('Successfully fetched courses data:', JSON.stringify(data, null, 2));
    
    // Log specific teacher data to see what we're getting
    if (data.data && data.data.length > 0) {
      data.data.forEach((course: any, index: number) => {
        console.log(`Course ${index} teacher data:`, JSON.stringify(course.teacher, null, 2));
        if (course.teacher?.bild) {
          console.log(`Course ${index} teacher bild:`, JSON.stringify(course.teacher.bild, null, 2));
        }
        if (course.teacher?.image) {
          console.log(`Course ${index} teacher image:`, JSON.stringify(course.teacher.image, null, 2));
        }
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in strapi-courses function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      strapiUrl: strapiUrl
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

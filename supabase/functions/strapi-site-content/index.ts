import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the secure token from Supabase secrets instead of hardcoded value
const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
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
    // Check if we have the required API token
    if (!strapiToken) {
      console.error('STRAPI_API_TOKEN not found in environment variables');
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { type } = await req.json();
    const contentType = type || 'site-settings';
    
    // Handle hero-image content with all media populated
    if (contentType === 'hero-image') {
      console.log(`=== FETCHING HERO-IMAGE CONTENT ===`);
      
      const endpoint = `/api/${contentType}?populate=*`;
      console.log(`Fetching hero-image: ${strapiUrl}${endpoint}`);

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
      console.log(`Successfully fetched hero-image content:`, JSON.stringify(data, null, 2));
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800', // 30 minutes cache
        },
      });
    }
    
    // Handle private-party content with proper error handling
    else if (contentType === 'private-party') {
      console.log(`=== FETCHING PRIVATE-PARTY CONTENT ===`);
      
      const endpoint = `/api/${contentType}`;
      console.log(`Fetching private-party: ${strapiUrl}${endpoint}`);

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
      console.log(`Successfully fetched private-party content:`, JSON.stringify(data, null, 2));
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800', // 30 minutes cache
        },
      });
    }
    
    // Handle course-main-info content
    else if (contentType === 'course-main-info') {
      console.log(`=== FETCHING COURSE-MAIN-INFO CONTENT ===`);
      
      const endpoint = `/api/${contentType}`;
      console.log(`Fetching course-main-info: ${strapiUrl}${endpoint}`);

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
      console.log(`Successfully fetched course-main-info content`);
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1 hour cache
        },
      });
    }
    
    // For 'about' content type, fetch with populated performers
    else if (contentType === 'about') {
      console.log(`=== FETCHING ABOUT CONTENT WITH PERFORMERS ===`);
      
      // First fetch the about content with populated performers
      let endpoint = `/api/${contentType}?populate[performers][populate]=*`;
      console.log(`Fetching about content: ${strapiUrl}${endpoint}`);

      let response = await fetch(`${strapiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback to deep populate
        endpoint = `/api/${contentType}?populate=deep`;
        console.log(`Specific populate failed, trying deep populate: ${strapiUrl}${endpoint}`);
        
        response = await fetch(`${strapiUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          // Final fallback to populate all
          endpoint = `/api/${contentType}?populate=*`;
          console.log(`Deep populate failed, trying populate all: ${strapiUrl}${endpoint}`);
          
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
      console.log(`=== ABOUT DATA RESULT ===`);
      console.log(JSON.stringify(data, null, 2));
      
      // If we didn't get populated performers, fetch them separately and merge
      if (data.data && (!data.data.performers || (Array.isArray(data.data.performers) && data.data.performers.length > 0 && !data.data.performers[0].bild))) {
        console.log(`=== PERFORMERS NOT POPULATED, FETCHING SEPARATELY ===`);
        
        try {
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
            
            // Merge the populated performers into the about data
            if (performersData.data && Array.isArray(performersData.data)) {
              data.data.performers = performersData.data;
              console.log(`=== MERGED PERFORMERS INTO ABOUT DATA ===`);
              console.log(`Merged ${performersData.data.length} performers`);
            }
          }
        } catch (performersError) {
          console.log('Could not fetch performers separately:', performersError);
        }
      }
      
      console.log(`=== FINAL ABOUT DATA TO SEND ===`);
      console.log(JSON.stringify(data, null, 2));
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // For other content types, use simple populate
      const apiUrl = `${strapiUrl}/api/${contentType}?populate=*`;
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
      contentType: 'private-party'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

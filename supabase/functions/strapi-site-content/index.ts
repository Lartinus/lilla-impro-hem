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
    
    // Handle private-party content with optimized fields
    if (contentType === 'private-party') {
      console.log(`=== FETCHING PRIVATE-PARTY CONTENT (OPTIMIZED) ===`);
      
      const endpoint = `/api/${contentType}?fields[0]=info`;
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
      console.log(`Successfully fetched optimized private-party content`);
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1 hour cache for better performance
        },
      });
    }
    
    // Handle about content with optimized performer fetching
    else if (contentType === 'about') {
      console.log(`=== FETCHING ABOUT CONTENT (OPTIMIZED) ===`);
      
      // Optimized query with specific fields only
      let endpoint = `/api/${contentType}?fields[0]=info&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[performers][populate][bild][fields][0]=url&populate[performers][populate][bild][fields][1]=alternativeText&populate[performers][populate][bild][fields][2]=formats`;
      console.log(`Fetching optimized about content: ${strapiUrl}${endpoint}`);

      let response = await fetch(`${strapiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback to simpler populate if specific populate fails
        endpoint = `/api/${contentType}?fields[0]=info&populate=performers`;
        console.log(`Specific populate failed, trying simpler populate: ${strapiUrl}${endpoint}`);
        
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

      const data = await response.json();
      console.log(`Successfully fetched optimized about content`);
      
      // If performers are not fully populated, fetch them separately with minimal fields
      if (data.data && data.data.performers && Array.isArray(data.data.performers) && 
          data.data.performers.length > 0 && !data.data.performers[0].bild) {
        console.log(`=== PERFORMERS NOT FULLY POPULATED, FETCHING WITH MINIMAL FIELDS ===`);
        
        try {
          const performersResponse = await fetch(`${strapiUrl}/api/performers?fields[0]=name&fields[1]=bio&populate[bild][fields][0]=url&populate[bild][fields][1]=alternativeText&populate[bild][fields][2]=formats`, {
            headers: {
              'Authorization': `Bearer ${strapiToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (performersResponse.ok) {
            const performersData = await performersResponse.json();
            console.log(`Successfully fetched performers with minimal fields`);
            
            if (performersData.data && Array.isArray(performersData.data)) {
              data.data.performers = performersData.data;
              console.log(`Merged ${performersData.data.length} optimized performers`);
            }
          }
        } catch (performersError) {
          console.log('Could not fetch performers separately:', performersError);
        }
      }
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1 hour cache
        },
      });
    }
    
    // Handle course-main-info content with minimal fields
    else if (contentType === 'course-main-info') {
      console.log(`=== FETCHING COURSE-MAIN-INFO CONTENT (OPTIMIZED) ===`);
      
      const endpoint = `/api/${contentType}?fields[0]=info&fields[1]=redbox&fields[2]=info_efter_redbox`;
      console.log(`Fetching optimized course-main-info: ${strapiUrl}${endpoint}`);

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
      console.log(`Successfully fetched optimized course-main-info content`);
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=7200', // 2 hours cache - this content changes rarely
        },
      });
    }
    
    // Handle hero-image content - keep as is since it's already optimized
    else if (contentType === 'hero-image') {
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
        throw new Error(`Strapi API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched hero-image content`);
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1 hour cache
        },
      });
    } else {
      // For other content types, use optimized populate
      const apiUrl = `${strapiUrl}/api/${contentType}`;
      console.log(`Fetching ${contentType} from Strapi: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
        throw new Error(`Strapi API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${contentType}`);
      
      return new Response(JSON.stringify(data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800', // 30 minutes cache
        },
      });
    }
  } catch (error) {
    console.error('Error in strapi-site-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      strapiUrl: strapiUrl,
      contentType: contentType || 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

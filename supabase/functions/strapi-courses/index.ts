
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Use the secure token from Supabase secrets instead of hardcoded value
const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry function with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      
      if (response.status === 429 && attempt < maxRetries) {
        // Rate limited, wait before retry
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry
      const delay = Math.pow(2, attempt) * 500; // 0.5s, 1s, 2s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

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

    // Start with the simplest possible endpoint - no populate at all
    const endpoint = '/api/courses';
    
    console.log(`Fetching courses from Strapi: ${strapiUrl}${endpoint}`);

    const response = await fetchWithRetry(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      
      // Return empty data instead of error to prevent UI breaking
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Successfully fetched courses data:', JSON.stringify(data, null, 2));
    
    // Validate data structure
    if (!data || !data.data) {
      console.warn('Invalid data structure received from Strapi');
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      },
    });
  } catch (error) {
    console.error('Error in strapi-courses function:', error);
    // Return empty data instead of error to prevent UI breaking
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

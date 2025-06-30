
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry utility function
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to fetch from: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`Successful response on attempt ${attempt}`);
        return response;
      } else {
        console.log(`HTTP error ${response.status} on attempt ${attempt}`);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`Network error on attempt ${attempt}:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!strapiToken) {
      console.error('STRAPI_API_TOKEN not found in environment variables');
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const endpoint = '/api/courses?fields[0]=titel&fields[1]=undertitel&fields[2]=description&fields[3]=praktisk_info&fields[4]=prioritet&populate[teacher][fields][0]=name&populate[teacher][fields][1]=bio&populate[teacher][populate][bild][fields][0]=url';
    
    console.log(`Fetching courses with retry logic from: ${strapiUrl}${endpoint}`);

    const response = await fetchWithRetry(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=300',
      },
    });

    const data = await response.json();
    console.log('Successfully fetched courses data with retry logic');
    console.log(`Fetched ${data?.data?.length || 0} courses`);
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600', // Shorter cache for reliability
        'ETag': `"courses-reliable-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error('Final error in strapi-courses function:', error);
    
    // Return a more user-friendly error with fallback data structure
    return new Response(JSON.stringify({ 
      error: 'Kunde inte ladda kurser från servern',
      details: error.message,
      data: [], // Empty array to prevent frontend crashes
      meta: {
        pagination: {
          page: 1,
          pageSize: 25,
          pageCount: 0,
          total: 0
        }
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry utility function with progressive timeout
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to fetch shows from: ${url}`);
      
      // Progressive timeout: 8s, 12s, 15s
      const timeout = Math.min(8000 + (attempt - 1) * 4000, 15000);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`Successful shows response on attempt ${attempt} (${timeout}ms timeout)`);
        return response;
      } else {
        console.log(`HTTP error ${response.status} on attempt ${attempt}`);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`Network error on attempt ${attempt}:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
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

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    let targetSlug = slug;
    if (!targetSlug && req.method === 'POST') {
      try {
        const body = await req.json();
        targetSlug = body.slug;
      } catch {
        // No body or invalid JSON, continue without slug
      }
    }
    
    let endpoint;
    if (targetSlug) {
      endpoint = `/api/shows?filters[slug][$eq]=${targetSlug}&fields[0]=titel&fields[1]=slug&fields[2]=datum&fields[3]=beskrivning&fields[4]=praktisk_info&fields[5]=ticket_price&fields[6]=discount_price&fields[7]=available_tickets&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[performers][populate][bild][fields][0]=url&populate[location][fields][0]=name&populate[location][fields][1]=google_maps_link&populate[bild][fields][0]=url`;
    } else {
      endpoint = '/api/shows?fields[0]=titel&fields[1]=slug&fields[2]=datum&fields[3]=beskrivning&fields[4]=ticket_price&fields[5]=discount_price&fields[6]=available_tickets&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[performers][populate][bild][fields][0]=url&populate[location][fields][0]=name&populate[location][fields][1]=google_maps_link&populate[bild][fields][0]=url';
    }

    console.log(`Fetching shows with retry logic from: ${strapiUrl}${endpoint}`);

    const response = await fetchWithRetry(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=7200',
      },
    });

    const data = await response.json();
    console.log('Successfully fetched shows data with retry logic');
    console.log(`Fetched ${data?.data?.length || 0} shows with retry strategy`);
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=14400, s-maxage=21600',
        'ETag': `"shows-optimized-${targetSlug || 'all'}-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString(),
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error) {
    console.error('Final error in strapi-shows function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Kunde inte ladda föreställningar från servern',
      details: error.message,
      data: [],
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

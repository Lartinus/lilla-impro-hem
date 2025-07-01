
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced retry utility with progressive timeout and circuit breaker
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to fetch courses from: ${url}`);
      
      // Progressive timeout: 8s, 12s, 15s (matching shows function)
      const timeout = Math.min(8000 + (attempt - 1) * 4000, 15000);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const startTime = performance.now();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const duration = performance.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ Successful courses response on attempt ${attempt} (${timeout}ms timeout, ${duration.toFixed(0)}ms actual)`);
        return response;
      } else {
        console.log(`❌ HTTP error ${response.status} on attempt ${attempt} after ${duration.toFixed(0)}ms`);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorType = error.name === 'AbortError' ? 'Timeout' : 'Network error';
      console.log(`⚠️  ${errorType} on attempt ${attempt}:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Exponential backoff with jitter: 1s, 2s, 4s (max 4s)
        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
        const jitter = Math.random() * 1000; // Add up to 1s jitter
        const delay = baseDelay + jitter;
        console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
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

  const requestStart = performance.now();

  try {
    if (!strapiToken) {
      console.error('❌ STRAPI_API_TOKEN not found in environment variables');
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const endpoint = '/api/courses?fields[0]=titel&fields[1]=undertitel&fields[2]=description&fields[3]=praktisk_info&fields[4]=prioritet&populate[teacher][fields][0]=name&populate[teacher][fields][1]=bio&populate[teacher][populate][bild][fields][0]=url';
    
    console.log(`🚀 Starting optimized courses fetch from: ${strapiUrl}${endpoint}`);

    const response = await fetchWithRetry(`${strapiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache', // Force fresh data for better reliability
        'User-Agent': 'Supabase-Functions/1.0',
      },
    });

    const data = await response.json();
    const totalDuration = performance.now() - requestStart;
    
    console.log(`✅ Successfully fetched courses data with optimized strategy`);
    console.log(`📊 Performance: ${data?.data?.length || 0} courses in ${totalDuration.toFixed(0)}ms`);
    
    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        // Optimized caching headers
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30min browser, 1h CDN
        'ETag': `"courses-v2-${Date.now()}"`,
        'Last-Modified': new Date().toUTCString(),
        'Vary': 'Accept-Encoding',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-Response-Time': `${totalDuration.toFixed(0)}ms`,
      },
    });
  } catch (error) {
    const totalDuration = performance.now() - requestStart;
    console.error(`❌ Final error in optimized courses function after ${totalDuration.toFixed(0)}ms:`, error);
    
    return new Response(JSON.stringify({ 
      error: 'Kunde inte ladda kurser från servern',
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
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-Response-Time': `${totalDuration.toFixed(0)}ms`,
      },
    });
  }
});

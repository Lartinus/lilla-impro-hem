
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const strapiToken = Deno.env.get('STRAPI_API_TOKEN');
const strapiUrl = Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchRequest {
  type: 'shows' | 'courses' | 'site-content';
  params?: {
    slug?: string;
    contentType?: string;
  };
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

    const { requests }: { requests: BatchRequest[] } = await req.json();
    
    if (!requests || !Array.isArray(requests)) {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing batch request with ${requests.length} operations`);
    const startTime = performance.now();

    // Build all requests in parallel
    const fetchPromises = requests.map(async (request, index) => {
      let endpoint = '';
      
      switch (request.type) {
        case 'shows':
          if (request.params?.slug) {
            endpoint = `/api/shows?filters[slug][$eq]=${request.params.slug}&fields[0]=titel&fields[1]=slug&fields[2]=datum&fields[3]=beskrivning&fields[4]=praktisk_info&fields[5]=ticket_price&fields[6]=discount_price&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[location][fields][0]=name&populate[location][fields][1]=google_maps_link&populate[bild][fields][0]=url&populate[bild][fields][1]=formats`;
          } else {
            endpoint = '/api/shows?fields[0]=titel&fields[1]=slug&fields[2]=datum&fields[3]=beskrivning&fields[4]=ticket_price&populate[location][fields][0]=name&populate[bild][fields][0]=url&populate[bild][fields][1]=formats';
          }
          break;
        
        case 'courses':
          endpoint = '/api/courses?fields[0]=titel&fields[1]=undertitel&fields[2]=description&fields[3]=praktisk_info&fields[4]=prioritet&populate[teacher][fields][0]=name&populate[teacher][fields][1]=bio&populate[teacher][populate][bild][fields][0]=url&populate[teacher][populate][bild][fields][1]=formats';
          break;
        
        case 'site-content':
          const contentType = request.params?.contentType || 'site-settings';
          switch (contentType) {
            case 'private-party':
              endpoint = `/api/private-party?fields[0]=info&fields[1]=redbox&fields[2]=info_efter_redbox`;
              break;
            case 'about':
              endpoint = `/api/about?fields[0]=info&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[performers][populate][bild][fields][0]=url&populate[performers][populate][bild][fields][1]=formats`;
              break;
            case 'course-main-info':
              endpoint = `/api/course-main-info?fields[0]=info&fields[1]=redbox&fields[2]=info_efter_redbox`;
              break;
            case 'hero-image':
              endpoint = `/api/hero-image?populate=*`;
              break;
            default:
              endpoint = `/api/${contentType}`;
          }
          break;
        
        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }

      try {
        const response = await fetch(`${strapiUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${strapiToken}`,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
          },
        });

        if (!response.ok) {
          console.error(`Request ${index} failed: ${response.status} - ${response.statusText}`);
          return { error: `Request ${index} failed: ${response.status}`, data: null };
        }

        const data = await response.json();
        return { error: null, data };
      } catch (error) {
        console.error(`Request ${index} error:`, error);
        return { error: error.message, data: null };
      }
    });

    // Execute all requests in parallel
    const results = await Promise.all(fetchPromises);
    
    const endTime = performance.now();
    console.log(`Batch request completed in ${endTime - startTime} milliseconds`);

    // Check if any requests failed
    const hasErrors = results.some(result => result.error);
    
    return new Response(JSON.stringify({
      success: !hasErrors,
      results,
      timing: `${endTime - startTime}ms`
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30 min client, 1 hour CDN
        'ETag': `"batch-${Date.now()}"`,
        'Vary': 'Accept-Encoding',
      },
    });
  } catch (error) {
    console.error('Error in strapi-batch function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import { STRAPI_CONFIG, CORS_HEADERS, CACHE_HEADERS } from './config.ts';
import type { StrapiResponse } from './types.ts';

export async function handlePrivatePartyContent(): Promise<Response> {
  console.log(`=== FETCHING PRIVATE-PARTY CONTENT (ULTRA-OPTIMIZED) ===`);
  
  const endpoint = `/api/private-party?fields[0]=info&fields[1]=redbox&fields[2]=info_efter_redbox`;
  console.log(`Fetching private-party: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*', // Enable conditional requests
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Strapi API error:', response.status, response.statusText, errorText);
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.PRIVATE_PARTY,
      'ETag': `"pp-${Date.now()}"`,
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function handleAboutContent(): Promise<Response> {
  console.log(`=== FETCHING ABOUT CONTENT (ULTRA-OPTIMIZED) ===`);
  
  // Ultra-optimized query - minimal fields only
  let endpoint = `/api/about?fields[0]=info&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[performers][populate][bild][fields][0]=url&populate[performers][populate][bild][fields][1]=alternativeText&populate[performers][populate][bild][fields][2]=formats`;
  console.log(`Fetching ultra-optimized about content: ${STRAPI_CONFIG.url}${endpoint}`);

  let response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    // Fallback to minimal populate if specific populate fails
    console.log(`Specific populate failed, trying minimal populate...`);
    endpoint = `/api/about?fields[0]=info&populate=performers`;
    
    response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });
    
    if (!response.ok) {
      throw new Error(`All Strapi API attempts failed: ${response.status}`);
    }
  }

  const data = await response.json();
  
  // If performers are not fully populated, fetch them separately with ultra-minimal fields
  if (data.data && data.data.performers && Array.isArray(data.data.performers) && 
      data.data.performers.length > 0 && !data.data.performers[0].bild) {
    console.log(`=== PERFORMERS NOT FULLY POPULATED, FETCHING ULTRA-MINIMAL ===`);
    
    try {
      const performersResponse = await fetch(`${STRAPI_CONFIG.url}/api/performers?fields[0]=name&fields[1]=bio&populate[bild][fields][0]=url&populate[bild][fields][1]=alternativeText&populate[bild][fields][2]=formats`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      });
      
      if (performersResponse.ok) {
        const performersData = await performersResponse.json();
        console.log(`Successfully fetched ultra-minimal performers`);
        
        if (performersData.data && Array.isArray(performersData.data)) {
          data.data.performers = performersData.data;
          console.log(`Merged ${performersData.data.length} ultra-optimized performers`);
        }
      }
    } catch (performersError) {
      console.log('Could not fetch performers separately:', performersError);
    }
  }
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.ABOUT,
      'ETag': `"about-${Date.now()}"`,
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function handleCourseMainInfoContent(): Promise<Response> {
  console.log(`=== FETCHING COURSE-MAIN-INFO CONTENT (ULTRA-OPTIMIZED) ===`);
  
  const endpoint = `/api/course-main-info?fields[0]=info&fields[1]=redbox&fields[2]=info_efter_redbox`;
  console.log(`Fetching ultra-optimized course-main-info: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    console.error(`Strapi API error: ${response.status} - ${response.statusText}`);
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Successfully fetched ultra-optimized course-main-info content`);
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.COURSE_MAIN_INFO,
      'ETag': `"cmi-${Date.now()}"`,
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function handleHeroImageContent(): Promise<Response> {
  console.log(`=== FETCHING HERO-IMAGE CONTENT (OPTIMIZED) ===`);
  
  // Only fetch essential image fields
  const endpoint = `/api/hero-image?populate[bild][fields][0]=url&populate[bild][fields][1]=alternativeText&populate[bild][fields][2]=formats`;
  console.log(`Fetching optimized hero-image: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`Successfully fetched optimized hero-image content`);
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.HERO_IMAGE,
      'ETag': `"hero-${Date.now()}"`,
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function handleGenericContent(contentType: string): Promise<Response> {
  const apiUrl = `${STRAPI_CONFIG.url}/api/${contentType}`;
  console.log(`Fetching ${contentType} from Strapi: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
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
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.DEFAULT,
      'ETag': `"${contentType}-${Date.now()}"`,
      'Vary': 'Accept-Encoding',
    },
  });
}

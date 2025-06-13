
import { STRAPI_CONFIG, CORS_HEADERS, CACHE_HEADERS } from './config.ts';
import type { StrapiResponse } from './types.ts';

export async function handlePrivatePartyContent(): Promise<Response> {
  console.log(`=== FETCHING PRIVATE-PARTY CONTENT (OPTIMIZED) ===`);
  
  const endpoint = `/api/private-party?fields[0]=info`;
  console.log(`Fetching private-party: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
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
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.PRIVATE_PARTY,
    },
  });
}

export async function handleAboutContent(): Promise<Response> {
  console.log(`=== FETCHING ABOUT CONTENT (OPTIMIZED) ===`);
  
  // Optimized query with specific fields only
  let endpoint = `/api/about?fields[0]=info&populate[performers][fields][0]=name&populate[performers][fields][1]=bio&populate[performers][populate][bild][fields][0]=url&populate[performers][populate][bild][fields][1]=alternativeText&populate[performers][populate][bild][fields][2]=formats`;
  console.log(`Fetching optimized about content: ${STRAPI_CONFIG.url}${endpoint}`);

  let response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Fallback to simpler populate if specific populate fails
    endpoint = `/api/about?fields[0]=info&populate=performers`;
    console.log(`Specific populate failed, trying simpler populate: ${STRAPI_CONFIG.url}${endpoint}`);
    
    response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
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
      const performersResponse = await fetch(`${STRAPI_CONFIG.url}/api/performers?fields[0]=name&fields[1]=bio&populate[bild][fields][0]=url&populate[bild][fields][1]=alternativeText&populate[bild][fields][2]=formats`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
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
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.ABOUT,
    },
  });
}

export async function handleCourseMainInfoContent(): Promise<Response> {
  console.log(`=== FETCHING COURSE-MAIN-INFO CONTENT (OPTIMIZED) ===`);
  
  const endpoint = `/api/course-main-info?fields[0]=info&fields[1]=redbox&fields[2]=info_efter_redbox`;
  console.log(`Fetching optimized course-main-info: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
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
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.COURSE_MAIN_INFO,
    },
  });
}

export async function handleHeroImageContent(): Promise<Response> {
  console.log(`=== FETCHING HERO-IMAGE CONTENT ===`);
  
  const endpoint = `/api/hero-image?populate=*`;
  console.log(`Fetching hero-image: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
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
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.HERO_IMAGE,
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
    },
  });
}

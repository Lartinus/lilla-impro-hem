
import { STRAPI_CONFIG, CORS_HEADERS, CACHE_HEADERS } from './config.ts';
import type { StrapiResponse } from './types.ts';

export async function handlePrivatePartyContent(): Promise<Response> {
  console.log(`=== FETCHING PRIVATE-PARTY CONTENT (FIXED) ===`);
  
  const endpoint = `/api/private-party?fields[0]=info`;
  console.log(`Fetching fixed private-party: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Strapi API error:', response.status, response.statusText, errorText);
    throw new Error(`Strapi API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Successfully fetched fixed private-party content');
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.PRIVATE_PARTY,
      'ETag': `"private-party-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString(),
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function handleAboutContent(): Promise<Response> {
  console.log(`=== FETCHING ABOUT CONTENT (ULTRA-OPTIMIZED) ===`);
  
  // Optimized query with specific fields only
  let endpoint = `/api/about?fields[0]=info&populate=performers`;
  console.log(`Fetching simplified about content: ${STRAPI_CONFIG.url}${endpoint}`);

  let response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`All Strapi API attempts failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Successfully fetched simplified about content');
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.ABOUT,
      'ETag': `"about-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString(),
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
      'ETag': `"course-main-info-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString(),
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function handleHeroImageContent(): Promise<Response> {
  console.log(`=== FETCHING HERO-IMAGE CONTENT (OPTIMIZED) ===`);
  
  const endpoint = `/api/hero-image?populate=*`;
  console.log(`Fetching simplified hero-image: ${STRAPI_CONFIG.url}${endpoint}`);

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
  console.log(`Successfully fetched simplified hero-image content`);
  
  return new Response(JSON.stringify(data), {
    headers: { 
      ...CORS_HEADERS, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_HEADERS.HERO_IMAGE,
      'ETag': `"hero-image-${Date.now()}"`,
      'Last-Modified': new Date().toUTCString(),
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
      'Last-Modified': new Date().toUTCString(),
      'Vary': 'Accept-Encoding',
    },
  });
}

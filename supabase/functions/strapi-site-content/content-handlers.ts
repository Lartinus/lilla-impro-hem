
import { STRAPI_CONFIG, CORS_HEADERS, CACHE_HEADERS } from './config.ts';
import type { StrapiResponse } from './types.ts';

export async function handlePrivatePartyContent(): Promise<Response> {
  console.log(`=== FETCHING PRIVATE-PARTY CONTENT (FIXED) ===`);
  
  // Fixed: Removed invalid 'redbox' and 'info_efter_redbox' fields
  const endpoint = `/api/private-party?fields[0]=info`;
  console.log(`Fetching fixed private-party: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    console.error('Strapi API error:', response.status, response.statusText);
    // Fallback strategy: return empty data structure instead of throwing
    console.log('Using fallback empty data for private-party');
    return new Response(JSON.stringify({ data: { info: '' } }), {
      headers: { 
        ...CORS_HEADERS, 
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_HEADERS.PRIVATE_PARTY,
      },
    });
  }

  const data = await response.json();
  console.log('Successfully fetched fixed private-party content');
  
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
  
  // Simplified query - only essential fields to avoid errors
  let endpoint = `/api/about?fields[0]=info&populate=performers`;
  console.log(`Fetching simplified about content: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    console.error(`About API error: ${response.status} - ${response.statusText}`);
    // Fallback strategy
    console.log('Using fallback empty data for about');
    return new Response(JSON.stringify({ data: { info: '', performers: [] } }), {
      headers: { 
        ...CORS_HEADERS, 
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_HEADERS.ABOUT,
      },
    });
  }

  const data = await response.json();
  console.log('Successfully fetched simplified about content');
  
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
  console.log(`=== FETCHING COURSE-MAIN-INFO CONTENT (FIXED) ===`);
  
  // Fixed: Removed invalid 'redbox' and 'info_efter_redbox' fields  
  const endpoint = `/api/course-main-info?fields[0]=info`;
  console.log(`Fetching fixed course-main-info: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    console.error(`Course main info API error: ${response.status} - ${response.statusText}`);
    // Fallback strategy
    console.log('Using fallback empty data for course-main-info');
    return new Response(JSON.stringify({ data: { info: '' } }), {
      headers: { 
        ...CORS_HEADERS, 
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_HEADERS.COURSE_MAIN_INFO,
      },
    });
  }

  const data = await response.json();
  console.log(`Successfully fetched fixed course-main-info content`);
  
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
  
  // Simplified query to avoid errors
  const endpoint = `/api/hero-image?populate=*`;
  console.log(`Fetching simplified hero-image: ${STRAPI_CONFIG.url}${endpoint}`);

  const response = await fetch(`${STRAPI_CONFIG.url}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_CONFIG.token}`,
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'If-None-Match': '*',
    },
  });

  if (!response.ok) {
    console.error(`Hero image API error: ${response.status} - ${response.statusText}`);
    // Fallback strategy
    console.log('Using fallback empty data for hero-image');
    return new Response(JSON.stringify({ data: { bild: null } }), {
      headers: { 
        ...CORS_HEADERS, 
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_HEADERS.HERO_IMAGE,
      },
    });
  }

  const data = await response.json();
  console.log(`Successfully fetched simplified hero-image content`);
  
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
    console.error(`${contentType} API error: ${response.status} - ${response.statusText}`);
    // Fallback strategy
    console.log(`Using fallback empty data for ${contentType}`);
    return new Response(JSON.stringify({ data: null }), {
      headers: { 
        ...CORS_HEADERS, 
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_HEADERS.DEFAULT,
      },
    });
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

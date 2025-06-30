
export const STRAPI_CONFIG = {
  token: Deno.env.get('STRAPI_API_TOKEN'),
  url: Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com',
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Phase 2: More aggressive caching
export const CACHE_HEADERS = {
  PRIVATE_PARTY: 'public, max-age=14400, s-maxage=28800', // 4 hours client, 8 hours CDN
  ABOUT: 'public, max-age=14400, s-maxage=28800', // 4 hours client, 8 hours CDN  
  COURSE_MAIN_INFO: 'public, max-age=21600, s-maxage=43200', // 6 hours client, 12 hours CDN
  HERO_IMAGE: 'public, max-age=14400, s-maxage=28800', // 4 hours client, 8 hours CDN
  DEFAULT: 'public, max-age=7200, s-maxage=14400', // 2 hours client, 4 hours CDN
};


export const STRAPI_CONFIG = {
  token: Deno.env.get('STRAPI_API_TOKEN'),
  url: Deno.env.get('STRAPI_URL') || 'https://reliable-chicken-da8c8aa37e.strapiapp.com',
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const CACHE_HEADERS = {
  PRIVATE_PARTY: 'public, max-age=7200', // 2 hours - increased from 1 hour
  ABOUT: 'public, max-age=7200', // 2 hours - increased from 1 hour
  COURSE_MAIN_INFO: 'public, max-age=14400', // 4 hours - increased from 2 hours
  HERO_IMAGE: 'public, max-age=7200', // 2 hours - increased from 1 hour
  DEFAULT: 'public, max-age=3600', // 1 hour - increased from 30 minutes
};

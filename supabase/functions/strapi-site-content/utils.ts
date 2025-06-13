
import { STRAPI_CONFIG, CORS_HEADERS } from './config.ts';

export function validateApiToken(): void {
  if (!STRAPI_CONFIG.token) {
    console.error('STRAPI_API_TOKEN not found in environment variables');
    throw new Error('API token not configured');
  }
}

export function createErrorResponse(error: Error, contentType: string): Response {
  console.error('Error in strapi-site-content function:', error);
  return new Response(JSON.stringify({ 
    error: error.message,
    strapiUrl: STRAPI_CONFIG.url,
    contentType: contentType || 'unknown'
  }), {
    status: 500,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export function createOptionsResponse(): Response {
  return new Response(null, { headers: CORS_HEADERS });
}

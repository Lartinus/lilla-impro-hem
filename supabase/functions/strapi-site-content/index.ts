
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  handlePrivatePartyContent,
  handleAboutContent,
  handleCourseMainInfoContent,
  handleHeroImageContent,
  handleGenericContent
} from './content-handlers.ts';
import { validateApiToken, createErrorResponse, createOptionsResponse } from './utils.ts';
import type { ContentRequestBody } from './types.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createOptionsResponse();
  }

  try {
    // Check if we have the required API token
    validateApiToken();

    const { type }: ContentRequestBody = await req.json();
    const contentType = type || 'site-settings';
    
    // Route to appropriate handler based on content type
    switch (contentType) {
      case 'private-party':
        return await handlePrivatePartyContent();
      
      case 'about':
        return await handleAboutContent();
      
      case 'course-main-info':
        return await handleCourseMainInfoContent();
      
      case 'hero-image':
        return await handleHeroImageContent();
      
      default:
        return await handleGenericContent(contentType);
    }
  } catch (error) {
    const contentType = await req.json().then(body => body.type).catch(() => 'unknown');
    return createErrorResponse(error as Error, contentType);
  }
});

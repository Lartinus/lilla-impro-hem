// Import the actual unified email template from edge functions
import { createUnifiedEmailTemplate } from '../../supabase/functions/_shared/email-template';

/**
 * Process template content with variables - matching exact logic from edge functions
 */
function processVariables(content: string, variables: Record<string, string | number>): string {
  let processed = content;
  
  Object.entries(variables).forEach(([key, value]) => {
    // Replace both {KEY} and [KEY] formats for compatibility
    const curlyRegex = new RegExp(`\\{${key}\\}`, 'gi');
    const squareRegex = new RegExp(`\\[${key}\\]`, 'gi');
    processed = processed.replace(curlyRegex, String(value));
    processed = processed.replace(squareRegex, String(value));
  });
  
  return processed;
}

/**
 * Create email template preview that matches actual sent emails exactly
 */
export function createEmailTemplatePreview(
  subject: string, 
  markdownContent: string, 
  backgroundImage?: string,
  variables?: Record<string, string | number>,
  isTicketTemplate: boolean = false
): string {
  let processedContent = markdownContent;
  let processedSubject = subject;
  
  // Process variables in both subject and content
  if (variables) {
    processedContent = processVariables(processedContent, variables);
    processedSubject = processVariables(processedSubject, variables);
  }

  // Handle ticket templates with exact logic from send-ticket-confirmation
  if (isTicketTemplate && variables) {
    // Format date and time properly - exactly like the edge function
    let formattedDate = String(variables.DATUM || 'Datum ej specificerat');
    let formattedTime = '';
    
    try {
      const showDateTime = new Date(String(variables.DATUM));
      formattedDate = showDateTime.toLocaleDateString('sv-SE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      formattedTime = showDateTime.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    // Add ticket details section exactly like in send-ticket-confirmation
    const contentWithTicketInfo = `

H2: Dina biljettdetaljer

Datum: ${formattedDate}
Tid: ${formattedTime}
Plats: ${variables.show_location || 'Lilla Improteatern, Teatergatan 3, Stockholm'}
Biljetter: ${(parseInt(String(variables.regular_tickets || '0')) + parseInt(String(variables.discount_tickets || '0')))} st
Biljettkod: ${variables.BILJETTKOD}

[QR_CODE_PLACEHOLDER]

Visa denna QR-kod vid entrén`;

    processedContent += contentWithTicketInfo;
  }

  // Use the actual unified email template from edge functions - exactly like the edge function
  let finalHtml = createUnifiedEmailTemplate(
    processedSubject, 
    processedContent, 
    backgroundImage
  );

  // Replace QR code placeholder with preview image - exactly like the edge function
  finalHtml = finalHtml.replace(
    '[QR_CODE_PLACEHOLDER]', 
    `<div style="margin: 20px 0;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjhmOCIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OxPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlFSLWtvZDwvdGV4dD48L3N2Zz4=" alt="QR Code" style="max-width: 200px; display: block;"></div>`
  );

  // Replace unsubscribe URL with preview link
  const unsubscribeEmail = String(variables?.buyer_email || variables?.email || 'preview@example.com');
  finalHtml = finalHtml.replace(
    '{UNSUBSCRIBE_URL}', 
    `https://improteatern.se/avprenumerera?email=${encodeURIComponent(unsubscribeEmail)}`
  );

  return finalHtml;
}

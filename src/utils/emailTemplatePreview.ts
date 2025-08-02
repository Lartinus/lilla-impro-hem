// Import the actual unified email template from edge functions
import { createUnifiedEmailTemplate } from '../../supabase/functions/_shared/unified-email-template';

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
    // Format date exactly like in edge function
    let formattedDateTime = String(variables.DATUM || 'Datum ej specificerat');
    if (variables.DATUM) {
      try {
        const showDate = new Date(String(variables.DATUM));
        const formattedDate = showDate.toLocaleDateString('sv-SE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const formattedTime = showDate.toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit'
        });
        formattedDateTime = `${formattedDate} kl ${formattedTime}`;
      } catch (e) {
        console.log('Date formatting failed:', e);
      }
    }
    
    // Add ticket details section exactly like in send-ticket-confirmation
    const ticketDetails = `

H2: Dina biljettdetaljer

**Föreställning:** ${variables.FORESTALLNING}
**Datum och tid:** ${formattedDateTime}
**Plats:** ${variables.show_location || 'Lilla Improteatern, Teatergatan 3, Stockholm'}
**Antal biljetter:** ${(parseInt(String(variables.regular_tickets || '0')) + parseInt(String(variables.discount_tickets || '0')))} st
**Biljettkod:** ${variables.BILJETTKOD}

Visa denna QR-kod vid entrén:
[QR_CODE_PLACEHOLDER]

**Viktig information:**
- Kom i god tid innan föreställningen börjar
- Biljetten gäller endast för angiven föreställning och datum
- Vid frågor, kontakta oss på info@improteatern.se`;

    processedContent += ticketDetails;
  }

  // Use the actual unified email template from edge functions
  let finalHtml = createUnifiedEmailTemplate(
    processedSubject, 
    processedContent, 
    backgroundImage,
    'Improvisationsteater • Kurser • Föreställningar'
  );

  // Replace QR code placeholder with preview image
  finalHtml = finalHtml.replace(
    '[QR_CODE_PLACEHOLDER]', 
    `<div style="margin: 20px 0; text-align: center;">
      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjhmOCIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OxPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlFSLWtvZDwvdGV4dD48L3N2Zz4=" 
           alt="QR Code Placeholder" 
           style="max-width: 200px; height: 200px; border: 2px dashed #ccc; border-radius: 8px;">
    </div>`
  );

  // Replace unsubscribe URL with preview link
  const unsubscribeEmail = String(variables?.buyer_email || variables?.email || 'preview@example.com');
  finalHtml = finalHtml.replace(
    '{UNSUBSCRIBE_URL}', 
    `https://improteatern.se/avprenumerera?email=${encodeURIComponent(unsubscribeEmail)}`
  );

  return finalHtml;
}

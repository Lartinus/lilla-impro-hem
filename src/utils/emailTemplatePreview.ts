import { convertMarkdownToHtml, convertMarkdownToHtmlWithVariables } from './markdownHelpers';

export function createEmailTemplatePreview(
  subject: string, 
  markdownContent: string, 
  backgroundImage?: string,
  variables?: Record<string, string>,
  isTicketTemplate: boolean = false
): string {
  // For ticket templates, use the same exact logic as send-ticket-confirmation
  if (isTicketTemplate && variables) {
    // Process variables first (same as edge function)
    let processedContent = markdownContent;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      processedContent = processedContent.replace(regex, value);
    });
    
    // Format date and time properly like in the edge function
    let formattedDate = variables.DATUM || 'Datum';
    let formattedTime = '';
    
    try {
      if (formattedDate && formattedDate !== 'Datum') {
        const showDateTime = new Date(formattedDate);
        formattedDate = showDateTime.toLocaleDateString('sv-SE', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        formattedTime = showDateTime.toLocaleTimeString('sv-SE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      console.error('Error formatting date in preview:', error);
    }

    // Add ticket details exactly like edge function 
    const contentWithTicketInfo = processedContent + `

H2: Dina biljettdetaljer

Datum: ${formattedDate}
Tid: ${formattedTime}
Plats: Lilla Improteatern, Teatergatan 3, Stockholm
Biljetter: 2 st
Biljettkod: ${variables.BILJETTKOD || 'BILJETTKOD'}

[QR_CODE_PLACEHOLDER]

Visa denna QR-kod vid entrén`;

    // Create the unified template structure (same as edge function)
    const unifiedHtml = createUnifiedEmailTemplatePreview(
      subject,
      contentWithTicketInfo,
      backgroundImage
    );

    // Replace QR code placeholder with visual placeholder
    return unifiedHtml.replace(
      '[QR_CODE_PLACEHOLDER]', 
      `<div style="margin: 20px 0;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjhmOCIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OxPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlFSLWtvZDwvdGV4dD48L3N2Zz4=" alt="QR Code Placeholder" style="max-width: 200px; display: block;"></div>`
    );
  }
  
  // For non-ticket templates, use regular markdown conversion
  const htmlContent = variables 
    ? convertMarkdownToHtmlWithVariables(markdownContent, variables)
    : convertMarkdownToHtml(markdownContent);
  
  return createUnifiedEmailTemplatePreview(subject, markdownContent, backgroundImage);
}

// Create unified template preview that matches the actual email structure
function createUnifiedEmailTemplatePreview(
  subject: string, 
  content: string, 
  backgroundImage?: string
): string {
  // Process content to handle headers and paragraphs (same logic as unified-email-template.ts)
  const processedContent = content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Handle H1 headers
      if (trimmed.startsWith('H1: ')) {
        const headerText = trimmed.substring(4);
        return `<h1 style="font-family: 'Tanker', 'Helvetica Neue', sans-serif !important; font-size: 32px; color: #333333 !important; margin: 24px 0 16px 0; font-weight: 400 !important; line-height: 1.2;">${headerText}</h1>`;
      }
      
      // Handle H2 headers - FIXED to use Satoshi bold 16px
      if (trimmed.startsWith('H2: ')) {
        const headerText = trimmed.substring(4);
        return `<h2 style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif !important; font-size: 16px; color: #333333 !important; margin: 20px 0 12px 0; font-weight: 700 !important; line-height: 1.2;">${headerText}</h2>`;
      }
      
      // Regular paragraphs
      return `<p style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif !important; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; line-height: 1.6;">${trimmed}</p>`;
    })
    .filter(line => line)
    .join('');
  
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Tanker:wght@400&display=swap" rel="stylesheet">
  <style>
    * {
      color-scheme: light !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Satoshi', 'Helvetica Neue', sans-serif; background-color: #f5f5f5 !important; line-height: 1.6; color-scheme: light !important;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white !important; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    ${backgroundImage ? `
      <div style="width: 100%; height: 200px; background-image: url('${backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
      </div>
    ` : ''}
    
    <div style="padding: 20px; background-color: #ffffff !important; color: #333333 !important;">
      ${processedContent}
    </div>
    
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; color: white !important; text-align: center;">
      <div style="font-family: 'Tanker', 'Helvetica Neue', sans-serif !important; font-size: 24px; font-weight: 400 !important; margin-bottom: 8px; color: white !important;">
        LILLA IMPROTEATERN
      </div>
      <div style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif !important; font-size: 14px; opacity: 0.9; margin-bottom: 16px; color: white !important;">
        Improvisationsteater • Kurser • Föreställningar
      </div>
      <div style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif !important; font-size: 12px; opacity: 0.8; color: white !important;">
        <a href="https://improteatern.se" style="color: white !important; text-decoration: none;">improteatern.se</a>
      </div>
    </div>
    
  </div>
</body>
</html>`;
}
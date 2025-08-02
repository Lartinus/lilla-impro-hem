import { convertMarkdownToHtml, convertMarkdownToHtmlWithVariables } from './markdownHelpers';

export function createEmailTemplatePreview(
  subject: string, 
  markdownContent: string, 
  backgroundImage?: string,
  variables?: Record<string, string | number>,
  isTicketTemplate: boolean = false
): string {
  // Always process variables first - use curly braces format like edge function
  let processedContent = markdownContent;
  let processedSubject = subject;
  
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      // Use curly braces format like the edge function
      const curlyRegex = new RegExp(`\\{${key}\\}`, 'gi');
      processedContent = processedContent.replace(curlyRegex, String(value));
      processedSubject = processedSubject.replace(curlyRegex, String(value));
    });
  }

  // For ticket templates, add the exact same ticket details as the edge function
  if (isTicketTemplate && variables) {
    // Format date and time properly like in the edge function
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
        console.log('Date formatting failed, using original:', e);
      }
    }
    
    // Add ticket details section exactly like in edge function
    const ticketDetailsHtml = `

H2: Dina biljetter

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

    // Add ticket details to content
    processedContent += ticketDetailsHtml;
    
    // Process the ticket details through unified template and replace QR placeholder
    return createUnifiedEmailTemplatePreview(processedSubject, processedContent, backgroundImage)
      .replace('[QR_CODE_PLACEHOLDER]', `<div style="margin: 20px 0; text-align: center;"><img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjhmOCIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjQiLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5OxPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlFSLWtvZDwvdGV4dD48L3N2Zz4=" alt="QR Code Placeholder" style="max-width: 200px; height: 200px; border: 2px dashed #ccc; border-radius: 8px;"></div>`)
      .replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(String(variables.buyer_email || 'preview@example.com'))}`);
  }
  
  // For non-ticket templates, just use unified template
  return createUnifiedEmailTemplatePreview(processedSubject, processedContent, backgroundImage)
    .replace('{UNSUBSCRIBE_URL}', 'https://improteatern.se/avprenumerera?email=preview@example.com');
}

// Create unified template preview that matches the actual email structure exactly
function createUnifiedEmailTemplatePreview(
  subject: string, 
  content: string, 
  backgroundImage?: string
): string {
  // Process content to handle headers, bold text, and paragraphs - EXACTLY like the edge function
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
      
      // Handle H2 headers
      if (trimmed.startsWith('H2: ')) {
        const headerText = trimmed.substring(4);
        return `<h2 style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif !important; font-size: 16px; color: #333333 !important; margin: 20px 0 12px 0; font-weight: 700 !important; line-height: 1.2;">${headerText}</h2>`;
      }
      
      // Process bold text and other formatting
      let processedLine = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Regular paragraphs
      return `<p style="font-family: 'Satoshi', 'Helvetica Neue', sans-serif !important; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; line-height: 1.6;">${processedLine}</p>`;
    })
    .filter(line => line)
    .join('');

  // Use the exact same HTML structure as the edge function's unified template
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
        <br><br>
        <a href="{UNSUBSCRIBE_URL}" style="color: white !important; text-decoration: underline; font-size: 10px;">Avsluta prenumeration</a>
      </div>
    </div>
    
  </div>
</body>
</html>`;
}
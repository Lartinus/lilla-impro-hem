import { convertMarkdownToHtml, convertMarkdownToHtmlWithVariables } from './markdownHelpers';

export function createEmailTemplatePreview(
  subject: string, 
  markdownContent: string, 
  backgroundImage?: string,
  variables?: Record<string, string>,
  isTicketTemplate: boolean = false
): string {
  // For ticket templates, use the same logic as send-ticket-confirmation
  if (isTicketTemplate && variables) {
    // Format date and time properly like in the edge function
    let formattedDate = variables.DATUM || 'Datum';
    let formattedTime = variables.TID || 'Tid';
    
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

    // Add the same content structure as send-ticket-confirmation
    const contentWithTicketInfo = markdownContent + `

H2: Dina biljettdetaljer

Datum: ${formattedDate}
Tid: ${formattedTime}
Plats: ${variables.PLATS || 'Plats'}
Biljetter: ${variables.ANTAL || '1'} st
Biljettkod: ${variables.BILJETTKOD || 'BILJETTKOD'}

[QR_CODE_PLACEHOLDER]

Visa denna QR-kod vid entrén`;

    // Process content with variables first
    let processedContent = contentWithTicketInfo;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      processedContent = processedContent.replace(regex, value);
    });

    // Create the unified template structure (same as edge function)
    const unifiedHtml = createUnifiedEmailTemplatePreview(
      subject,
      processedContent,
      backgroundImage
    );

    // Replace QR code placeholder with visual placeholder
    return unifiedHtml.replace(
      '[QR_CODE_PLACEHOLDER]', 
      `<div style="margin: 20px 0; text-align: center;"><div style="display: inline-block; background-color: #f8f8f8; border: 2px dashed #ccc; padding: 20px; border-radius: 8px; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; flex-direction: column;"><div style="font-size: 60px; margin-bottom: 10px;">📱</div><div style="font-size: 14px; color: #666;">QR-kod</div></div></div>`
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
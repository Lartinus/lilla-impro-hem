/**
 * Unified email template function that matches the design used in SimpleEmailBuilder
 * Used for all automatic emails (newsletter, course confirmations, inquiries, etc.)
 */

export function createUnifiedEmailTemplate(
  subject: string, 
  content: string, 
  backgroundImage?: string,
  customFooter?: string
): string {
  // Process content to handle headers and paragraphs (same logic as SimpleEmailBuilder)
  const processedContent = content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Handle H1 headers
      if (trimmed.startsWith('H1: ')) {
        const headerText = trimmed.substring(4);
        return `<h1 style="font-family: 'Tanker', 'Impact', 'Arial Black', 'Helvetica Neue', sans-serif !important; font-size: 32px; color: #333333 !important; margin: 24px 0 16px 0; font-weight: 400 !important; line-height: 1.2; font-display: swap;">${headerText}</h1>`;
      }
      
      // Handle H2 headers
      if (trimmed.startsWith('H2: ')) {
        const headerText = trimmed.substring(4);
        return `<h2 style="font-family: 'Tanker', 'Impact', 'Arial Black', 'Helvetica Neue', sans-serif !important; font-size: 24px; color: #333333 !important; margin: 20px 0 12px 0; font-weight: 400 !important; line-height: 1.2; font-display: swap;">${headerText}</h2>`;
      }
      
      // Regular paragraphs
      return `<p style="font-family: 'Satoshi', 'Helvetica Neue', Arial, sans-serif !important; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; line-height: 1.6; font-display: swap;">${trimmed}</p>`;
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
    /* Force light mode and improve font rendering */
    * {
      color-scheme: light !important;
    }
    /* Improved Tanker font fallbacks */
    .tanker-font {
      font-family: 'Tanker', 'Impact', 'Arial Black', 'Helvetica Neue', sans-serif !important;
      font-weight: 400 !important;
      font-display: swap !important;
    }
    .satoshi-font {
      font-family: 'Satoshi', 'Helvetica Neue', Arial, sans-serif !important;
      font-display: swap !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Satoshi', Arial, sans-serif; background-color: #f5f5f5 !important; line-height: 1.6; color-scheme: light !important;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white !important; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    ${backgroundImage ? `
      <div style="width: 100%; height: 200px; background-image: url('${backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
      </div>
    ` : ''}
    
    <div style="padding: 20px; background-color: #ffffff !important; color: #333333 !important;">
      ${processedContent}
    </div>
    
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; color: white !important; text-align: center;">
      <div style="font-family: 'Tanker', 'Impact', 'Arial Black', 'Helvetica Neue', sans-serif !important; font-size: 24px; font-weight: 400 !important; margin-bottom: 8px; color: white !important; font-display: swap;">
        LILLA IMPROTEATERN
      </div>
      <div style="font-family: 'Satoshi', 'Helvetica Neue', Arial, sans-serif !important; font-size: 14px; opacity: 0.9; margin-bottom: 16px; color: white !important; font-display: swap;">
        ${customFooter || 'Improvisationsteater • Kurser • Föreställningar'}
      </div>
      <div style="font-family: 'Satoshi', 'Helvetica Neue', Arial, sans-serif !important; font-size: 12px; opacity: 0.8; color: white !important; font-display: swap;">
        <a href="https://improteatern.se" style="color: white !important; text-decoration: none;">improteatern.se</a>
      </div>
    </div>
    
  </div>
</body>
</html>`;
}

/**
 * Convert text to HTML with proper formatting for email content
 */
export function convertTextToHtml(text: string): string {
  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
    // Remove any unwanted footer text that might be in templates
    .replace(/<p>\s*Med vänliga hälsningar.*?<\/p>/gi, '')
    .replace(/<p>\s*LILLA IMPROTEATERN.*?<\/p>/gi, '');
}
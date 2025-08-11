function convertTextToHtml(text: string): string {
  // Convert text to HTML with proper heading support
  return text
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .replace(/LILLA IMPROTEATERN.*?Avprenumerera här/s, '') // Remove extra footer text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Handle HTML-style headings (case insensitive)
      if (trimmed.match(/^<h1[^>]*>.*<\/h1>$/i)) {
        const content = trimmed.replace(/<\/?h1[^>]*>/gi, '');
        return `<h1 class="tanker-font" style="font-family: 'Tanker', 'Impact', 'Arial Black', 'Franklin Gothic Bold', 'Helvetica Bold', sans-serif; font-size: 32px; color: #333333 !important; margin: 0 0 24px 0; text-align: left; font-weight: 400; line-height: 1.2;">${content}</h1>`;
      }
      
      if (trimmed.match(/^<h2[^>]*>.*<\/h2>$/i)) {
        const content = trimmed.replace(/<\/?h2[^>]*>/gi, '');
        return `<h2 style="font-family: 'Satoshi', Arial, sans-serif; font-size: 18px; color: #333333 !important; margin: 0 0 20px 0; text-align: left; font-weight: 700; line-height: 1.3;">${content}</h2>`;
      }
      
      // Handle markdown-style headings
      if (trimmed.startsWith('H1:')) {
        const content = trimmed.substring(3).trim();
        return `<h1 class="tanker-font" style="font-family: 'Tanker', 'Impact', 'Arial Black', 'Franklin Gothic Bold', 'Helvetica Bold', sans-serif; font-size: 32px; color: #333333 !important; margin: 0 0 24px 0; text-align: left; font-weight: 400; line-height: 1.2;">${content}</h1>`;
      }
      
      if (trimmed.startsWith('H2:')) {
        const content = trimmed.substring(3).trim();
        return `<h2 style="font-family: 'Satoshi', Arial, sans-serif; font-size: 18px; color: #333333 !important; margin: 0 0 20px 0; text-align: left; font-weight: 700; line-height: 1.3;">${content}</h2>`;
      }
      
      // Remove remaining HTML tags for regular paragraphs
      const cleanText = trimmed.replace(/<[^>]*>/g, '');
      
      // All other text becomes paragraphs with consistent styling
      return `<p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; text-align: left; line-height: 1.6;">${cleanText}</p>`;
    })
    .filter(line => line) // Remove empty lines
    .join('');
}

export function createUnifiedEmailTemplate(
  subject: string, 
  content: string, 
  backgroundImage?: string,
  options?: { showUnsubscribe?: boolean }
): string {
  // Always convert content to clean HTML
  const cleanContent = convertTextToHtml(content);
  
  return `<!DOCTYPE html>
<html lang="sv" style="color-scheme: light only;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="color-scheme" content="light only">
  <title>${subject}</title>
  
  <!-- Font loading via link tags for better email client compatibility -->
  <link href="https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
  
  <style>
    /* Import fonts with fallbacks */
    @import url('https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap');
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
    
    /* Force light mode for all email clients */
    * {
      color-scheme: light only !important;
    }
    
    /* Fallbacks for email clients that don't support web fonts */
    .tanker-font { 
      font-family: 'Tanker', 'Impact', 'Arial Black', 'Franklin Gothic Bold', 'Helvetica Bold', sans-serif !important; 
      font-weight: 400 !important;
    }
    .satoshi-font { 
      font-family: 'Satoshi', 'Helvetica Neue', 'Arial', sans-serif !important; 
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #E8E8E8 !important; color-scheme: light only; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; text-size-adjust: 100%;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0; padding: 0; background-color: #E8E8E8 !important;">
    <tr>
      <td style="padding: 0; background-color: #E8E8E8 !important;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: transparent;">
          
          <!-- Red Header Border -->
          <tr>
            <td style="padding: 0; background-color: #DC2626; height: 5px; line-height: 5px; font-size: 5px;">&nbsp;</td>
          </tr>
          
          ${backgroundImage ? `
          <!-- Header Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${backgroundImage}" alt="Header image" style="width: 100% !important; max-width: 600px !important; height: auto !important; display: block; margin: 0 auto; object-fit: cover;">
            </td>
          </tr>
          ` : ''}
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: #ffffff; ${backgroundImage ? 'margin-top: -20px; border-radius: 16px 16px 0 0; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);' : ''} padding: 40px; font-family: 'Satoshi', Arial, sans-serif; line-height: 1.6; color: #333333 !important;">
                ${cleanContent}
                
                <!-- Signature -->
                <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e8e8e8; margin-top: 32px;">
                  <p style="font-size: 14px; color: #999999 !important; margin: 0 0 8px 0; font-family: 'Satoshi', Arial, sans-serif;">Med vänliga hälsningar</p>
                  <p style="font-size: 18px; font-weight: 500; color: #1a1a1a !important; margin: 0; font-family: 'Satoshi', Arial, sans-serif;">Lilla Improteatern</p>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #dc2626 !important; padding: 40px; text-align: center;">
              <a href="https://improteatern.se" style="display: block; text-decoration: none;">
                <img src="https://gcimnsbeexkkqragmdzo.supabase.co/storage/v1/object/public/images/LillaImproteatern-white.png" alt="Lilla Improteatern" style="height: 32px; width: auto; margin: 0 0 16px 0; display: block; margin-left: auto; margin-right: auto;">
              </a>
              ${options?.showUnsubscribe === false ? '' : `
              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.9) !important; margin: 0; font-family: 'Satoshi', Arial, sans-serif;">
                <a href="{UNSUBSCRIBE_URL}" style="color: rgba(255, 255, 255, 0.9) !important; text-decoration: underline;">Avprenumerera</a>
              </p>
              `}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
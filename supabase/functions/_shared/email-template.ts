function convertTextToHtml(text: string): string {
  // Clean and convert text to HTML
  return text
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/LILLA IMPROTEATERN.*?Avprenumerera här/s, '') // Remove extra footer text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Handle headers (h1, h2, h3, h4)
      if (trimmed.startsWith('####')) {
        const headerText = trimmed.replace(/^####\s*/, '');
        return `<h4 style="font-family: 'Tanker', 'Arial Black', Impact, sans-serif; font-size: 18px; color: #1a1a1a !important; margin: 20px 0 12px 0; text-align: center;">${headerText}</h4>`;
      }
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s*/, '');
        return `<h3 style="font-family: 'Tanker', 'Arial Black', Impact, sans-serif; font-size: 20px; color: #1a1a1a !important; margin: 22px 0 14px 0; text-align: center;">${headerText}</h3>`;
      }
      if (trimmed.startsWith('##')) {
        const headerText = trimmed.replace(/^##\s*/, '');
        return `<h2 style="font-family: 'Tanker', 'Arial Black', Impact, sans-serif; font-size: 24px; color: #1a1a1a !important; margin: 24px 0 16px 0; text-align: center;">${headerText}</h2>`;
      }
      if (trimmed.startsWith('#')) {
        const headerText = trimmed.replace(/^#\s*/, '');
        return `<h1 style="font-family: 'Tanker', 'Arial Black', Impact, sans-serif; font-size: 28px; color: #1a1a1a !important; margin: 28px 0 18px 0; text-align: center;">${headerText}</h1>`;
      }
      
      // Handle regular paragraphs - left aligned
      return `<p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; text-align: left;">${trimmed}</p>`;
    })
    .filter(line => line) // Remove empty lines
    .join('');
}

export function createUnifiedEmailTemplate(
  subject: string, 
  content: string, 
  backgroundImage?: string
): string {
  // Always convert content to clean HTML
  const cleanContent = convertTextToHtml(content);
  
  return `<!DOCTYPE html>
<html lang="sv" style="color-scheme: light only;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <title>${subject}</title>
  <style>
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
    @import url('https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap');
    
    /* Force light mode for all email clients */
    * {
      color-scheme: light only !important;
    }
    
    /* Fallbacks for email clients that don't support web fonts */
    .tanker-font { font-family: 'Tanker', 'Arial Black', Impact, sans-serif !important; }
    .satoshi-font { font-family: 'Satoshi', Arial, sans-serif !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff !important; color-scheme: light only;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0; padding: 0; background-color: #ffffff !important;">
    <tr>
      <td style="padding: 0; background-color: #ffffff !important;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff !important;">
          <!-- Content Area -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff !important; font-family: 'Satoshi', Arial, sans-serif; line-height: 1.6; color: #333333 !important;">
              ${cleanContent}
              
              <!-- Signature -->
              <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e8e8e8; margin-top: 32px;">
                <p style="font-size: 14px; color: #999999 !important; margin: 0 0 8px 0; font-family: 'Satoshi', Arial, sans-serif;">Med vänliga hälsningar</p>
                <p style="font-size: 18px; font-weight: 500; color: #1a1a1a !important; margin: 0; font-family: 'Satoshi', Arial, sans-serif;">Lilla Improteatern</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #dc2626 !important; padding: 40px; text-align: center;">
              ${backgroundImage ? `<img src="${backgroundImage}" alt="Background" style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 0;">` : ''}
              <div style="position: relative; z-index: 1;">
                <h1 style="font-family: 'Tanker', 'Arial Black', Impact, sans-serif; font-size: 32px; color: white !important; margin: 0 0 16px 0; font-weight: 400;">LILLA IMPROTEATERN</h1>
                <p style="font-size: 14px; color: rgba(255, 255, 255, 0.9) !important; margin: 0; font-family: 'Satoshi', Arial, sans-serif;">
                  <a href="{UNSUBSCRIBE_URL}" style="color: rgba(255, 255, 255, 0.9) !important; text-decoration: underline;">Avprenumerera</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
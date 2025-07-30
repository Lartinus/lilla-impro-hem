function convertTextToHtml(text: string): string {
  // Clean and convert text to HTML
  return text
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      // Handle headers (lines starting with ##)
      if (trimmed.startsWith('##')) {
        const headerText = trimmed.replace(/^##\s*/, '');
        return `<h2 style="font-family: 'Tanker', cursive, Arial, sans-serif; font-size: 24px; color: #1a1a1a; margin: 24px 0 16px 0; text-align: center;">${headerText}</h2>`;
      }
      
      // Handle regular paragraphs
      return `<p style="font-size: 16px; color: #333333; margin: 0 0 16px 0; text-align: center;">${trimmed}</p>`;
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
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
    @import url('https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap');
    
    /* Fallbacks for email clients that don't support web fonts */
    .tanker-font { font-family: 'Tanker', 'Arial Black', Impact, sans-serif !important; }
    .satoshi-font { font-family: 'Satoshi', Arial, sans-serif !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0; padding: 0;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Content Area -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff; font-family: 'Satoshi', Arial, sans-serif; line-height: 1.6;">
              ${cleanContent}
              
              <!-- Signature -->
              <div style="text-align: center; padding-top: 32px; border-top: 1px solid #e8e8e8; margin-top: 32px;">
                <p style="font-size: 14px; color: #999999; margin: 0 0 8px 0; font-family: 'Satoshi', Arial, sans-serif;">Med vänliga hälsningar</p>
                <p style="font-size: 18px; font-weight: 500; color: #1a1a1a; margin: 0; font-family: 'Satoshi', Arial, sans-serif;">Lilla Improteatern</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #dc2626; ${backgroundImage ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center;` : ''} padding: 40px; text-align: center;">
              <h1 style="font-family: 'Tanker', 'Arial Black', Impact, sans-serif; font-size: 32px; color: white; margin: 0 0 16px 0; font-weight: 400;">LILLA IMPROTEATERN</h1>
              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.9); margin: 0; font-family: 'Satoshi', Arial, sans-serif;">
                <a href="{UNSUBSCRIBE_URL}" style="color: rgba(255, 255, 255, 0.9); text-decoration: underline;">Avprenumerera</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
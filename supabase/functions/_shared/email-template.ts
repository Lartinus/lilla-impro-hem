export function createUnifiedEmailTemplate(
  subject: string, 
  content: string, 
  backgroundImage?: string
): string {
  // Check if content already contains footer to avoid duplicates
  const hasExistingFooter = content.includes('Med vänliga hälsningar') || 
                           content.includes('Lilla Improteatern') ||
                           content.includes('footer');
  
  return `
    <!DOCTYPE html>
    <html lang="sv" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
      <link href="https://api.fontshare.com/v2/css?f[]=tanker@400&display=swap" rel="stylesheet">
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background-color: #ffffff;
      line-height: 1.6;
      color: #333333;
    ">
      <!-- Main content container -->
      <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 0;
        background-color: #ffffff;
      ">
        <!-- White content area -->
        <div style="
          padding: 40px;
          background-color: #ffffff;
        ">
          ${content}
          
          ${!hasExistingFooter ? `
          <div style="
            text-align: center;
            padding-top: 24px;
            border-top: 1px solid #e8e8e8;
            margin-top: 24px;
          ">
            <p style="
              font-size: 14px;
              color: #999999;
              margin: 0 0 4px 0;
            ">
              Med vänliga hälsningar
            </p>
            <p style="
              font-size: 16px;
              font-weight: 500;
              color: #1a1a1a;
              margin: 0;
            ">
              Lilla Improteatern
            </p>
          </div>
          ` : ''}
        </div>
        
        <!-- Red footer with logo -->
        <div style="
          background-color: #dc2626;
          background-image: ${backgroundImage ? `url('${backgroundImage}')` : 'none'};
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          padding: 40px;
          text-align: center;
          margin: 0;
        ">
          <div style="
            font-family: 'Tanker', cursive, Arial, sans-serif;
            font-size: 32px;
            color: white;
            margin: 0 0 16px 0;
            text-align: center;
          ">
            LILLA IMPROTEATERN
          </div>
          <div style="
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            margin: 0;
            text-align: center;
          ">
            <a href="{UNSUBSCRIBE_URL}" style="color: rgba(255, 255, 255, 0.9); text-decoration: underline;">
              Avprenumerera
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
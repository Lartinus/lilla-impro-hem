export function createSimpleEmailTemplate(subject: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <link href="https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Tanker&display=swap" rel="stylesheet">
  <style>
    * {
      color-scheme: light !important;
      background-color: inherit !important;
    }
    @media (prefers-color-scheme: dark) {
      * {
        background-color: white !important;
        color: #333333 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Satoshi', Arial, sans-serif; background-color: #f5f5f5 !important; line-height: 1.6; color-scheme: light !important;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white !important; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    <div style="padding: 20px; background-color: #ffffff !important; color: #333333 !important;">
      <h1 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 32px; color: #333333 !important; margin: 24px 0 16px 0; font-weight: 400; line-height: 1.2;">Tack för din bokning</h1>
      <p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; line-height: 1.6;">Din bokning är bekräftad</p>
      <div style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333 !important; line-height: 1.6;">
        ${content.replace(/\n/g, '<br>')}
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px; color: white; text-align: center;">
      <div style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 24px; font-weight: 400; margin-bottom: 8px;">
        LILLA IMPROTEATERN
      </div>
      <div style="font-family: 'Satoshi', Arial, sans-serif; font-size: 14px; opacity: 0.9; margin-bottom: 16px;">
        Improvisationsteater • Kurser • Föreställningar
      </div>
      <div style="font-family: 'Satoshi', Arial, sans-serif; font-size: 12px; opacity: 0.8;">
        <a href="https://improteatern.se" style="color: white; text-decoration: none;">improteatern.se</a>
      </div>
    </div>
    
  </div>
</body>
</html>`;
}
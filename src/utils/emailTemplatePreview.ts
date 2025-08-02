import { convertMarkdownToHtml, convertMarkdownToHtmlWithVariables } from './markdownHelpers';

export function createEmailTemplatePreview(
  subject: string, 
  markdownContent: string, 
  backgroundImage?: string,
  variables?: Record<string, string>,
  isTicketTemplate: boolean = false
): string {
  const hasBackground = backgroundImage && backgroundImage.trim() !== '';
  let htmlContent = variables 
    ? convertMarkdownToHtmlWithVariables(markdownContent, variables)
    : convertMarkdownToHtml(markdownContent);

  // Add ticket-specific content if this is a ticket confirmation template
  if (isTicketTemplate && variables) {
    const ticketDetailsSection = `
      <div style="background-color: #FFFFFF; border: 2px solid #DC2626; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #DC2626; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">🎭 Dina biljettdetaljer</h2>
        <div style="display: grid; gap: 8px;">
          <div><strong>Föreställning:</strong> ${variables.FÖRESTÄLLNING || 'Föreställning'}</div>
          <div><strong>Datum:</strong> ${variables.DATUM || 'Datum'}</div>
          <div><strong>Tid:</strong> ${variables.TID || 'Tid'}</div>
          <div><strong>Plats:</strong> ${variables.PLATS || 'Plats'}</div>
          <div><strong>Antal biljetter:</strong> ${variables.ANTAL || '1'}</div>
          <div><strong>Biljettkod:</strong> <code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${variables.BILJETTKOD || 'BILJETTKOD'}</code></div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <div style="display: inline-block; background-color: #f8f8f8; border: 2px dashed #ccc; padding: 20px; border-radius: 8px;">
          <div style="font-size: 60px; margin-bottom: 10px;">📱</div>
          <div style="font-size: 14px; color: #666;">QR-kod för entré</div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">Visa denna kod i entrén</div>
        </div>
      </div>
      
      <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h3 style="color: #DC2626; margin: 0 0 10px 0; font-size: 16px;">ℹ️ Viktig information</h3>
        <ul style="margin: 0; padding-left: 20px; color: #7F1D1D;">
          <li>Kom gärna 15 minuter före föreställningens start</li>
          <li>Visa denna bekräftelse eller QR-koden i entrén</li>
          <li>Vi rekommenderar att spara denna bekräftelse i din telefon</li>
          <li>Kontakta oss vid frågor: info@lillaimproteatern.se</li>
        </ul>
      </div>
    `;
    
    htmlContent += ticketDetailsSection;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="sv" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Titan+One&display=swap" rel="stylesheet">
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background-color: #EBEBEB;
      line-height: 1.6;
      color: #333333;
    ">
      <div style="max-width: 600px; margin: 0 auto; background-color: #EBEBEB;">
        ${hasBackground ? `
          <div style="
            text-align: center;
            padding: 0;
            margin: 0;
          ">
            <img src="${backgroundImage}" alt="" style="
              width: 600px;
              height: 400px;
              object-fit: cover;
              display: block;
              margin: 0 auto;
            "/>
          </div>
        ` : ''}
        
        <div style="
          max-width: 600px;
          margin: ${hasBackground ? '-50px auto 0' : '0 auto'};
          padding: 40px;
          background-color: #F3F3F3;
          border-radius: 10px;
          position: relative;
          z-index: 1;
        ">
          <div style="
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          ">
            ${htmlContent}
          </div>
        </div>
        
        <!-- Red footer -->
        <div style="
          width: 600px;
          height: 180px;
          background-color: #DC2626;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        ">
          <div style="
            font-family: 'Titan One', cursive;
            font-size: 32px;
            color: white;
            margin: 0 0 16px 0;
            line-height: 1;
          ">
            LILLA IMPROTEATERN
          </div>
          <div style="
            font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 16px;
            color: white;
            margin: 0;
            line-height: 1.2;
          ">
            Vill du inte längre få våra mejl? <a href="#" style="color: white; text-decoration: underline;">Avprenumerera här</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
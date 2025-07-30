import { convertMarkdownToHtml, convertMarkdownToHtmlWithVariables } from './markdownHelpers';

export function createEmailTemplatePreview(
  subject: string, 
  markdownContent: string, 
  backgroundImage?: string,
  variables?: Record<string, string>
): string {
  const hasBackground = backgroundImage && backgroundImage.trim() !== '';
  const htmlContent = variables 
    ? convertMarkdownToHtmlWithVariables(markdownContent, variables)
    : convertMarkdownToHtml(markdownContent);
  
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
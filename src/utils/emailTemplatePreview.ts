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
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background-color: #ffffff;
      line-height: 1.6;
      color: #333333;
    ">
      ${hasBackground ? `
        <div style="
          text-align: center;
          padding: 0;
          margin: 0;
        ">
          <img src="${backgroundImage}" alt="" style="
            width: 100%;
            max-width: 600px;
            height: auto;
            aspect-ratio: 1;
            object-fit: cover;
            display: block;
            margin: 0 auto;
          "/>
        </div>
      ` : ''}
      
      <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        background-color: #ffffff;
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
    </body>
    </html>
  `;
}
export function createSimpleEmailTemplate(subject: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sv" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background-color: #f0f0f0;
      line-height: 1.6;
      color: #333333;
    ">
      <div style="
        max-width: 600px;
        margin: 40px auto;
        padding: 40px;
        2px solid #000;
      ">
        <h1 style="
          font-size: 28px;
          font-weight: 400;
          margin: 0 0 8px 0;
          color: #1c1c1c;
          text-align: Left;
        ">
          Tack för din bokning
        </h1>
        <p style="
          font-size: 16px;
          color: #1c1c1c;
          margin: 0 0 40px 0;
          text-align: left;
        ">
          Din bokning är bekräftad
        </p>
        
        <div style="
          font-size: 16px;
          line-height: 1.6;
          color: #1c1c1c;
        ">
          ${content}
        </div>
      </div>
    </body>
    </html>
  `;
}
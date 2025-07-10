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
      background-color: #ffffff;
      line-height: 1.6;
      color: #333333;
    ">
      <div style="
        max-width: 600px;
        margin: 40px auto;
        padding: 40px;
        border: 2px solid #000;
        border-radius: 8px;
      ">
        <h1 style="
          font-size: 28px;
          font-weight: 400;
          margin: 0 0 8px 0;
          color: #1c1c1c;
          text-align: left;
        ">
          Tack för din bokning
        </h1>
        <p style="
          font-size: 16px;
          color: #1c1c1c;
          margin: 0 0 20px 0;
          text-align: left;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        ">
          Din bokning är bekräftad
        </p>
        
        <div style="
          font-size: 16px;
          line-height: 1.6;
          color: #1c1c1c;
          padding-top: 20px;
        ">
          ${content}
        </div>
        
        <div style="
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        ">
          <img 
            src="https://gcimnsbeeexkkqragmdzo.supabase.co/storage/v1/object/public/images/LIT_BoW_small.png" 
            alt="Lilla Improteatern" 
            style="
              max-width: 120px;
              height: auto;
            "
          />
        </div>
      </div>
    </body>
    </html>
  `;
}
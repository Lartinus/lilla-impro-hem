
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const purchase = await req.json();
    
    // Generate QR code URL (using a simple service for now)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(purchase.qr_data)}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Din biljett - ${purchase.show_title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .ticket { 
            max-width: 600px; 
            margin: 20px auto; 
            border: 2px solid #d32f2f; 
            border-radius: 10px; 
            overflow: hidden;
            background: #fff;
          }
          .ticket-header { 
            background: #d32f2f; 
            color: white; 
            padding: 20px; 
            text-align: center; 
          }
          .ticket-body { padding: 30px; }
          .ticket-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          .info-block { margin-bottom: 15px; }
          .info-label { font-weight: bold; color: #d32f2f; }
          .qr-section { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 2px dashed #d32f2f; 
          }
          .ticket-code { 
            font-size: 18px; 
            font-weight: bold; 
            letter-spacing: 2px; 
            color: #d32f2f; 
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <h1>${purchase.show_title}</h1>
            <p>BILJETT</p>
          </div>
          <div class="ticket-body">
            <div class="ticket-info">
              <div class="info-block">
                <div class="info-label">Datum & Tid:</div>
                <div>${purchase.show_date}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Plats:</div>
                <div>${purchase.show_location}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Köpare:</div>
                <div>${purchase.buyer_name}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Biljetter:</div>
                <div>${purchase.regular_tickets + purchase.discount_tickets} st</div>
              </div>
            </div>
            
            <div class="qr-section">
              <p><strong>Biljettkod:</strong></p>
              <div class="ticket-code">${purchase.ticket_code}</div>
              <br>
              <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px;">
              <p><small>Visa denna QR-kod vid entrén</small></p>
            </div>
          </div>
        </div>
        
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: #f5f5f5;">
          <h3>Viktig information:</h3>
          <ul>
            <li>Ta med dig denna biljett (utskriven eller på mobilen) till föreställningen</li>
            <li>Kom i god tid innan föreställningen börjar</li>
            <li>Kontakta oss på info@lit.se om du har frågor</li>
          </ul>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lilla Improteatern <noreply@improteatern.se>',
        to: [purchase.buyer_email],
        subject: `Din biljett - ${purchase.show_title}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email sending failed:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

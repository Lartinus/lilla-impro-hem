import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";
import { createUnifiedEmailTemplate } from "../_shared/email-template.ts";

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
    
    console.log(`Processing ticket confirmation for ${purchase.buyer_email} - show: ${purchase.show_title}`);

    // Get the email template from database (using AUTO: prefix)
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'AUTO: Biljettbekräftelse')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Could not fetch email template, using fallback:', templateError);
      // Fall back to original hardcoded template if database template not found
      return await sendFallbackTicketEmail(purchase, resendApiKey);
    }

    console.log('Using email template:', template.name);

    // First, try to add contact to Resend
    try {
      const contactData = {
        email: purchase.buyer_email,
        first_name: purchase.buyer_name.split(' ')[0] || purchase.buyer_name,
        last_name: purchase.buyer_name.split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
      };

      console.log('Adding ticket buyer as contact to Resend:', contactData);
      
      // Add contact
      const contactResponse = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audience_id: Deno.env.get('RESEND_AUDIENCE_ID') || 'default',
          ...contactData
        }),
      });

      if (contactResponse.ok) {
        console.log('Contact added successfully for ticket buyer');
      } else {
        console.log('Contact creation failed (continuing with email):', await contactResponse.text());
      }
    } catch (contactError) {
      console.log('Contact creation failed (continuing with email):', contactError);
      // Continue with email sending even if contact creation fails
    }

    // Personalize the template content (using same variable format as AutomaticEmailsManager)
    const variables = {
      NAMN: purchase.buyer_name,
      FORESTALLNING: purchase.show_title,
      DATUM: purchase.show_date,
      BILJETTKOD: purchase.ticket_code
    };

    let processedContent = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      processedContent = processedContent.replace(regex, value);
    });
    
    let personalizedSubject = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
    });

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(purchase.qr_data)}`;
    
    // Format date and time properly
    let formattedDate = purchase.show_date;
    let formattedTime = '';
    
    try {
      const showDateTime = new Date(purchase.show_date);
      formattedDate = showDateTime.toLocaleDateString('sv-SE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      formattedTime = showDateTime.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
    }

    // Add QR code and ticket details to the content before template processing
    const contentWithTicketInfo = processedContent + `

H2: Dina biljettdetaljer

Datum: ${formattedDate}
Tid: ${formattedTime}
Plats: ${purchase.show_location}
Biljetter: ${purchase.regular_tickets + purchase.discount_tickets} st
Biljettkod: ${purchase.ticket_code}

[QR_CODE_PLACEHOLDER]

Visa denna QR-kod vid entrén`;

    // Create styled email using unified template (let it handle all formatting)
    const htmlContent = createUnifiedEmailTemplate(
      personalizedSubject, 
      contentWithTicketInfo, 
      template.background_image
    )
    .replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(purchase.buyer_email)}`)
    .replace('[QR_CODE_PLACEHOLDER]', `<div style="margin: 20px 0;"><img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px; display: block;"></div>`);

    // Send the email with tags for better tracking
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lilla Improteatern <noreply@improteatern.se>',
        to: [purchase.buyer_email],
        subject: personalizedSubject,
        html: htmlContent,
        tags: [
          { name: 'type', value: 'ticket_confirmation' },
          { name: 'show', value: purchase.show_slug.replace(/[^a-zA-Z0-9_-]/g, '_') },
          { name: 'tickets', value: (purchase.regular_tickets + purchase.discount_tickets).toString() },
          { name: 'template', value: 'auto_ticket_confirmation' }
        ]
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email sending failed:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    console.log('Ticket confirmation email sent successfully using template:', template.name);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending ticket confirmation email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback function for when template is not found (keeps original functionality)
async function sendFallbackTicketEmail(purchase: any, resendApiKey: string) {
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

  // Send the email with tags for better tracking
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
      tags: [
        { name: 'type', value: 'ticket_confirmation_fallback' },
        { name: 'show', value: purchase.show_slug.replace(/[^a-zA-Z0-9_-]/g, '_') },
        { name: 'tickets', value: (purchase.regular_tickets + purchase.discount_tickets).toString() }
      ]
    }),
  });

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text();
    console.error('Email sending failed:', errorText);
    throw new Error(`Failed to send email: ${errorText}`);
  }

  console.log('Ticket confirmation email sent successfully (fallback)');

  return new Response(JSON.stringify({ success: true }), {
    headers: { corsHeaders, 'Content-Type': 'application/json' },
  });
}

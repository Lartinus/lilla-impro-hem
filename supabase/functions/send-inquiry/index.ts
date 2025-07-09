
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  type: 'corporate' | 'private';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  occasion?: string;
  requirements: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inquiryData: InquiryRequest = await req.json();
    
    console.log(`Processing ${inquiryData.type} inquiry from ${inquiryData.email}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save inquiry to database
    const { data: savedInquiry, error: dbError } = await supabase
      .from('inquiries')
      .insert({
        type: inquiryData.type,
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        company: inquiryData.company,
        occasion: inquiryData.occasion,
        requirements: inquiryData.requirements
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Inquiry saved to database:', savedInquiry.id);

    // Add contact to Resend
    try {
      const contactData = {
        email: inquiryData.email,
        first_name: inquiryData.name.split(' ')[0] || inquiryData.name,
        last_name: inquiryData.name.split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
      };

      console.log('Adding contact to Resend:', contactData);
      
      const contactResponse = await resend.contacts.create({
        audienceId: Deno.env.get('RESEND_AUDIENCE_ID') || 'default',
        ...contactData
      });

      console.log('Contact added successfully:', contactResponse);
    } catch (contactError: any) {
      console.log('Contact creation failed (continuing):', contactError);
    }

    // Send notification email to kontakt@improteatern.se
    const notificationSubject = inquiryData.type === 'corporate' 
      ? `Ny företagsförfrågan från ${inquiryData.company || inquiryData.name}`
      : `Ny privatförfrågan från ${inquiryData.name}`;

    const notificationContent = `
      <!DOCTYPE html>
      <html lang="sv" style="margin: 0; padding: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notificationSubject}</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background-color: #ffffff;
        line-height: 1.6;
        color: #333333;
      ">
        <!-- Header -->
        <div style="
          background-color: #ffffff;
          padding: 40px 20px 0;
          text-align: center;
        ">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="
              font-size: 24px;
              font-weight: 300;
              margin: 0 0 12px 0;
              color: #1a1a1a;
              letter-spacing: -0.025em;
            ">
              ${notificationSubject}
            </h1>
            <p style="
              font-size: 14px;
              color: #999999;
              margin: 0 0 40px 0;
            ">
              Förfrågan mottagen: ${new Date().toLocaleDateString('sv-SE')}
            </p>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 0 20px 40px;
        ">
          <div style="
            background-color: #ffffff;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 40px;
          ">
            <!-- Contact Details -->
            <div style="margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #1a1a1a; font-size: 14px;">Namn:</strong>
                    <span style="color: #333333; margin-left: 8px;">${inquiryData.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #1a1a1a; font-size: 14px;">E-post:</strong>
                    <span style="color: #333333; margin-left: 8px;">${inquiryData.email}</span>
                  </td>
                </tr>
                ${inquiryData.phone ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #1a1a1a; font-size: 14px;">Telefon:</strong>
                    <span style="color: #333333; margin-left: 8px;">${inquiryData.phone}</span>
                  </td>
                </tr>
                ` : ''}
                ${inquiryData.company ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #1a1a1a; font-size: 14px;">Företag:</strong>
                    <span style="color: #333333; margin-left: 8px;">${inquiryData.company}</span>
                  </td>
                </tr>
                ` : ''}
                ${inquiryData.occasion ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #1a1a1a; font-size: 14px;">Tillfälle:</strong>
                    <span style="color: #333333; margin-left: 8px;">${inquiryData.occasion}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #1a1a1a; font-size: 14px;">Typ:</strong>
                    <span style="color: #333333; margin-left: 8px;">${inquiryData.type === 'corporate' ? 'Företag' : 'Privat'}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Requirements -->
            <div>
              <h3 style="
                font-size: 16px;
                font-weight: 500;
                margin: 0 0 12px 0;
                color: #1a1a1a;
              ">
                Krav och önskemål:
              </h3>
              <div style="
                background-color: #f9f9f9;
                border-radius: 6px;
                padding: 16px;
                border-left: 3px solid #1a1a1a;
                font-size: 14px;
                line-height: 1.6;
                color: #333333;
                white-space: pre-wrap;
              ">
                ${inquiryData.requirements}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          background-color: #f9f9f9;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e8e8e8;
        ">
          <p style="
            font-size: 12px;
            color: #999999;
            margin: 0;
          ">
            Logga in på adminpanelen för att hantera förfrågan
          </p>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: ["kontakt@improteatern.se"],
      subject: notificationSubject,
      html: notificationContent,
      tags: [
        { name: 'type', value: 'inquiry-notification' },
        { name: 'inquiry_type', value: inquiryData.type }
      ]
    });

    // Send confirmation email to user
    const confirmationSubject = inquiryData.type === 'corporate' 
      ? `Bekräftelse av företagsförfrågan`
      : `Bekräftelse av förfrågan`;

    const confirmationContent = `
      <!DOCTYPE html>
      <html lang="sv" style="margin: 0; padding: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${confirmationSubject}</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        background-color: #ffffff;
        line-height: 1.6;
        color: #333333;
      ">
        <!-- Header -->
        <div style="
          background-color: #ffffff;
          padding: 40px 20px 0;
          text-align: center;
        ">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="
              font-size: 28px;
              font-weight: 300;
              margin: 0 0 12px 0;
              color: #1a1a1a;
              letter-spacing: -0.025em;
              line-height: 1.2;
            ">
              Tack för din förfrågan!
            </h1>
            <p style="
              font-size: 16px;
              color: #666666;
              margin: 0 0 40px 0;
              font-weight: 400;
            ">
              Vi återkommer så snart som möjligt
            </p>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="
          max-width: 600px;
          margin: 0 auto;
          padding: 0 20px 40px;
        ">
          <div style="
            background-color: #ffffff;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
            padding: 40px;
          ">
            <!-- Welcome Message -->
            <div style="margin-bottom: 32px;">
              <h2 style="
                font-size: 20px;
                font-weight: 400;
                margin: 0 0 12px 0;
                color: #1a1a1a;
              ">
                Hej ${inquiryData.name}!
              </h2>
              <p style="
                font-size: 16px;
                color: #666666;
                margin: 0 0 16px 0;
                line-height: 1.5;
              ">
                Vi har tagit emot din förfrågan och kommer att kontakta dig så snart som möjligt för att diskutera möjligheterna.
              </p>
              <p style="
                font-size: 16px;
                color: #666666;
                margin: 0;
                line-height: 1.5;
              ">
                ${inquiryData.type === 'corporate' 
                  ? 'Vi ser fram emot att skapa något fantastiskt för er organisation!' 
                  : 'Vi ser fram emot att göra ert tillfälle extra speciellt!'}
              </p>
            </div>

            <!-- Contact Info -->
            <div style="
              background-color: #f9f9f9;
              border-radius: 6px;
              padding: 20px;
              margin-bottom: 24px;
              border-left: 3px solid #1a1a1a;
            ">
              <p style="
                font-size: 14px;
                color: #666666;
                margin: 0;
                line-height: 1.5;
              ">
                <strong>Har du frågor?</strong><br>
                Kontakta oss på <a href="mailto:kontakt@improteatern.se" style="color: #1a1a1a; text-decoration: underline;">kontakt@improteatern.se</a><br>
                eller besök <a href="https://improteatern.se" style="color: #1a1a1a; text-decoration: underline;">improteatern.se</a>
              </p>
            </div>

            <!-- Signature -->
            <div style="
              text-align: center;
              padding-top: 24px;
              border-top: 1px solid #e8e8e8;
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
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [inquiryData.email],
      subject: confirmationSubject,
      html: confirmationContent,
      tags: [
        { name: 'type', value: 'inquiry-confirmation' },
        { name: 'inquiry_type', value: inquiryData.type }
      ]
    });

    console.log('All emails sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Förfrågan skickad!',
      inquiryId: savedInquiry.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-inquiry function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Ett fel uppstod när förfrågan skulle skickas',
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

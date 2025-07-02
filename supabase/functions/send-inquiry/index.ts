
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
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notificationSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background-color: #d32f2f; padding: 30px 40px;">
                    <h1 style="color: #ffffff; margin: 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">
                      ${notificationSubject}
                    </h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #d32f2f;">Namn:</strong><br>
                          <span style="color: #333; font-size: 16px;">${inquiryData.name}</span>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #d32f2f;">E-post:</strong><br>
                          <span style="color: #333; font-size: 16px;">${inquiryData.email}</span>
                        </td>
                      </tr>
                      
                      ${inquiryData.phone ? `
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #d32f2f;">Telefon:</strong><br>
                          <span style="color: #333; font-size: 16px;">${inquiryData.phone}</span>
                        </td>
                      </tr>
                      ` : ''}
                      
                      ${inquiryData.company ? `
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #d32f2f;">Företag:</strong><br>
                          <span style="color: #333; font-size: 16px;">${inquiryData.company}</span>
                        </td>
                      </tr>
                      ` : ''}
                      
                      ${inquiryData.occasion ? `
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #d32f2f;">Tillfälle:</strong><br>
                          <span style="color: #333; font-size: 16px;">${inquiryData.occasion}</span>
                        </td>
                      </tr>
                      ` : ''}
                      
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #d32f2f;">Vad de är ute efter:</strong><br>
                          <span style="color: #333; font-size: 16px; white-space: pre-wrap;">${inquiryData.requirements}</span>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 20px 0 10px 0;">
                          <strong style="color: #d32f2f;">Typ av förfrågan:</strong><br>
                          <span style="color: #333; font-size: 16px;">${inquiryData.type === 'corporate' ? 'Företag' : 'Privat'}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center;">
                    <p style="margin: 0; color: #666; font-size: 14px;">
                      Förfrågan mottagen: ${new Date().toLocaleString('sv-SE')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
      <html>
      <head>
        <meta charset="utf-8">
        <title>${confirmationSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background-color: #d32f2f; padding: 30px 40px;">
                    <h1 style="color: #ffffff; margin: 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">
                      Lilla Improteatern
                    </h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 30px 40px;">
                    <h2 style="color: #d32f2f; margin: 0 0 20px 0; font-size: 20px;">
                      Tack för din förfrågan!
                    </h2>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      Hej <strong>${inquiryData.name}</strong>,
                    </p>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      Vi har tagit emot din förfrågan och kommer att kontakta dig så snart som möjligt för att diskutera möjligheterna.
                    </p>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6;">
                      ${inquiryData.type === 'corporate' 
                        ? 'Vi ser fram emot att skapa något fantastiskt för er organisation!' 
                        : 'Vi ser fram emot att göra ert tillfälle extra speciellt!'}
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #f9f9f9; padding: 30px 40px;">
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; text-align: center;">
                      Med vänliga hälsningar,<br>
                      <strong style="color: #d32f2f;">Lilla Improteatern</strong>
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
                      Besök oss på <a href="https://improteatern.se" style="color: #d32f2f;">improteatern.se</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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

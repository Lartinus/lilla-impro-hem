
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUnifiedEmailTemplate } from '../_shared/email-template.ts';

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

    // Create notification email using clean design
    function createNotificationEmail(subject: string, inquiryData: any) {
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background-color: #f8f9fa;
          line-height: 1.6;
          color: #333333;
        ">
          <!-- Container -->
          <div style="
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          ">
            <!-- Header -->
            <div style="
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 32px;
              text-align: center;
            ">
              <h1 style="
                font-size: 24px;
                font-weight: 400;
                margin: 0;
                letter-spacing: -0.025em;
              ">${subject}</h1>
              <p style="
                margin: 8px 0 0 0;
                opacity: 0.8;
                font-size: 14px;
              ">${new Date().toLocaleDateString('sv-SE')}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <!-- Contact Details -->
              <div style="
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
              ">
                <h3 style="
                  font-size: 16px;
                  font-weight: 500;
                  margin: 0 0 16px 0;
                  color: #1a1a1a;
                ">Kontaktuppgifter</h3>
                
                <div style="
                  display: grid;
                  gap: 12px;
                  font-size: 14px;
                ">
                  <div>
                    <strong style="color: #666;">Namn:</strong> ${inquiryData.name}
                  </div>
                  <div>
                    <strong style="color: #666;">E-post:</strong> ${inquiryData.email}
                  </div>
                  ${inquiryData.phone ? `<div><strong style="color: #666;">Telefon:</strong> ${inquiryData.phone}</div>` : ''}
                  ${inquiryData.company ? `<div><strong style="color: #666;">Företag:</strong> ${inquiryData.company}</div>` : ''}
                  ${inquiryData.occasion ? `<div><strong style="color: #666;">Tillfälle:</strong> ${inquiryData.occasion}</div>` : ''}
                  <div>
                    <strong style="color: #666;">Typ:</strong> ${inquiryData.type === 'corporate' ? 'Företag' : 'Privat'}
                  </div>
                </div>
              </div>

              <!-- Requirements -->
              <div>
                <h3 style="
                  font-size: 16px;
                  font-weight: 500;
                  margin: 0 0 12px 0;
                  color: #1a1a1a;
                ">Krav och önskemål</h3>
                <div style="
                  background-color: #f8f9fa;
                  border-radius: 8px;
                  padding: 20px;
                  border-left: 4px solid #1a1a1a;
                  font-size: 14px;
                  line-height: 1.6;
                  white-space: pre-wrap;
                ">${inquiryData.requirements}</div>
              </div>
            </div>

            <!-- Footer -->
            <div style="
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            ">
              <p style="
                font-size: 12px;
                color: #666;
                margin: 0;
              ">Logga in på adminpanelen för att hantera förfrågan</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const notificationContent = createNotificationEmail(notificationSubject, inquiryData);

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

    // Get email template from database
    const templateName = inquiryData.type === 'corporate' 
      ? 'AUTO: Företagsförfrågan bekräftelse'
      : 'AUTO: Privatförfrågan bekräftelse';

    console.log(`Fetching email template: ${templateName}`);

    const { data: emailTemplate, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, content, background_image')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError) {
      console.error('Template fetch error:', templateError);
      throw new Error(`Could not fetch email template: ${templateError.message}`);
    }

    console.log('Email template fetched successfully');

    // Prepare variables for replacement
    const variables: Record<string, string> = {
      NAMN: inquiryData.name
    };

    if (inquiryData.type === 'corporate') {
      variables.FÖRETAG = inquiryData.company || '';
      variables.TILLFÄLLE = inquiryData.occasion || '';
    } else {
      variables.TILLFÄLLE = inquiryData.occasion || '';
    }

    // Replace variables in subject and content
    let personalizedSubject = emailTemplate.subject;
    let personalizedContent = emailTemplate.content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
      personalizedContent = personalizedContent.replace(regex, value);
    });

    // Create confirmation email using unified template
    const confirmationContent = createUnifiedEmailTemplate(
      personalizedSubject,
      personalizedContent,
      emailTemplate.background_image
    ).replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(inquiryData.email)}`);

    await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [inquiryData.email],
      subject: personalizedSubject,
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

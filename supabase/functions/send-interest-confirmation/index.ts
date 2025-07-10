import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InterestConfirmationRequest {
  name: string;
  email: string;
  interestTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, interestTitle }: InterestConfirmationRequest = await req.json();

    console.log(`Processing interest confirmation for ${email} - interest: ${interestTitle}`);

    // Get the email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'Intresseanmälan bekräftelse - AUTO')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Could not fetch email template:', templateError);
      throw new Error('Email template not found');
    }

    console.log('Using email template:', template.name);

    // First, try to add contact to Resend audience
    try {
      const contactData = {
        email: email,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
      };

      console.log('Adding contact to Resend:', contactData);
      
      const contactResponse = await resend.contacts.create({
        audienceId: Deno.env.get('RESEND_AUDIENCE_ID') || 'default',
        ...contactData
      });

      console.log('Contact added successfully:', contactResponse);

      // Add tags to categorize the contact
      if (contactResponse.data?.id) {
        try {
          await resend.contacts.update({
            audienceId: Deno.env.get('RESEND_AUDIENCE_ID') || 'default',
            id: contactResponse.data.id,
            unsubscribed: false,
          });
          console.log('Contact tags updated');
        } catch (tagError) {
          console.log('Could not update contact tags:', tagError);
          // Continue anyway - not critical
        }
      }
    } catch (contactError: any) {
      console.log('Contact creation failed (continuing with email):', contactError);
      // Continue with email sending even if contact creation fails
      // This could happen if contact already exists or other API issues
    }

    // Personalize the template content
    let personalizedContent = template.content
      .replace(/\[NAMN\]/g, name)
      .replace(/\[KURSNAMN\]/g, interestTitle);
    
    let personalizedSubject = template.subject
      .replace(/\[NAMN\]/g, name)
      .replace(/\[KURSNAMN\]/g, interestTitle);

    // Create styled HTML email (same style as bulk emails)
    const isPlainText = !template.content.includes('<') && !template.content.includes('>');
    
    let htmlContent;
    if (isPlainText) {
      // Convert plain text to styled HTML
      const textWithBreaks = personalizedContent.replace(/\n/g, '<br>');
      htmlContent = createStyledEmailTemplate(personalizedSubject, textWithBreaks, template.title, template.background_image, template.title_size);
    } else {
      // Use HTML content but wrap in template
      htmlContent = createStyledEmailTemplate(personalizedSubject, personalizedContent, template.title, template.background_image, template.title_size);
    }

    function createStyledEmailTemplate(subject: string, content: string, title?: string, backgroundImage?: string, titleSize?: string) {
      const hasBackground = backgroundImage && backgroundImage.trim() !== '';
      const hasTitle = title && title.trim() !== '';
      const finalTitleSize = titleSize || '32';
      
      // Clean, Moccamaster-inspired design
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
          background-color: #ffffff;
          line-height: 1.6;
          color: #333333;
        ">
          <!-- Header Section -->
          <div style="
            background-color: #ffffff;
            padding: 40px 20px 0;
            text-align: center;
          ">
            ${hasBackground ? `
              <div style="
                max-width: 600px;
                margin: 0 auto 40px;
                height: 200px;
                background-image: url('${backgroundImage}');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 8px;
              "></div>
            ` : ''}
            
            <div style="max-width: 600px; margin: 0 auto;">
              ${hasTitle ? `
                <h1 style="
                  font-size: ${finalTitleSize}px;
                  font-weight: 300;
                  margin: 0 0 12px 0;
                  color: #1a1a1a;
                  letter-spacing: -0.025em;
                  line-height: 1.2;
                ">
                  ${title}
                </h1>
              ` : `
                <h1 style="
                  font-size: 28px;
                  font-weight: 300;
                  margin: 0 0 12px 0;
                  color: #1a1a1a;
                  letter-spacing: -0.025em;
                  line-height: 1.2;
                ">
                  Tack för ditt intresse
                </h1>
              `}
              <p style="
                font-size: 16px;
                color: #666666;
                margin: 0 0 40px 0;
                font-weight: 400;
              ">
                Din intresseanmälan är mottagen
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
              <div style="margin-bottom: 32px; text-align: center;">
                <h2 style="
                  font-size: 20px;
                  font-weight: 400;
                  margin: 0 0 12px 0;
                  color: #1a1a1a;
                ">
                  Hej ${name.split(' ')[0]}!
                </h2>
                <p style="
                  font-size: 16px;
                  color: #666666;
                  margin: 0;
                  line-height: 1.5;
                ">
                  Tack för din intresseanmälan. Vi kontaktar dig så snart något aktuellt dyker upp!
                </p>
              </div>

              <!-- Content Box -->
              <div style="
                background-color: #f9f9f9;
                border-radius: 6px;
                padding: 24px;
                margin-bottom: 32px;
                border-left: 3px solid #1a1a1a;
              ">
                <div style="
                  font-size: 15px;
                  line-height: 1.6;
                  color: #333333;
                ">
                  ${content}
                </div>
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
              Vill du inte längre få våra mejl? 
              <a href="https://improteatern.se/avprenumerera?email=${encodeURIComponent(email)}" style="
                color: #666666;
                text-decoration: underline;
              ">
                Avprenumerera här
              </a>
            </p>
          </div>
        </body>
        </html>
      `;
    }

    // Send the email
    console.log('Sending interest confirmation email using template:', template.name);
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject: personalizedSubject,
      html: htmlContent,
      text: personalizedContent, // Keep plain text version for fallback
      tags: [
        { name: 'type', value: 'interest-confirmation' },
        { name: 'interest', value: interestTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() },
        { name: 'template', value: template.name }
      ]
    });

    console.log("Interest confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-interest-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
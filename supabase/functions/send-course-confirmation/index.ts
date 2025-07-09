
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  name: string;
  email: string;
  courseTitle: string;
  isAvailable: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, courseTitle, isAvailable }: ConfirmationEmailRequest = await req.json();

    console.log(`Processing course confirmation for ${email} - course: ${courseTitle}`);

    // Get the email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'Kursbekräftelse - AUTO')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Could not fetch email template:', templateError);
      throw new Error('Email template not found');
    }

    console.log('Using email template:', template.name);

    // First, try to add contact to Resend
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
      .replace(/\[KURSNAMN\]/g, courseTitle);
    
    let personalizedSubject = template.subject
      .replace(/\[NAMN\]/g, name)
      .replace(/\[KURSNAMN\]/g, courseTitle);

    // Create styled HTML email (same style as bulk emails)
    const isPlainText = !template.content.includes('<') && !template.content.includes('>');
    
    let htmlContent;
    if (isPlainText) {
      // Convert plain text to styled HTML
      const textWithBreaks = personalizedContent.replace(/\n/g, '<br>');
      htmlContent = createStyledEmailTemplate(personalizedSubject, textWithBreaks, template.title, template.background_image, template.title_size, template.image_position);
    } else {
      // Use HTML content but wrap in template
      htmlContent = createStyledEmailTemplate(personalizedSubject, personalizedContent, template.title, template.background_image, template.title_size, template.image_position);
    }

    function createStyledEmailTemplate(subject: string, content: string, title?: string, backgroundImage?: string, titleSize?: string, imagePosition?: string) {
      const hasBackground = backgroundImage && backgroundImage.trim() !== '';
      const hasTitle = title && title.trim() !== '';
      const finalTitleSize = titleSize || '32';
      const finalImagePosition = imagePosition || 'top';
      
      // Enhanced template with Moccamaster-inspired design
      return `
        <div style="
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #2c2c2c;
        ">
          ${hasBackground ? `
            <div style="
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 60px 20px;
              text-align: center;
            ">
              <div style="
                height: 200px;
                background-image: url('${backgroundImage}');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 12px;
                margin: 0 auto;
                max-width: 600px;
              "></div>
            </div>
          ` : `
            <div style="
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 60px 20px;
              text-align: center;
            ">
              <div style="max-width: 600px; margin: 0 auto;">
                ${hasTitle ? `
                  <h1 style="
                    font-size: ${finalTitleSize}px;
                    font-weight: 300;
                    margin: 0 0 16px 0;
                    color: #2c2c2c;
                    letter-spacing: -0.5px;
                  ">
                    ${title}
                  </h1>
                ` : `
                  <h1 style="
                    font-size: 36px;
                    font-weight: 300;
                    margin: 0 0 16px 0;
                    color: #2c2c2c;
                    letter-spacing: -0.5px;
                  ">
                    Tack för din bokning
                  </h1>
                `}
                <p style="
                  font-size: 18px;
                  color: #6c757d;
                  margin: 0;
                  font-weight: 300;
                ">
                  Din bokning är bekräftad
                </p>
              </div>
            </div>
          `}
          
          <div style="
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          ">
            <div style="
              background-color: #ffffff;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            ">
              <div style="margin-bottom: 40px; text-align: center;">
                <h2 style="
                  font-size: 24px;
                  font-weight: 400;
                  margin: 0 0 16px 0;
                  color: #2c2c2c;
                ">
                  Hej ${personalizedContent.includes('[NAMN]') ? personalizedContent.match(/Tack.*?(\w+)!/)?.[1] || 'där' : 'där'}!
                </h2>
                <p style="
                  font-size: 16px;
                  color: #6c757d;
                  margin: 0;
                  line-height: 1.5;
                ">
                  Tack för din kursbokning. Vi ser fram emot att träffa dig!
                </p>
              </div>

              <div style="
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 12px;
                padding: 32px;
                margin-bottom: 40px;
                text-align: center;
              ">
                ${content}
              </div>

              <div style="
                text-align: center;
                margin-bottom: 40px;
              ">
                <h3 style="
                  font-size: 18px;
                  font-weight: 500;
                  margin: 0 0 16px 0;
                  color: #2c2c2c;
                ">
                  Vad händer nu?
                </h3>
                <div style="
                  font-size: 16px;
                  color: #6c757d;
                  line-height: 1.6;
                ">
                  <p style="margin: 0 0 12px 0;">
                    Du kommer att få ett mejl med kursdetaljer senast en vecka innan kursstart
                  </p>
                  <p style="margin: 0;">
                    Har du frågor? Svara på detta mejl så hör vi av oss
                  </p>
                </div>
              </div>

              <div style="
                border-top: 1px solid #e9ecef;
                padding-top: 32px;
                text-align: center;
              ">
                <p style="
                  font-size: 14px;
                  color: #6c757d;
                  margin: 0 0 8px 0;
                ">
                  Med vänliga hälsningar
                </p>
                <p style="
                  font-size: 16px;
                  font-weight: 500;
                  color: #2c2c2c;
                  margin: 0;
                ">
                  Lilla Improteatern
                </p>
              </div>
            </div>
          </div>

          <div style="
            background-color: #f8f9fa;
            padding: 24px 20px;
            text-align: center;
          ">
            <p style="
              font-size: 12px;
              color: #6c757d;
              margin: 0;
            ">
              Vill du inte längre få våra mejl? 
              <a href="https://improteatern.se/avprenumerera?email=${encodeURIComponent(email)}" style="
                color: #6c757d;
                text-decoration: underline;
              ">
                Avprenumerera här
              </a>
            </p>
          </div>
        </div>
      `;
    }

    // Send the email
    console.log('Sending confirmation email using template:', template.name);
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject: personalizedSubject,
      html: htmlContent,
      text: personalizedContent, // Keep plain text version for fallback
      tags: [
        { name: 'type', value: 'course-confirmation' },
        { name: 'course', value: courseTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() },
        { name: 'available', value: isAvailable ? 'yes' : 'no' },
        { name: 'template', value: template.name }
      ]
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-course-confirmation function:", error);
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

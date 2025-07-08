
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
      
      return `
        <div style="
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          background-color: #f5f5f5;
          padding: 0;
        ">
          ${hasBackground ? `
            <div style="
              height: 300px;
              background-image: url('${backgroundImage}');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              margin: 0;
            "></div>
          ` : ''}
          
          <div style="
            max-width: 600px;
            margin: ${hasBackground ? '-60px auto 40px auto' : '40px auto'};
            position: relative;
            z-index: 10;
          ">
            <div style="
              background-color: #fff;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            ">
              ${hasTitle ? `
                <h1 style="
                  color: #333; 
                  margin: 0 0 20px 0;
                  font-size: ${finalTitleSize}px;
                  font-weight: bold;
                  text-align: center;
                  line-height: 1.2;
                ">
                  ${title}
                </h1>
                <div style="
                  width: 60px;
                  height: 3px;
                  background-color: #333;
                  margin: 0 auto 30px auto;
                "></div>
              ` : `
                <div style="
                  border-bottom: 2px solid #d32f2f; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px;
                ">
                  <h2 style="
                    color: #d32f2f; 
                    margin: 0 0 10px 0;
                    font-size: 24px;
                  ">
                    ${subject}
                  </h2>
                </div>
              `}
              
              <div style="margin-bottom: 30px;">
                ${content}
              </div>
              
              <div style="
                border-top: 1px solid #eee; 
                padding-top: 20px;
                color: #666;
                font-size: 14px;
              ">
                <p style="margin: 0 0 15px 0;">
                  Med vänliga hälsningar,<br />
                  <strong>Lilla Improteatern</strong>
                </p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                  Vill du inte längre få våra mejl? 
                  <a href="https://improteatern.se/avprenumerera?email=${encodeURIComponent(email)}" style="color: #d32f2f; text-decoration: underline;">
                    Avprenumerera här
                  </a>
                </p>
              </div>
            </div>
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

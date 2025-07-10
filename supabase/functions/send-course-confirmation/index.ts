
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
  courseStartDate?: string;
  courseStartTime?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, courseTitle, isAvailable, courseStartDate, courseStartTime }: ConfirmationEmailRequest = await req.json();

    console.log(`Processing course confirmation for ${email} - course: ${courseTitle}`);
    console.log('Request data:', { name, email, courseTitle, isAvailable, courseStartDate, courseStartTime });

    // Get course information if not provided
    let finalStartDate = courseStartDate;
    let finalStartTime = courseStartTime;
    
    if (!courseStartDate || !courseStartTime) {
      console.log('Fetching course information from database...');
      const { data: courseInstance, error: courseError } = await supabase
        .from('course_instances')
        .select('start_date, start_time')
        .eq('course_title', courseTitle)
        .eq('is_active', true)
        .single();
      
      if (courseInstance && !courseError) {
        finalStartDate = finalStartDate || courseInstance.start_date;
        finalStartTime = finalStartTime || courseInstance.start_time;
        console.log('Found course info:', { start_date: courseInstance.start_date, start_time: courseInstance.start_time });
      } else {
        console.log('Could not find course information:', courseError);
      }
    }

    // Fixed email content instead of using database template
    const subject = `Tack för din bokning - ${courseTitle}`;
    
    let emailContent = `Hej ${name}!

Tack för din anmälan till ${courseTitle}!`;

    // Add course date and time if available
    if (finalStartDate) {
      const formattedDate = new Date(finalStartDate).toLocaleDateString('sv-SE');
      emailContent += `

Kursstart: ${formattedDate}`;
    }
    
    if (finalStartTime) {
      const formattedTime = finalStartTime.substring(0, 5); // Format HH:MM
      emailContent += `
Tid: ${formattedTime}`;
    }

    emailContent += `

Du kommer att få ett mejl med kursdetaljer senast en vecka innan kursstart

Har du frågor? Svara på detta mejl så hör vi av oss.

Med vänliga hälsningar
Lilla Improteatern`;

    // Create simple HTML email
    const textWithBreaks = emailContent.replace(/\n/g, '<br>');
    const htmlContent = createStyledEmailTemplate(subject, textWithBreaks);

    function createStyledEmailTemplate(subject: string, content: string, title?: string, backgroundImage?: string, titleSize?: string, imagePosition?: string) {
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
          font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
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
                  Tack för din bokning
                </h1>
              `}
              <p style="
                font-size: 16px;
                color: #666666;
                margin: 0 0 40px 0;
                font-weight: 400;
              ">
                Din bokning är bekräftad
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
                  Hej ${name.split(' ')[0] || 'där'}!
                </h2>
                <p style="
                  font-size: 16px;
                  color: #666666;
                  margin: 0;
                  line-height: 1.5;
                ">
                  Tack för din kursbokning. Vi ser fram emot att träffa dig!
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

              <!-- Next Steps -->
              <div style="
                text-align: center;
                margin-bottom: 32px;
                padding: 24px 0;
                border-top: 1px solid #e8e8e8;
                border-bottom: 1px solid #e8e8e8;
              ">
                <h3 style="
                  font-size: 17px;
                  font-weight: 500;
                  margin: 0 0 16px 0;
                  color: #1a1a1a;
                ">
                  Vad händer nu?
                </h3>
                <div style="
                  font-size: 15px;
                  color: #666666;
                  line-height: 1.6;
                ">
                  <p style="margin: 0 0 8px 0;">
                    Du kommer att få ett mejl med kursdetaljer senast en vecka innan kursstart
                  </p>
                  <p style="margin: 0;">
                    Har du frågor? Svara på detta mejl så hör vi av oss
                  </p>
                </div>
              </div>

              <!-- Signature -->
              <div style="text-align: center;">
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
    }

    // Send the email
    console.log('Sending confirmation email with fixed template');
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject: subject,
      html: htmlContent,
      text: emailContent, // Keep plain text version for fallback
      tags: [
        { name: 'type', value: 'course-confirmation' },
        { name: 'course', value: courseTitle.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase().slice(0, 50) },
        { name: 'available', value: isAvailable ? 'yes' : 'no' }
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

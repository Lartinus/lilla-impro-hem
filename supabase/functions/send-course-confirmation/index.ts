
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

    function createStyledEmailTemplate(subject: string, content: string) {
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
          ">
            <h1 style="
              font-size: 28px;
              font-weight: 400;
              margin: 0 0 8px 0;
              color: #1a1a1a;
              text-align: center;
            ">
              Tack för din bokning
            </h1>
            <p style="
              font-size: 16px;
              color: #666666;
              margin: 0 0 40px 0;
              text-align: center;
            ">
              Din bokning är bekräftad
            </p>
            
            <div style="
              font-size: 16px;
              line-height: 1.6;
              color: #333333;
            ">
              ${content}
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

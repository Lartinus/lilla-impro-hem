import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";
import { ConfirmationEmailRequest } from "./types.ts";
import { createSimpleEmailTemplate } from "./email-template.ts";

// Utility function to process markdown with variables
function convertMarkdownToHtmlWithVariables(
  markdown: string, 
  variables: Record<string, string> = {}
): string {
  if (!markdown) return '';
  
  let processedMarkdown = markdown;
  
    // Replace variables in markdown text
    Object.entries(variables).forEach(([key, value]) => {
      console.log(`DEBUG: Replacing [${key}] with "${value}"`);
      const regex = new RegExp(`\\[${key.toUpperCase()}\\]`, 'gi');
      processedMarkdown = processedMarkdown.replace(regex, value || '');
    });
  
  // Convert line breaks to <br> tags for HTML
  return processedMarkdown.replace(/\n/g, '<br>');
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, courseTitle, isAvailable, courseStartDate, courseStartTime }: ConfirmationEmailRequest = await req.json();

    console.log(`Processing course confirmation for ${email} - course: ${courseTitle}`);
    console.log('Request data:', { name, email, courseTitle, isAvailable, courseStartDate, courseStartTime });
    console.log('DEBUG: Name parameter received:', name);
    console.log('DEBUG: Name type:', typeof name);
    console.log('DEBUG: Name length:', name ? name.length : 'undefined');
    
    // Validate that name is provided
    if (!name || name.trim() === '') {
      console.error('ERROR: No name provided for course confirmation email');
      return new Response(
        JSON.stringify({ error: 'Name is required for course confirmation email' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get email template from database
    console.log('Fetching course confirmation email template...');
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'Välkomstmejl')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Could not fetch email template:', templateError);
      console.log('Using fallback email instead...');
      
      // Send fallback email
      const fallbackResult = await sendFallbackEmail(name, email, courseTitle, courseStartDate, courseStartTime);
      
      return new Response(JSON.stringify(fallbackResult), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    console.log('Using email template:', template.name);
    console.log('DEBUG: Template content from DB:', template.content);

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

    // Extract first name from full name
    const firstName = name.split(' ')[0];
    console.log('DEBUG: Full name received:', name);
    console.log('DEBUG: Extracted first name:', firstName);
    console.log('DEBUG: Name is undefined/empty?', !name || name.trim() === '');

    // Prepare variables for template
    const variables = {
      NAMN: firstName,
      KURS: courseTitle,
      STARTDATUM: finalStartDate ? new Date(finalStartDate).toLocaleDateString('sv-SE') : '',
      STARTTID: finalStartTime ? finalStartTime.substring(0, 5) : ''
    };

    console.log('DEBUG: Variables for template replacement:', variables);
    console.log('DEBUG: Template content before replacement:', template.content);

    // Process subject with variables
    let personalizedSubject = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
    });

    // Process content with variables
    const personalizedContent = convertMarkdownToHtmlWithVariables(template.content, variables);
    console.log('DEBUG: Personalized content after replacement:', personalizedContent);

    // Create styled email template
    const htmlContent = createStyledEmailTemplate(personalizedSubject, personalizedContent, template);

    function createStyledEmailTemplate(subjectText: string, contentText: string, templateData: any = null) {
      const hasBackground = templateData?.background_image && templateData.background_image.trim() !== '';
      
      return `
        <!DOCTYPE html>
        <html lang="sv" style="margin: 0; padding: 0;">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subjectText}</title>
          <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Titan+One&display=swap" rel="stylesheet">
        </head>
        <body style="
          margin: 0;
          padding: 0;
          font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background-color: #EBEBEB;
          line-height: 1.6;
          color: #333333;
        ">
          <div style="max-width: 600px; margin: 0 auto; background-color: #EBEBEB;">
            ${hasBackground ? `
              <div style="
                text-align: center;
                padding: 0;
                margin: 0;
              ">
                <img src="${templateData.background_image}" alt="" style="
                  width: 600px;
                  height: 400px;
                  object-fit: cover;
                  display: block;
                  margin: 0 auto;
                "/>
              </div>
            ` : ''}
            
            <div style="
              max-width: 600px;
              margin: ${hasBackground ? '-50px auto 0' : '0 auto'};
              padding: 40px;
              background-color: #F3F3F3;
              border-radius: 10px;
              position: relative;
              z-index: 1;
            ">
              <div style="
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              ">
                ${contentText}
              </div>
            </div>
            
            <!-- Red footer -->
            <div style="
              width: 600px;
              height: 180px;
              background-color: #DC2626;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
            ">
              <div style="
                font-family: 'Titan One', cursive;
                font-size: 32px;
                color: white;
                margin: 0 0 16px 0;
                line-height: 1;
              ">
                LILLA IMPROTEATERN
              </div>
              <div style="
                font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                font-size: 16px;
                color: white;
                margin: 0;
                line-height: 1.2;
              ">
                Vill du inte längre få våra mejl? <a href="#" style="color: white; text-decoration: underline;">Avprenumerera här</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send the email
    console.log('Sending course confirmation email using template:', template.name);
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject: personalizedSubject,
      html: htmlContent,
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

// Fallback function for when template is not found
async function sendFallbackEmail(
  name: string, 
  email: string, 
  courseTitle: string, 
  startDate?: string, 
  startTime?: string
) {
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  
  const subject = `Tack för din bokning - ${courseTitle}`;
  const courseDisplayName = courseTitle.endsWith('!') || courseTitle.endsWith('?') || courseTitle.endsWith('.') 
    ? courseTitle 
    : courseTitle + '!';
  
  let emailContent = `Hej!

Tack för din anmälan till ${courseDisplayName}`;

  if (startDate) {
    const formattedDate = new Date(startDate).toLocaleDateString('sv-SE');
    emailContent += `

Kursstart: ${formattedDate}`;
  }
  
  if (startTime) {
    const formattedTime = startTime.substring(0, 5);
    emailContent += `
Tid: ${formattedTime}`;
  }

  emailContent += `

Du kommer att få ett mejl med kursdetaljer senast en vecka innan kursstart

Har du frågor? Svara på detta mejl så hör vi av oss.

Med vänliga hälsningar
Lilla Improteatern`;

  const { createSimpleEmailTemplate } = await import("./email-template.ts");
  const textWithBreaks = emailContent.replace(/\n/g, '<br>');
  const htmlContent = createSimpleEmailTemplate(subject, textWithBreaks);

  return await resend.emails.send({
    from: "Lilla Improteatern <noreply@improteatern.se>",
    to: [email],
    subject: subject,
    html: htmlContent,
    tags: [{ name: 'type', value: 'course-confirmation-fallback' }]
  });
}

serve(handler);
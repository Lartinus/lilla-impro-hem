import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { supabase } from "../_shared/supabase.ts";
import { ConfirmationEmailRequest } from "./types.ts";
import { createUnifiedEmailTemplate } from "../_shared/email-template.ts";
import { logSentEmail } from "../_shared/email-logger.ts";

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
    // Authorization: require admin or internal (service) invocation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: isAdmin, error: adminError } = await userClient.rpc('current_user_is_admin');
    if (!isAdmin && !adminError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, courseTitle, isAvailable, courseStartDate, courseStartTime, courseTableName }: ConfirmationEmailRequest = await req.json();

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

    // Get email template from database (using AUTO: prefix from AutomaticEmailsManager)
    console.log('Fetching course confirmation email template...');
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'AUTO: Kursbekräftelse')
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
      
      // If we have a specific table name, use that to find the course instance
      let courseQuery = supabase
        .from('course_instances')
        .select('start_date, start_time')
        .eq('is_active', true);
      
      if (courseTableName) {
        courseQuery = courseQuery.eq('table_name', courseTableName);
      } else {
        courseQuery = courseQuery.eq('course_title', courseTitle);
      }
      
      const { data: courseInstance, error: courseError } = await courseQuery.single();
      
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

    // Prepare variables for template (matching AutomaticEmailsManager format)
    const variables = {
      NAMN: firstName,
      KURSTITEL: courseTitle,
      STARTDATUM: finalStartDate ? new Date(finalStartDate).toLocaleDateString('sv-SE') : '',
      STARTTID: finalStartTime ? finalStartTime.substring(0, 5) : ''
    };

    console.log('DEBUG: Variables for template replacement:', variables);
    console.log('DEBUG: Template content before replacement:', template.content);

    // Process subject with variables (using same format as AutomaticEmailsManager)
    let personalizedSubject = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
    });

    // Process content with variables (same as AutomaticEmailsManager)
    let processedContent = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      processedContent = processedContent.replace(regex, value);
    });

    console.log('DEBUG: Processed content after variable replacement:', processedContent);
    console.log('DEBUG: Content lines:', processedContent.split('\n'));

    const htmlContent = createUnifiedEmailTemplate(
      personalizedSubject, 
      processedContent, 
      template?.background_image,
      { showUnsubscribe: false }
    );

    console.log('DEBUG: Generated HTML content preview:', htmlContent.substring(0, 500));

    // Send the email
    console.log('Sending course confirmation email using template:', template.name);
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject: personalizedSubject,
      html: htmlContent,
      tags: [
        { name: 'type', value: 'course_confirmation' },
        { name: 'course', value: courseTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase().slice(0, 50) },
        { name: 'available', value: isAvailable ? 'yes' : 'no' }
      ]
    });

    // Log the sent email
    await logSentEmail({
      recipientEmail: email,
      recipientName: name,
      subject: personalizedSubject,
      content: processedContent,
      htmlContent: htmlContent,
      emailType: "course_confirmation",
      sourceFunction: "send-course-confirmation",
      resendId: emailResponse.data?.id,
      status: "sent"
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

  const textWithBreaks = emailContent.replace(/\n/g, '<br>');
  const htmlContent = createUnifiedEmailTemplate(subject, textWithBreaks, undefined, { showUnsubscribe: false });

  const emailResponse = await resend.emails.send({
    from: "Lilla Improteatern <noreply@improteatern.se>",
    to: [email],
    subject: subject,
    html: htmlContent,
    tags: [{ name: 'type', value: 'course_confirmation_fallback' }]
  });

  // Log the fallback email
  await logSentEmail({
    recipientEmail: email,
    recipientName: name,
    subject: subject,
    content: emailContent,
    htmlContent: htmlContent,
    emailType: "course_confirmation_fallback",
    sourceFunction: "send-course-confirmation",
    resendId: emailResponse.data?.id,
    status: "sent"
  });

  return emailResponse;
}

serve(handler);
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";
import { ConfirmationEmailRequest } from "./types.ts";
import { createSimpleEmailTemplate } from "./email-template.ts";

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

    // Create email content
    const subject = `Tack för din bokning - ${courseTitle}`;
    
    // Check if course title already ends with punctuation to avoid duplication
    const courseDisplayName = courseTitle.endsWith('!') || courseTitle.endsWith('?') || courseTitle.endsWith('.') 
      ? courseTitle 
      : courseTitle + '!';
    
    let emailContent = `Hej ${name}!

Tack för din anmälan till ${courseDisplayName}`;

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

    // Create HTML email with simple template
    const textWithBreaks = emailContent.replace(/\n/g, '<br>');
    const htmlContent = createSimpleEmailTemplate(subject, textWithBreaks);

    // Send the email
    console.log('Sending confirmation email with simple template');
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
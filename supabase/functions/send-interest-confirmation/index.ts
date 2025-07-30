import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";
import { createUnifiedEmailTemplate } from "../_shared/email-template.ts";

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
    
    // Create the content with headers for interest confirmation
    const processedContent = isPlainText ? personalizedContent.replace(/\n/g, '<br>') : personalizedContent;
    
    const fullContent = `
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

      <div style="
        font-size: 16px;
        line-height: 1.6;
        color: #333333;
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        margin-bottom: 32px;
      ">
        ${processedContent}
      </div>
    `;
    
    const htmlContent = createUnifiedEmailTemplate(
      personalizedSubject, 
      fullContent, 
      template.background_image
    ).replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(email)}`);

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
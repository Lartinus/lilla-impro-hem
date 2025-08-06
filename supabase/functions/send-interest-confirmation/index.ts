import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";
import { createUnifiedEmailTemplate } from "../_shared/email-template.ts";
import { logSentEmail } from "../_shared/email-logger.ts";

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

    // Get the email template from database (using AUTO: prefix)
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'AUTO: Intresseanmälan bekräftelse')
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

    // Personalize the template content (using same variable format as AutomaticEmailsManager)
    const variables = {
      NAMN: name,
      INTRESSETITEL: interestTitle
    };

    let processedContent = template.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      processedContent = processedContent.replace(regex, value);
    });
    
    let personalizedSubject = template.subject;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
    });

    // Format content like AutomaticEmailsManager
    const formattedContent = processedContent
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        if (trimmed.startsWith('H1: ')) {
          const headerText = trimmed.substring(4);
          return `<h1 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 32px; color: #333333; margin: 24px 0 16px 0; font-weight: 400; line-height: 1.2;">${headerText}</h1>`;
        }
        
        if (trimmed.startsWith('H2: ')) {
          const headerText = trimmed.substring(4);
          return `<h2 style="font-family: 'Tanker', 'Arial Black', sans-serif; font-size: 24px; color: #333333; margin: 20px 0 12px 0; font-weight: 400; line-height: 1.2;">${headerText}</h2>`;
        }
        
        return `<p style="font-family: 'Satoshi', Arial, sans-serif; font-size: 16px; color: #333333; margin: 0 0 16px 0; line-height: 1.6;">${trimmed}</p>`;
      })
      .filter(line => line)
      .join('');
    
    const htmlContent = createUnifiedEmailTemplate(
      personalizedSubject, 
      formattedContent, 
      template.background_image
    ).replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(email)}`);

    // Send the email
    console.log('Sending interest confirmation email using template:', template.name);
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject: personalizedSubject,
      html: htmlContent,
      text: processedContent, // Keep plain text version for fallback
      tags: [
        { name: 'type', value: 'interest-confirmation' },
        { name: 'interest', value: interestTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() },
        { name: 'template', value: template.name }
      ]
    });

    // Log the sent email
    await logSentEmail({
      recipientEmail: email,
      recipientName: name,
      subject: personalizedSubject,
      content: processedContent,
      htmlContent: htmlContent,
      emailType: "interest_confirmation",
      sourceFunction: "send-interest-confirmation",
      resendId: emailResponse.data?.id,
      status: "sent"
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
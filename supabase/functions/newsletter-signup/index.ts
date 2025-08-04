import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSignupRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email-tjänsten är inte korrekt konfigurerad");
    }

    console.log("RESEND_API_KEY found, proceeding with signup");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, name }: NewsletterSignupRequest = await req.json();

    console.log(`Newsletter signup attempt for: ${email}`);

    // Validate input
    if (!email || !name) {
      throw new Error("Namn och e-post krävs");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already exists and is confirmed
    const { data: existingContact } = await supabase
      .from('email_contacts')
      .select('id, metadata')
      .eq('email', cleanEmail)
      .single();

    if (existingContact?.metadata?.newsletter_confirmed) {
      throw new Error("Du är redan registrerad för vårt nyhetsbrev");
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create or update contact with pending confirmation
    const contactData = {
      email: cleanEmail,
      name: cleanName,
      source: 'newsletter',
      source_id: 'newsletter_signup',
      metadata: {
        newsletter_pending: true,
        newsletter_confirmed: false,
        confirmation_token: confirmationToken,
        confirmation_expires: confirmationExpires.toISOString(),
        signup_date: new Date().toISOString()
      }
    };

    let contactId: string;

    if (existingContact) {
      // Update existing contact
      const { data: updatedContact, error: updateError } = await supabase
        .from('email_contacts')
        .update(contactData)
        .eq('id', existingContact.id)
        .select('id')
        .single();

      if (updateError) throw updateError;
      contactId = updatedContact.id;
    } else {
      // Create new contact
      const { data: newContact, error: insertError } = await supabase
        .from('email_contacts')
        .insert(contactData)
        .select('id')
        .single();

      if (insertError) throw insertError;
      contactId = newContact.id;
    }

    // Send confirmation email
    const confirmationUrl = `https://improteatern.se/nyhetsbrev-bekraftelse?token=${confirmationToken}`;
    
    // Import the unified template and email logger
    const { createUnifiedEmailTemplate } = await import("../_shared/email-template.ts");
    const { logSentEmail } = await import("../_shared/email-logger.ts");
    
    // Get email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, content')
      .eq('name', 'AUTO: newsletter_confirmation')
      .eq('is_active', true)
      .single();
    
    if (templateError) {
      console.error('Error fetching email template:', templateError);
      throw new Error('Newsletter confirmation template not found');
    }
    
    // Replace variables in template content
    let emailContent = template.content;
    let emailSubject = template.subject;
    
    const variables = {
      NAMN: cleanName,
      BEKRÄFTELSELÄNK: confirmationUrl
    };
    
    // Replace variables in both subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      emailContent = emailContent.replace(regex, value);
      emailSubject = emailSubject.replace(regex, value);
    });
    
    // Create unified email HTML
    const emailHtml = createUnifiedEmailTemplate(emailSubject, emailContent);
    
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <onboarding@resend.dev>",
      to: [cleanEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Confirmation email sent:", emailResponse);

    // Log the sent email to the database
    await logSentEmail({
      recipientEmail: cleanEmail,
      recipientName: cleanName,
      senderEmail: "Lilla Improteatern <onboarding@resend.dev>",
      subject: emailSubject,
      htmlContent: emailHtml,
      emailType: "newsletter_confirmation",
      sourceFunction: "newsletter-signup",
      resendId: emailResponse.data?.id,
      status: "sent"
    });

    return new Response(
      JSON.stringify({ 
        message: "Bekräftelsemejl skickat",
        email: cleanEmail 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in newsletter-signup function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Ett fel uppstod vid registrering" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
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
    
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <onboarding@resend.dev>",
      to: [cleanEmail],
      subject: "Bekräfta din prenumeration på vårt nyhetsbrev",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bekräfta din prenumeration</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Lilla Improteatern</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Bekräfta din prenumeration</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-top: 0; font-size: 24px; font-weight: 600;">Hej ${cleanName}!</h2>
            
            <p style="font-size: 16px; margin: 20px 0;">Tack för att du vill prenumerera på vårt nyhetsbrev! För att bekräfta din registrering, klicka på knappen nedan:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); transition: all 0.3s ease;">
                Bekräfta prenumeration
              </a>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">
                <strong>Om knappen inte fungerar:</strong><br>
                Kopiera och klistra in denna länk i din webbläsare:<br>
                <a href="${confirmationUrl}" style="color: #dc2626; word-break: break-all; text-decoration: underline;">${confirmationUrl}</a>
              </p>
            </div>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                ⏰ <strong>Viktigt:</strong> Denna bekräftelselänk är giltig i 24 timmar. Om du inte bekräftar inom denna tid behöver du registrera dig igen.
              </p>
            </div>
            
            <hr style="margin: 35px 0; border: none; border-top: 2px solid #f3f4f6;">
            
            <div style="text-align: center; font-size: 14px; color: #6b7280;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                Med vänliga hälsningar,<br>
                <span style="color: #dc2626; font-weight: 600;">Lilla Improteatern</span>
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="https://improteatern.se/avprenumerera?email=${encodeURIComponent(cleanEmail)}" style="color: #9ca3af; text-decoration: underline;">Avregistrera dig här</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent:", emailResponse);

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
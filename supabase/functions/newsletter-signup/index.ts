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
        <html lang="sv" style="margin: 0; padding: 0;">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bekräfta din prenumeration</title>
        </head>
        <body style="
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background-color: #ffffff;
          line-height: 1.6;
          color: #333333;
        ">
          <!-- Header -->
          <div style="
            background-color: #ffffff;
            padding: 40px 20px 0;
            text-align: center;
          ">
            <div style="max-width: 600px; margin: 0 auto;">
              <h1 style="
                font-size: 28px;
                font-weight: 300;
                margin: 0 0 12px 0;
                color: #1a1a1a;
                letter-spacing: -0.025em;
                line-height: 1.2;
              ">
                Bekräfta din prenumeration
              </h1>
              <p style="
                font-size: 16px;
                color: #666666;
                margin: 0 0 40px 0;
                font-weight: 400;
              ">
                Tack för att du vill prenumerera på vårt nyhetsbrev!
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
                  Hej ${cleanName}!
                </h2>
                <p style="
                  font-size: 16px;
                  color: #666666;
                  margin: 0 0 24px 0;
                  line-height: 1.5;
                ">
                  För att bekräfta din registrering, klicka på knappen nedan:
                </p>
                
                <a href="${confirmationUrl}" style="
                  display: inline-block;
                  background-color: #1a1a1a;
                  color: #ffffff;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 500;
                  font-size: 15px;
                  letter-spacing: 0.025em;
                ">
                  Bekräfta prenumeration
                </a>
              </div>
              
              <!-- Alternative Link -->
              <div style="
                background-color: #f9f9f9;
                border-radius: 6px;
                padding: 20px;
                margin-bottom: 24px;
                border-left: 3px solid #1a1a1a;
              ">
                <p style="
                  font-size: 14px;
                  color: #666666;
                  margin: 0 0 12px 0;
                ">
                  <strong>Om knappen inte fungerar:</strong><br>
                  Kopiera och klistra in denna länk i din webbläsare:
                </p>
                <p style="
                  font-size: 13px;
                  color: #1a1a1a;
                  margin: 0;
                  word-break: break-all;
                  font-family: monospace;
                ">
                  ${confirmationUrl}
                </p>
              </div>
              
              <!-- Important Notice -->
              <div style="
                background-color: #f9f9f9;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 24px;
              ">
                <p style="
                  font-size: 14px;
                  color: #666666;
                  margin: 0;
                ">
                  ⏰ <strong>Viktigt:</strong> Denna bekräftelselänk är giltig i 24 timmar. Om du inte bekräftar inom denna tid behöver du registrera dig igen.
                </p>
              </div>
              
              <p style="
                font-size: 14px;
                color: #999999;
                margin: 0 0 24px 0;
                text-align: center;
              ">
                Om du inte begärde denna prenumeration kan du ignorera detta meddelande.
              </p>
              
              <!-- Signature -->
              <div style="
                text-align: center;
                padding-top: 24px;
                border-top: 1px solid #e8e8e8;
              ">
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
                  margin: 0 0 12px 0;
                ">
                  Lilla Improteatern
                </p>
                <p style="
                  font-size: 12px;
                  color: #999999;
                  margin: 0;
                ">
                  <a href="https://improteatern.se/avprenumerera?email=${encodeURIComponent(cleanEmail)}" style="color: #666666; text-decoration: underline;">Avregistrera dig här</a>
                </p>
              </div>
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
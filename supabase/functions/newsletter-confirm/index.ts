import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ogiltig länk</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Ogiltig bekräftelselänk</h1>
            <p>Länken du klickade på är ogiltig eller saknar nödvändig information.</p>
          </div>
        </body>
        </html>
      `, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`Confirming newsletter subscription for token: ${token}`);

    // Find contact with this confirmation token
    const { data: contact, error: findError } = await supabase
      .from('email_contacts')
      .select('id, email, name, metadata')
      .eq('metadata->>confirmation_token', token)
      .eq('metadata->>newsletter_pending', 'true')
      .single();

    if (findError || !contact) {
      console.error("Contact not found or error:", findError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Länk ej funnen</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Bekräftelselänk ej funnen</h1>
            <p>Denna bekräftelselänk är ogiltig eller har redan använts. Om du nyligen registrerade dig, kontrollera att du använder den senaste länken i ditt mejl.</p>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // Check if token has expired
    const expiresAt = new Date(contact.metadata.confirmation_expires);
    if (new Date() > expiresAt) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Länk utgången</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Bekräftelselänk utgången</h1>
            <p>Denna bekräftelselänk har gått ut. Registrera dig igen för att få en ny bekräftelselänk.</p>
          </div>
        </body>
        </html>
      `, {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // Update contact to confirmed
    const { error: updateError } = await supabase
      .from('email_contacts')
      .update({
        metadata: {
          ...contact.metadata,
          newsletter_pending: false,
          newsletter_confirmed: true,
          confirmation_date: new Date().toISOString(),
          confirmation_token: null,
          confirmation_expires: null
        }
      })
      .eq('id', contact.id);

    if (updateError) {
      console.error("Error updating contact:", updateError);
      throw updateError;
    }

    // Find or create "Nyhetsbrevet" group
    let { data: newsletterGroup, error: groupError } = await supabase
      .from('email_groups')
      .select('id')
      .eq('name', 'Nyhetsbrevet')
      .single();

    if (groupError && groupError.code === 'PGRST116') {
      // Group doesn't exist, create it
      const { data: newGroup, error: createError } = await supabase
        .from('email_groups')
        .insert({
          name: 'Nyhetsbrevet',
          description: 'Alla som prenumererar på vårt nyhetsbrev',
          is_active: true
        })
        .select('id')
        .single();

      if (createError) throw createError;
      newsletterGroup = newGroup;
    } else if (groupError) {
      throw groupError;
    }

    // Add contact to newsletter group
    const { error: memberError } = await supabase
      .from('email_group_members')
      .insert({
        group_id: newsletterGroup.id,
        contact_id: contact.id
      })
      .select()
      .single();

    // Ignore duplicate errors (person already in group)
    if (memberError && !memberError.message.includes('duplicate')) {
      console.error("Error adding to group:", memberError);
      throw memberError;
    }

    console.log(`Newsletter subscription confirmed for: ${contact.email}`);

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prenumeration bekräftad!</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            max-width: 500px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          .success { color: #27ae60; font-size: 24px; margin-bottom: 20px; }
          .checkmark { font-size: 48px; color: #27ae60; margin-bottom: 20px; }
          .email { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1 class="success">Prenumeration bekräftad!</h1>
          <p>Tack <strong>${contact.name}</strong>! Din prenumeration på vårt nyhetsbrev är nu bekräftad.</p>
          <div class="email">${contact.email}</div>
          <p style="margin-top: 20px; color: #666;">Du kommer nu att få de senaste nyheterna om våra föreställningar och kurser direkt i din inkorg.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #888;">Du kan när som helst avregistrera dig via länken i våra mejl.</p>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (error: any) {
    console.error("Error in newsletter-confirm function:", error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fel uppstod</title>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">Ett fel uppstod</h1>
          <p>Vi kunde inte bekräfta din prenumeration just nu. Försök igen senare eller kontakta oss om problemet kvarstår.</p>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

serve(handler);
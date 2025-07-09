import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('token');
    
    // If no token in query params, try to get it from request body
    if (!token && req.method === 'POST') {
      try {
        const body = await req.json();
        token = body.token;
      } catch (e) {
        // Ignore JSON parsing errors, token might be in query params
      }
    }

    if (!token) {
      if (req.method === 'POST') {
        return new Response(JSON.stringify({
          success: false,
          error: 'invalid-token',
          message: 'Bekräftelsetoken saknas'
        }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
          }
        });
      } else {
        return new Response(
          `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <script>window.location.href = '/nyhetsbrev-bekraftelse?error=invalid-token';</script>
          </head>
          <body>
            <p>Omdirigerar...</p>
          </body>
          </html>`,
          {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          }
        );
      }
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
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script>window.location.href = '/nyhetsbrev-bekraftelse?error=invalid-token';</script>
        </head>
        <body>
          <p>Ogiltig token. Omdirigerar...</p>
        </body>
        </html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(contact.metadata.confirmation_expires);
    if (new Date() > expiresAt) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script>window.location.href = '/nyhetsbrev-bekraftelse?error=expired';</script>
        </head>
        <body>
          <p>Token har gått ut. Omdirigerar...</p>
        </body>
        </html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        }
      );
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

    // Check if this is a function call (POST with JSON) or direct browser access
    if (req.method === 'POST') {
      // Return JSON response for function calls
      return new Response(JSON.stringify({
        success: true,
        message: 'Newsletter subscription confirmed',
        email: contact.email,
        name: contact.name
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        }
      });
    } else {
      // Return HTML redirect for direct browser access
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script>window.location.href = '/nyhetsbrev-bekraftelse?token=${encodeURIComponent(token)}';</script>
        </head>
        <body>
          <p>Bekräftelse lyckades. Omdirigerar...</p>
        </body>
        </html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        }
      );
    }

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
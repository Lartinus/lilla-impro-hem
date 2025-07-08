import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    // Handle different POST request types
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // JSON request from React app
        const body = await req.json();
        email = body.email;
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        // Form submission
        const formData = await req.formData();
        const formEmail = formData.get('email') as string;
        
        if (formEmail) {
          // Redirect to GET with email parameter
          return new Response(null, {
            status: 302,
            headers: { "Location": `/newsletter-unsubscribe?email=${encodeURIComponent(formEmail)}` }
          });
        }
      }
    }

    if (!email && !token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Avregistrera från nyhetsbrev</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: #f5f5f5; 
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              background: white; 
              padding: 40px; 
              border-radius: 10px; 
              max-width: 500px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .form-group { margin: 20px 0; text-align: left; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
            .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
            .btn { background: #e74c3c; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            .btn:hover { background: #c0392b; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Avregistrera från nyhetsbrev</h1>
            <p>Ange din e-postadress för att avregistrera dig från vårt nyhetsbrev:</p>
            <form method="GET">
              <div class="form-group">
                <label for="email">E-postadress:</label>
                <input type="email" id="email" name="email" required placeholder="din@email.se">
              </div>
              <button type="submit" class="btn">Avregistrera</button>
            </form>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }


    const targetEmail = email || token; // Support both email and token-based unsubscribe

    if (!targetEmail) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ogiltig förfrågan</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Ogiltig förfrågan</h1>
            <p>E-postadress eller token krävs för att avregistrera.</p>
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

    console.log(`Unsubscribing email: ${targetEmail}`);

    // Find contact
    const { data: contact, error: findError } = await supabase
      .from('email_contacts')
      .select('id, email, metadata')
      .eq('email', targetEmail.toLowerCase().trim())
      .single();

    if (findError || !contact) {
      if (req.method === 'POST') {
        return new Response(JSON.stringify({ 
          error: 'E-post ej funnen',
          message: `Vi kunde inte hitta e-postadressen ${targetEmail} i vårt system.`
        }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>E-post ej funnen</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .warning { color: #f39c12; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="warning">E-post ej funnen</h1>
            <p>Vi kunde inte hitta e-postadressen <strong>${targetEmail}</strong> i vårt system.</p>
            <p>Du kanske redan är avregistrerad eller har aldrig varit registrerad för vårt nyhetsbrev.</p>
          </div>
        </body>
        </html>
      `, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // Find newsletter group
    const { data: newsletterGroup } = await supabase
      .from('email_groups')
      .select('id')
      .eq('name', 'Nyhetsbrevet')
      .single();

    // Remove from newsletter group if exists
    if (newsletterGroup) {
      await supabase
        .from('email_group_members')
        .delete()
        .eq('group_id', newsletterGroup.id)
        .eq('contact_id', contact.id);
    }

    // Update contact metadata to mark as unsubscribed
    const { error: updateError } = await supabase
      .from('email_contacts')
      .update({
        metadata: {
          ...contact.metadata,
          newsletter_confirmed: false,
          newsletter_unsubscribed: true,
          unsubscribe_date: new Date().toISOString()
        }
      })
      .eq('id', contact.id);

    if (updateError) {
      console.error("Error updating contact:", updateError);
      throw updateError;
    }

    console.log(`Successfully unsubscribed: ${contact.email}`);

    // Return JSON response for POST requests
    if (req.method === 'POST') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Du har framgångsrikt avprenumererat från våra utskick.',
        email: contact.email
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Avregistrering slutförd</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5;
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .success { color: #27ae60; font-size: 24px; margin-bottom: 20px; }
          .checkmark { font-size: 48px; color: #27ae60; margin-bottom: 20px; }
          .email { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="checkmark">✓</div>
          <h1 class="success">Avregistrering slutförd</h1>
          <p>Du har framgångsrikt avregistrerats från vårt nyhetsbrev.</p>
          <div class="email">${contact.email}</div>
          <p style="color: #666;">Du kommer inte längre att få våra nyhetsbrev. Om du ändrar dig kan du när som helst registrera dig igen på vår hemsida.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #888;">Tack för att du varit en del av Lilla Improteatern!</p>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe function:", error);
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
          <p>Vi kunde inte behandla din avregistrering just nu. Försök igen senare eller kontakta oss direkt.</p>
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
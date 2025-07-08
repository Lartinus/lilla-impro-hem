import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

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
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const token = url.searchParams.get('token');

    if (!email) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Fel vid avprenumeration</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1 class="error">Fel vid avprenumeration</h1>
          <p>E-postadress saknas. Vänligen kontakta oss direkt för att avprenumerera.</p>
        </body>
        </html>`,
        { 
          status: 400, 
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } 
        }
      );
    }

    console.log(`Processing unsubscribe request for: ${email}`);

    // Update email_contacts to mark as unsubscribed
    const { error: updateError } = await supabase
      .from('email_contacts')
      .update({ 
        metadata: supabase.sql`
          COALESCE(metadata, '{}'::jsonb) || '{"unsubscribed": true, "unsubscribed_at": "${new Date().toISOString()}"}'::jsonb
        `
      })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating contact:', updateError);
      // Don't fail - continue to try removing from groups
    }

    // Remove from all email groups
    const { error: removeError } = await supabase
      .from('email_group_members')
      .delete()
      .in('contact_id', 
        supabase.from('email_contacts').select('id').eq('email', email.toLowerCase())
      );

    if (removeError) {
      console.error('Error removing from groups:', removeError);
      // Don't fail - contact is still marked as unsubscribed
    }

    console.log(`Successfully unsubscribed: ${email}`);

    // Return success page
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Avprenumeration lyckades</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            text-align: center;
          }
          .success { color: #2e7d32; }
          .logo { 
            width: 150px; 
            height: auto; 
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <img src="/uploads/LIT_red_large.png" alt="Lilla Improteatern" class="logo">
        <h1 class="success">Du har avprenumererat!</h1>
        <p>Din e-postadress <strong>${email}</strong> har tagits bort från våra utskick.</p>
        <p>Vi kommer inte längre att skicka nyhetsbrev eller andra mejl till denna adress.</p>
        <p>Tack för din tid med oss!</p>
        <hr style="margin: 40px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          <a href="/" style="color: #d32f2f;">Tillbaka till Lilla Improteatern</a>
        </p>
      </body>
      </html>`,
      { 
        status: 200, 
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Error in unsubscribe function:", error);
    
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Fel vid avprenumeration</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1 class="error">Ett fel uppstod</h1>
        <p>Vi kunde inte behandla din avprenumeration just nu. Vänligen försök igen senare eller kontakta oss direkt.</p>
      </body>
      </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      }
    );
  }
};

serve(handler);
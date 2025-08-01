import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
      // Return HTML redirect instead of 302 redirect
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script>window.location.href = '/avprenumerera?error=missing-email';</script>
        </head>
        <body>
          <p>Omdirigerar...</p>
        </body>
        </html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
        }
      );
    }

    console.log(`Processing unsubscribe request for: ${email}`);

    try {
      // First get the contact to preserve existing metadata
      const { data: contactData, error: getError } = await supabase
        .from('email_contacts')
        .select('id, metadata')
        .eq('email', email.toLowerCase())
        .single();

      if (getError || !contactData) {
        console.error('Contact not found:', getError);
        throw new Error('Kontakt hittades inte');
      }

      // Update email_contacts to mark as unsubscribed, preserving existing metadata
      const updatedMetadata = {
        ...contactData.metadata,
        unsubscribed: true,
        unsubscribed_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('email_contacts')
        .update({ metadata: updatedMetadata })
        .eq('email', email.toLowerCase());

      if (updateError) {
        console.error('Error updating contact:', updateError);
        throw updateError;
      }

      // Remove from all email groups
      const { error: removeError } = await supabase
        .from('email_group_members')
        .delete()
        .eq('contact_id', contactData.id);

      if (removeError) {
        console.error('Error removing from groups:', removeError);
        // Don't throw - contact is still marked as unsubscribed
      }

      console.log(`Successfully unsubscribed: ${email}`);

      // Return HTML redirect for success
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script>window.location.href = '/avprenumerera?email=${encodeURIComponent(email)}';</script>
        </head>
        <body>
          <p>Avprenumeration lyckades. Omdirigerar...</p>
        </body>
        </html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
        }
      );

    } catch (error: any) {
      console.error("Error in unsubscribe function:", error);
      
      // Return HTML redirect for error
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <script>window.location.href = '/avprenumerera?email=${encodeURIComponent(email)}&error=processing';</script>
        </head>
        <body>
          <p>Ett fel uppstod. Omdirigerar...</p>
        </body>
        </html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
        }
      );
    }

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
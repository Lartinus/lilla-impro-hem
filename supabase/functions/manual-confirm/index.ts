import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token || token !== 'manual-confirm-david') {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Manual confirmation for David's newsletter subscription");

    // Find David's contact
    const { data: contact, error: findError } = await supabase
      .from('email_contacts')
      .select('id, email, name, metadata')
      .eq('email', 'david@davidrosenqvist.se')
      .eq('source', 'newsletter')
      .single();

    if (findError || !contact) {
      console.error("Contact not found:", findError);
      return new Response("Contact not found", { status: 404 });
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
          confirmation_expires: null,
          manual_confirmation: true
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

    // Ignore duplicate errors
    if (memberError && !memberError.message.includes('duplicate')) {
      console.error("Error adding to group:", memberError);
      throw memberError;
    }

    console.log(`Manual newsletter confirmation completed for: ${contact.email}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `David's newsletter subscription manually confirmed`,
      contact: contact.email,
      group: newsletterGroup.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("Error in manual-confirm function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
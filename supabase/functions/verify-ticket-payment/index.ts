import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { sessionId } = (await req.json()) as VerifyRequest;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    console.log("[verify-ticket-payment] Verifying session:", sessionId);

    // Determine Stripe mode from settings
    let stripeMode: "live" | "test" = "test";
    const { data: settings } = await sb
      .from("settings")
      .select("value")
      .eq("key", "stripe_mode")
      .maybeSingle();

    if (settings?.value === "live") stripeMode = "live";

    const secretKey = stripeMode === "live"
      ? Deno.env.get("STRIPE_SECRETKEY_LIVE")
      : Deno.env.get("STRIPE_SECRETKEY_TEST");

    if (!secretKey) {
      console.error("[verify-ticket-payment] Missing Stripe secret key for mode:", stripeMode);
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("[verify-ticket-payment] Stripe session status:", session.status, "payment_status:", session.payment_status);

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (!isPaid) {
      return new Response(JSON.stringify({ success: false, message: "Payment not completed yet" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch purchase
    const { data: purchase, error: purchaseErr } = await sb
      .from("ticket_purchases")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (purchaseErr) {
      console.error("[verify-ticket-payment] Error fetching purchase:", purchaseErr);
    }

    if (!purchase) {
      return new Response(JSON.stringify({ error: "Purchase not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update purchase to paid if needed
    if (purchase.payment_status !== "paid") {
      const { error: updErr } = await sb
        .from("ticket_purchases")
        .update({ payment_status: "paid", updated_at: new Date().toISOString() })
        .eq("id", purchase.id);
      if (updErr) console.error("[verify-ticket-payment] Failed updating purchase to paid:", updErr);
    }

    // Update discount usage if applicable
    try {
      if (purchase.discount_code) {
        const sbAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { auth: { persistSession: false } });
        const { data: discResp, error: discErr } = await sbAnon.functions.invoke("update-discount-usage", {
          body: { code: purchase.discount_code },
        });
        if (discErr) console.warn("[verify-ticket-payment] Discount usage update error:", discErr);
        else console.log("[verify-ticket-payment] Discount usage updated:", discResp);
      }
    } catch (e) {
      console.warn("[verify-ticket-payment] Exception updating discount usage:", e);
    }

    // Send confirmation email
    try {
      const sbAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { auth: { persistSession: false } });
      const { data: emailResp, error: emailErr } = await sbAnon.functions.invoke("send-ticket-confirmation", {
        body: purchase,
      });
      if (emailErr) console.error("[verify-ticket-payment] Email send error:", emailErr);
      else console.log("[verify-ticket-payment] Confirmation email sent:", emailResp);
    } catch (e) {
      console.error("[verify-ticket-payment] Exception sending email:", e);
    }

    const response = {
      success: true,
      purchase: {
        showTitle: purchase.show_title,
        showDate: purchase.show_date,
        showLocation: purchase.show_location,
        buyerName: purchase.buyer_name,
        totalTickets: (purchase.regular_tickets || 0) + (purchase.discount_tickets || 0),
        ticketCode: purchase.ticket_code,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("[verify-ticket-payment] Error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

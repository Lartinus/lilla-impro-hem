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

    console.log("[verify-course-payment] Verifying session:", sessionId);

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
      console.error("[verify-course-payment] Missing Stripe secret key for mode:", stripeMode);
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2023-10-16" });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("[verify-course-payment] Stripe session status:", session.status, "payment_status:", session.payment_status);

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (!isPaid) {
      return new Response(JSON.stringify({ success: false, message: "Payment not completed yet" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch purchase
    const { data: purchase, error: purchaseErr } = await sb
      .from("course_purchases")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (purchaseErr) {
      console.error("[verify-course-payment] Error fetching purchase:", purchaseErr);
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
        .from("course_purchases")
        .update({ payment_status: "paid", updated_at: new Date().toISOString() })
        .eq("id", purchase.id);
      if (updErr) console.error("[verify-course-payment] Failed updating purchase to paid:", updErr);
    }

    // Ensure participant exists in course table
    if (purchase.course_table_name) {
      // Check duplicate
      let isDuplicate = false;
      const { data: dupRes, error: dupErr } = await sb.rpc("check_duplicate_course_booking", {
        table_name: purchase.course_table_name,
        email_address: (purchase.buyer_email || "").toLowerCase(),
      });
      if (dupErr) {
        console.warn("[verify-course-payment] Duplicate check error, continuing:", dupErr);
      } else {
        isDuplicate = Boolean(dupRes);
      }

      if (!isDuplicate) {
        const { error: insErr } = await sb.rpc("insert_course_booking", {
          table_name: purchase.course_table_name,
          booking_name: purchase.buyer_name,
          booking_phone: purchase.buyer_phone || "",
          booking_email: purchase.buyer_email,
          booking_address: purchase.buyer_address || "",
          booking_postal_code: purchase.buyer_postal_code || "",
          booking_city: purchase.buyer_city || "",
          booking_message: purchase.buyer_message || "",
        });
        if (insErr) console.error("[verify-course-payment] Failed inserting participant:", insErr);
        else console.log("[verify-course-payment] Participant inserted in:", purchase.course_table_name);
      } else {
        console.log("[verify-course-payment] Participant already exists in:", purchase.course_table_name);
      }
    }

    // Handle potential offer record linked to this session
    const { data: offer } = await sb
      .from("course_offers")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (offer && offer.status !== "paid") {
      // Remove from waitlist if present
      if (offer.course_instance_id && offer.waitlist_email) {
        const { error: wlErr } = await sb.rpc("remove_from_waitlist", {
          course_instance_id_param: offer.course_instance_id,
          email_param: offer.waitlist_email,
        });
        if (wlErr) console.warn("[verify-course-payment] Failed removing from waitlist:", wlErr);
      }

      const { error: offErr } = await sb
        .from("course_offers")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", offer.id);
      if (offErr) console.error("[verify-course-payment] Failed updating offer status:", offErr);
    }

    // Fetch course instance for email details
    let start_date: string | null = null;
    let start_time: string | null = null;
    if (purchase.course_instance_id) {
      const { data: ci } = await sb
        .from("course_instances")
        .select("start_date, start_time")
        .eq("id", purchase.course_instance_id)
        .maybeSingle();
      start_date = ci?.start_date ?? null;
      start_time = ci?.start_time ?? null;
    }

    // Send confirmation email
    try {
      const emailPayload = {
        name: purchase.buyer_name,
        email: purchase.buyer_email,
        courseTitle: purchase.course_title,
        isAvailable: true,
        courseStartDate: start_date,
        courseStartTime: start_time,
      } as const;
      const sbAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { auth: { persistSession: false } });
      const { data: emailResp, error: emailErr } = await sbAnon.functions.invoke("send-course-confirmation", {
        body: emailPayload,
      });
      if (emailErr) console.error("[verify-course-payment] Email send error:", emailErr);
      else console.log("[verify-course-payment] Confirmation email sent:", emailResp);
    } catch (e) {
      console.error("[verify-course-payment] Exception sending email:", e);
    }

    const response = {
      success: true,
      purchase: {
        courseTitle: purchase.course_title,
        buyerName: purchase.buyer_name,
        buyerEmail: purchase.buyer_email,
        totalAmount: purchase.total_amount,
        paymentStatus: "paid",
        created_at: purchase.created_at,
      },
      fromOffer: Boolean(offer),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("[verify-course-payment] Error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

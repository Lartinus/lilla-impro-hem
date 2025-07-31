import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      courseInstanceId,
      courseTitle,
      courseTableName,
      price,
      discountPrice,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      buyerPostalCode,
      buyerCity,
      buyerMessage,
      useDiscountPrice
    } = await req.json();

    console.log('Creating course checkout for:', courseTitle);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRETKEY_TEST") || "", {
      apiVersion: "2023-10-16",
    });

    // Calculate total amount based on price type
    const totalAmount = useDiscountPrice ? discountPrice : price;
    const priceType = useDiscountPrice ? "Studentpris" : "Ordinarie pris";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "sek",
            product_data: {
              name: `${courseTitle} - ${priceType}`,
              description: `Kursbokining för ${courseTitle}`,
            },
            unit_amount: totalAmount * 100, // Convert to öre
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/kurser?payment=success`,
      cancel_url: `${req.headers.get("origin")}/kurser?payment=cancelled`,
    });

    console.log('Stripe session created:', session.id);

    // Store course purchase in database
    const { error: insertError } = await supabase
      .from('course_purchases')
      .insert({
        course_instance_id: courseInstanceId,
        course_title: courseTitle,
        course_table_name: courseTableName,
        total_amount: totalAmount,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        buyer_address: buyerAddress || null,
        buyer_postal_code: buyerPostalCode || null,
        buyer_city: buyerCity || null,
        buyer_message: buyerMessage || null,
        stripe_session_id: session.id,
        payment_status: 'pending'
      });

    if (insertError) {
      console.error('Error storing course purchase:', insertError);
      throw new Error('Failed to store course purchase');
    }

    console.log('Course purchase stored successfully');

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error creating course checkout:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
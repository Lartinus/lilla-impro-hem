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
    console.log('=== COURSE CHECKOUT START ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const body = await req.json();
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
    } = body;

    console.log('Request body received:', body);
    console.log('Creating course checkout for:', courseTitle);
    
    // Check if Stripe secret key exists
    const stripeSecretKey = Deno.env.get("STRIPE_SECRETKEY_TEST");
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRETKEY_TEST environment variable is not set');
      throw new Error('Stripe configuration missing');
    }
    
    console.log('Stripe key found, length:', stripeSecretKey.length);

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Calculate total amount based on price type
    const totalAmount = useDiscountPrice ? discountPrice : price;
    const priceType = useDiscountPrice ? "Studentpris" : "Ordinarie pris";

    console.log('Creating session with amount:', totalAmount, 'type:', priceType);

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
      success_url: `${req.headers.get("origin")}/kurser/tack?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
    });

    console.log('Stripe session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);
    console.log('Full session object:', JSON.stringify(session, null, 2));

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
    console.log('Returning URL to frontend:', session.url);

    const response = { url: session.url };
    console.log('Final response object:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('=== ERROR IN COURSE CHECKOUT ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check edge function logs for more information' 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
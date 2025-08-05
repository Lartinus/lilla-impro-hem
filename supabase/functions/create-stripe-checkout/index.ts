
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRETKEY_TEST')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { 
      showSlug, 
      showTitle, 
      showDate, 
      showLocation,
      regularTickets, 
      discountTickets, 
      discountCode,
      ticketPrice,
      discountPrice,
      buyerName,
      buyerEmail,
      buyerPhone 
    } = await req.json();

    // Calculate total
    const regularTotal = regularTickets * ticketPrice;
    const discountTotal = discountTickets * discountPrice;
    let totalAmount = regularTotal + discountTotal;
    
    // Apply discount code
    if (discountCode?.toLowerCase() === 'rabatt10') {
      totalAmount = Math.round(totalAmount * 0.9);
    }

    // Generate unique ticket code and QR data
    const { data: ticketCode } = await supabase.rpc('generate_ticket_code');
    const qrData = JSON.stringify({
      ticketCode,
      showSlug,
      tickets: regularTickets + discountTickets,
      buyer: buyerName
    });

    // Check if this is a free show
    if (totalAmount === 0) {
      // For free shows, create ticket directly without Stripe
      const freeTicketId = crypto.randomUUID();
      
      // Store paid purchase in database (free tickets are marked as paid immediately)
      const { error: dbError } = await supabase
        .from('ticket_purchases')
        .insert({
          show_slug: showSlug,
          show_title: showTitle,
          show_date: showDate,
          show_location: showLocation,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          regular_tickets: regularTickets,
          discount_tickets: discountTickets,
        total_amount: totalAmount * 100, // Store in öre
          discount_code: discountCode || null,
          ticket_code: ticketCode,
          qr_data: qrData,
          stripe_session_id: freeTicketId,
          payment_status: 'paid'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to store free ticket');
      }

      // Send confirmation email for free tickets
      try {
        await supabase.functions.invoke('send-ticket-confirmation', {
          body: {
            show_slug: showSlug,
            show_title: showTitle,
            show_date: showDate,
            show_location: showLocation,
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            buyer_phone: buyerPhone,
            regular_tickets: regularTickets,
            discount_tickets: discountTickets,
            total_amount: totalAmount * 100, // Store in öre
            discount_code: discountCode || null,
            ticket_code: ticketCode,
            qr_data: qrData,
            payment_status: 'paid'
          }
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the ticket creation if email fails
      }

      // Return success URL for free tickets
      return new Response(JSON.stringify({ 
        url: `${req.headers.get('origin')}/forestallningar/tack?session_id=${freeTicketId}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For paid shows, proceed with Stripe checkout
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'sek',
        'line_items[0][price_data][product_data][name]': `${showTitle} - Biljetter`,
        'line_items[0][price_data][unit_amount]': (totalAmount * 100).toString(),
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${req.headers.get('origin')}/forestallningar/tack?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${req.headers.get('origin')}/payment-cancelled`,
        'metadata[show_slug]': showSlug,
        'metadata[ticket_code]': ticketCode,
      }).toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      throw new Error(session.error?.message || 'Stripe error');
    }

    // Store pending purchase in database
    const { error: dbError } = await supabase
      .from('ticket_purchases')
      .insert({
        show_slug: showSlug,
        show_title: showTitle,
        show_date: showDate,
        show_location: showLocation,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        regular_tickets: regularTickets,
        discount_tickets: discountTickets,
        total_amount: totalAmount * 100, // Store in öre
        discount_code: discountCode || null,
        ticket_code: ticketCode,
        qr_data: qrData,
        stripe_session_id: session.id,
        payment_status: 'pending'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store purchase');
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

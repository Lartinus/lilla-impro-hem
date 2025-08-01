
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Webhook called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('No signature provided');
    }

    // Parse the webhook event
    const event = JSON.parse(body);
    console.log('Received webhook event:', event.type, 'Session ID:', event.data?.object?.id);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.id;
      
      // Try to update ticket purchase first
      const { error: ticketUpdateError } = await supabase
        .from('ticket_purchases')
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId);

      // Get ticket purchase details for email
      const { data: ticketPurchase } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (ticketPurchase) {
        console.log('Found ticket purchase, sending confirmation email');
        // Send ticket confirmation email
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-ticket-confirmation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ticketPurchase),
        });
        
        if (!emailResponse.ok) {
          console.error('Failed to send ticket confirmation email:', await emailResponse.text());
        } else {
          console.log('Ticket confirmation email sent successfully');
        }
      } else {
        // Try to update course purchase
        const { error: courseUpdateError } = await supabase
          .from('course_purchases')
          .update({ 
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', sessionId);

        if (courseUpdateError) {
          console.error('Error updating course purchase:', courseUpdateError);
          throw courseUpdateError;
        }

        // Get course purchase details
        const { data: coursePurchase } = await supabase
          .from('course_purchases')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (coursePurchase) {
          console.log('Found course purchase, adding to course table:', coursePurchase.course_table_name);
          
          // Add to course table after successful payment
          const { error: insertError } = await supabase.rpc('insert_course_booking', {
            table_name: coursePurchase.course_table_name,
            booking_name: coursePurchase.buyer_name,
            booking_phone: coursePurchase.buyer_phone,
            booking_email: coursePurchase.buyer_email,
            booking_address: coursePurchase.buyer_address || '',
            booking_postal_code: coursePurchase.buyer_postal_code || '',
            booking_city: coursePurchase.buyer_city || '',
            booking_message: coursePurchase.buyer_message || ''
          });

          if (insertError) {
            console.error('Error inserting course booking:', insertError);
          } else {
            console.log('Successfully added participant to course table');
          }

          // Send course confirmation email
          console.log('Sending course confirmation email to:', coursePurchase.buyer_email);
          await fetch(`${supabaseUrl}/functions/v1/send-course-confirmation`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: coursePurchase.buyer_email,
              name: coursePurchase.buyer_name,
              phone: coursePurchase.buyer_phone,
              courseTitle: coursePurchase.course_title,
              isAvailable: true
            }),
          });
        } else {
          console.log('No course purchase found for session:', sessionId);
        }
      }
    } else {
      console.log('Received non-checkout event:', event.type);
    }

    console.log('Webhook processed successfully');
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

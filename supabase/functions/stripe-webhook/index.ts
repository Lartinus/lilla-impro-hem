import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helper function to log steps with timestamp
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  logStep('Webhook called', { method: req.method, url: req.url });
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add simple ping endpoint for testing
  if (req.method === 'GET') {
    logStep('Ping endpoint called');
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'stripe-webhook'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!supabaseUrl) {
      logStep('ERROR: Missing SUPABASE_URL');
      throw new Error('Missing SUPABASE_URL environment variable');
    }
    
    if (!supabaseKey) {
      logStep('ERROR: Missing SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    
    if (!stripeWebhookSecret) {
      logStep('ERROR: Missing STRIPE_WEBHOOK_SECRET');
      throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    }
    
    logStep('Environment variables validated');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    logStep('Supabase client created');
    
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      logStep('ERROR: No stripe signature provided');
      return new Response(JSON.stringify({ error: 'Invalid request - no signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRETKEY_TEST') || Deno.env.get('STRIPE_SECRETKEY_LIVE');
    if (!stripeKey) {
      logStep('ERROR: No Stripe secret key found');
      throw new Error('Missing Stripe secret key');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep('Stripe client initialized');

    let event: any;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
      logStep('Webhook signature verified successfully');
    } catch (err) {
      logStep('ERROR: Invalid webhook signature', { error: err.message });
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('Received webhook event', { 
      type: event.type, 
      sessionId: event.data?.object?.id,
      eventId: event.id 
    });
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const sessionId = session.id;
      
      // Check for duplicate processing (idempotency)
      const eventId = event.id;
      logStep('Processing checkout.session.completed', { sessionId, eventId });
      
      // Try to update ticket purchase first
      logStep('Attempting to update ticket purchase', { sessionId });
      const { error: ticketUpdateError } = await supabase
        .from('ticket_purchases')
        .update({ 
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId);

      if (ticketUpdateError) {
        logStep('No ticket purchase to update or error occurred', { error: ticketUpdateError.message });
      }

      // Get ticket purchase details for email
      const { data: ticketPurchase, error: ticketSelectError } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();
      
      if (ticketSelectError) {
        logStep('No ticket purchase found', { error: ticketSelectError.message });
      }

      if (ticketPurchase) {
        logStep('Found ticket purchase, processing', { 
          ticketId: ticketPurchase.id,
          buyerEmail: ticketPurchase.buyer_email 
        });
        
        // Update discount code usage if discount was applied
        if (ticketPurchase.discount_code) {
          try {
            logStep('Updating discount code usage', { code: ticketPurchase.discount_code });
            const { error: updErr } = await supabase.functions.invoke('update-discount-usage', {
              body: { code: ticketPurchase.discount_code },
              headers: { 'X-Internal-Secret': Deno.env.get('INTERNAL_FUNCTION_SECRET') || '' },
            });
            if (updErr) {
              logStep('ERROR: Failed to update discount code usage', { error: updErr });
            } else {
              logStep('Successfully updated discount code usage', { code: ticketPurchase.discount_code });
            }
          } catch (error) {
            logStep('ERROR: Exception updating discount code usage', { error: error.message });
          }
        }
        
        // Send ticket confirmation email
        try {
          logStep('Sending ticket confirmation email', { email: ticketPurchase.buyer_email });
          const { error: emailErr } = await supabase.functions.invoke('send-ticket-confirmation', {
            body: ticketPurchase,
            headers: { 'X-Internal-Secret': Deno.env.get('INTERNAL_FUNCTION_SECRET') || '' },
          });
          
          if (emailErr) {
            logStep('ERROR: Failed to send ticket confirmation email', { error: emailErr });
          } else {
            logStep('Ticket confirmation email sent successfully');
          }
        } catch (error) {
          logStep('ERROR: Exception sending ticket confirmation email', { error: error.message });
        }
      } else {
        // Try to update course purchase
        logStep('No ticket purchase found, trying course purchase', { sessionId });
        const { error: courseUpdateError } = await supabase
          .from('course_purchases')
          .update({ 
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', sessionId);

        if (courseUpdateError) {
          logStep('ERROR: Failed to update course purchase', { error: courseUpdateError.message });
          // Don't throw error - log and continue to check if purchase exists
        }

        // Get course purchase details
        const { data: coursePurchase, error: courseSelectError } = await supabase
          .from('course_purchases')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (courseSelectError) {
          logStep('No course purchase found', { error: courseSelectError.message });
        }

        if (coursePurchase) {
          logStep('Found course purchase, processing', { 
            courseTitle: coursePurchase.course_title,
            tableName: coursePurchase.course_table_name,
            buyerEmail: coursePurchase.buyer_email
          });
          
          // Check if this is from a course offer (waitlist)
          const { data: courseOffer, error: offerError } = await supabase
            .from('course_offers')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();
          
          if (offerError) {
            logStep('No course offer found (not from waitlist)', { error: offerError.message });
          } else {
            logStep('Found course offer (from waitlist)', { offerId: courseOffer.id });
          }

          // Add to course table after successful payment
          // Use phone from course offer if available, otherwise use default
          const phoneToUse = coursePurchase.buyer_phone || (courseOffer ? courseOffer.waitlist_phone : '') || '000000';
          
          logStep('Adding participant to course table', { 
            tableName: coursePurchase.course_table_name,
            participantEmail: coursePurchase.buyer_email 
          });
          
          const { error: insertError } = await supabase.rpc('insert_course_booking', {
            table_name: coursePurchase.course_table_name,
            booking_name: coursePurchase.buyer_name,
            booking_phone: phoneToUse,
            booking_email: coursePurchase.buyer_email,
            booking_address: coursePurchase.buyer_address || '',
            booking_postal_code: coursePurchase.buyer_postal_code || '',
            booking_city: coursePurchase.buyer_city || '',
            booking_message: coursePurchase.buyer_message || ''
          });

          if (insertError) {
            logStep('ERROR: Failed to insert course booking', { error: insertError.message });
          } else {
            logStep('Successfully added participant to course table');
            
            // If this was from a course offer, remove from waitlist and update offer status
            if (courseOffer) {
              logStep('Processing course offer payment - removing from waitlist');
              
              // Remove from waitlist
              const { error: removeError } = await supabase.rpc('remove_from_waitlist', {
                course_instance_id_param: courseOffer.course_instance_id,
                email_param: courseOffer.waitlist_email
              });

              if (removeError) {
                logStep('ERROR: Failed to remove from waitlist', { error: removeError.message });
              } else {
                logStep('Successfully removed from waitlist');
              }

              // Update offer status to paid
              const { error: offerUpdateError } = await supabase
                .from('course_offers')
                .update({ 
                  status: 'paid',
                  paid_at: new Date().toISOString()
                })
                .eq('stripe_session_id', sessionId);
              
              if (offerUpdateError) {
                logStep('ERROR: Failed to update offer status', { error: offerUpdateError.message });
              } else {
                logStep('Successfully updated offer status to paid');
              }
            }
          }

          // Send course confirmation email for all successful course bookings
          if (!insertError) {
            try {
              logStep('Sending course confirmation email', { email: coursePurchase.buyer_email });
              const { error: courseEmailErr } = await supabase.functions.invoke('send-course-confirmation', {
                body: {
                  email: coursePurchase.buyer_email,
                  name: coursePurchase.buyer_name,
                  phone: phoneToUse,
                  courseTitle: coursePurchase.course_title,
                  isAvailable: true
                },
                headers: { 'X-Internal-Secret': Deno.env.get('INTERNAL_FUNCTION_SECRET') || '' },
              });
              
              if (courseEmailErr) {
                logStep('ERROR: Failed to send course confirmation email', { error: courseEmailErr });
              } else {
                logStep('Course confirmation email sent successfully');
              }
            } catch (error) {
              logStep('ERROR: Exception sending course confirmation email', { error: error.message });
            }
          }
        } else {
          logStep('No course purchase found for session', { sessionId });
        }
      }
    } else {
      logStep('Received non-checkout event - ignoring', { eventType: event.type });
    }

    logStep('Webhook processed successfully', { eventType: event.type, sessionId: event.data?.object?.id });
    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep('ERROR: Webhook processing failed', { 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Return 200 to Stripe even on errors to prevent retries for non-recoverable errors
    // Only return 400/500 for signature verification failures
    const isSignatureError = error.message?.includes('signature') || error.message?.includes('Invalid');
    const statusCode = isSignatureError ? 400 : 200;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      processed: false,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
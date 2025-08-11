import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';
import { supabase } from '../_shared/supabase.ts';
import { logSentEmail } from '../_shared/email-logger.ts';
import { createUnifiedEmailTemplate } from '../_shared/email-template.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendTicketRequest {
  ticketId: string;
  adminUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketId, adminUserId }: ResendTicketRequest = await req.json();

    if (!ticketId || !adminUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: ticketId and adminUserId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Resending ticket confirmation for ticket: ${ticketId} by admin: ${adminUserId}`);

    // Get ticket purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .select('*')
      .eq('id', ticketId)
      .eq('payment_status', 'paid')
      .single();

    if (purchaseError || !purchase) {
      console.error('Ticket not found or not paid:', purchaseError);
      return new Response(
        JSON.stringify({ error: 'Ticket not found or not paid' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check resend limit
    if (purchase.resend_count >= 5) {
      return new Response(
        JSON.stringify({ error: 'Maximum resend limit reached (5 times)' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get active email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'AUTO: Biljettbekräftelse')
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Email template not found:', templateError);
      return new Response(
        JSON.stringify({ error: 'Email template not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Add buyer as contact in Resend (if not already exists)
    try {
      const contactData = {
        email: purchase.buyer_email,
        first_name: purchase.buyer_name.split(' ')[0] || purchase.buyer_name,
        last_name: purchase.buyer_name.split(' ').slice(1).join(' ') || '',
        unsubscribed: false
      };

      console.log('Adding ticket buyer as contact to Resend:', contactData);
      await resend.contacts.create({ audienceId: Deno.env.get('RESEND_AUDIENCE_ID') || '', ...contactData });
    } catch (contactError: any) {
      console.log('Contact creation failed (continuing with email):', contactError.message);
    }

    // Replace template variables (using same format as original send-ticket-confirmation)
    const variables = {
      NAMN: purchase.buyer_name,
      FORESTALLNING: purchase.show_title,
      DATUM: purchase.show_date,
      BILJETTKOD: purchase.ticket_code
    };

    let subject = template.subject;
    let content = template.content;

    // Replace variables in subject and content (using single curly braces)
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      subject = subject.replace(regex, String(value));
      content = content.replace(regex, String(value));
    });

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(purchase.qr_data)}`;
    
    // Format date and time properly
    let formattedDate = purchase.show_date;
    let formattedTime = '';
    
    try {
      const showDateTime = new Date(purchase.show_date);
      formattedDate = showDateTime.toLocaleDateString('sv-SE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      formattedTime = showDateTime.toLocaleTimeString('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
    }

    // Add ticket details to the content before template processing (same as original function)
    const contentWithTicketInfo = content + `

H2: Dina biljettdetaljer

Datum: ${formattedDate}
Tid: ${formattedTime}
Plats: ${purchase.show_location}
Biljetter: ${purchase.regular_tickets + purchase.discount_tickets} st
Biljettkod: ${purchase.ticket_code}

[QR_CODE_PLACEHOLDER]

Visa denna QR-kod vid entrén. Om ni köpt flera biljetter och sällskapet kommer vi olika tider använder alla samma QR-kod.`;

    const finalHtmlContent = createUnifiedEmailTemplate(
      subject,
      contentWithTicketInfo,
      template.background_image,
      { showUnsubscribe: false }
    );

    // Inject QR code into the final content
    const htmlWithQR = finalHtmlContent
      .replace('[QR_CODE_PLACEHOLDER]', `<div style="margin: 20px 0;"><img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px; display: block;"></div>`);

    // Send email
    const emailResponse = await resend.emails.send({
      from: 'Lilla Improteatern <kontakt@improteatern.se>',
      to: [purchase.buyer_email],
      subject: `[OMSKICKAT] ${subject}`,
      html: htmlWithQR,
      tags: [
        { name: 'type', value: 'ticket_confirmation_resend' },
        { name: 'show_slug', value: purchase.show_slug },
        { name: 'admin_user', value: adminUserId }
      ]
    });

    console.log('Resend email response:', emailResponse);

    // Update resend tracking using the database function
    const { error: updateError } = await supabase.rpc('update_ticket_resend_tracking', {
      ticket_id_param: ticketId,
      admin_user_id_param: adminUserId
    });

    if (updateError) {
      console.error('Failed to update resend tracking:', updateError);
      // Don't fail the request, just log the error
    }

    // Log the sent email
    await logSentEmail({
      recipientEmail: purchase.buyer_email,
      recipientName: purchase.buyer_name,
      subject: `[OMSKICKAT] ${subject}`,
      content: content,
      htmlContent: htmlWithQR,
      emailType: 'ticket_confirmation_resend',
      sourceFunction: 'resend-ticket-confirmation',
      resendId: emailResponse.data?.id,
      status: 'sent'
    });

    console.log('Ticket confirmation resent successfully using template:', template.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ticket confirmation resent successfully',
        resend_count: (purchase.resend_count || 0) + 1
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in resend-ticket-confirmation function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to resend ticket confirmation',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
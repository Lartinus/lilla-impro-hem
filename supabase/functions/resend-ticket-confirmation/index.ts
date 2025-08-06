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

    // Replace template variables
    const variables = {
      buyer_name: purchase.buyer_name,
      show_title: purchase.show_title,
      show_date: purchase.show_date,
      show_location: purchase.show_location,
      total_tickets: purchase.regular_tickets + purchase.discount_tickets,
      ticket_code: purchase.ticket_code,
      qr_data: purchase.qr_data
    };

    let subject = template.subject;
    let content = template.content;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(purchase.qr_data)}`;
    
    // Format show date and time for display
    const showDate = new Date(purchase.show_date).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create the final HTML content using the unified template
    const finalHtmlContent = createUnifiedEmailTemplate(
      template.title || 'Biljettbekräftelse',
      content,
      template.background_image
    );

    // Inject QR code into the final content
    const htmlWithQR = finalHtmlContent.replace(
      '{{qr_code}}',
      `<div style="text-align: center; margin: 20px 0;">
        <img src="${qrCodeUrl}" alt="QR kod för biljett" style="max-width: 200px; height: auto;" />
        <p style="margin-top: 10px; font-size: 14px; color: #666;">Visa denna QR-kod vid entrén</p>
      </div>`
    );

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
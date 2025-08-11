import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { createUnifiedEmailTemplate } from "../_shared/email-template.ts";
import { logSentEmail } from "../_shared/email-logger.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseOfferRequest {
  courseInstanceId: string;
  courseTitle: string;
  courseTableName: string;
  coursePrice: number;
  courseDiscountPrice: number;
  waitlistEmail: string;
  waitlistName: string;
  waitlistPhone?: string;
  waitlistMessage?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Send course offer function started');

    // Initialize Supabase with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Authentication failed');
    }

    // Check if user is admin
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);

    const isAdmin = userRoles?.some(role => role.role === 'admin');
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    const requestData: CourseOfferRequest = await req.json();
    console.log('Course offer request:', requestData);

    // Generate unique offer token
    const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_offer_token');
    if (tokenError) {
      throw new Error(`Failed to generate token: ${tokenError.message}`);
    }

    const offerToken = tokenData;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    // Create course offer record
    const { error: offerError } = await supabaseAdmin
      .from('course_offers')
      .insert({
        course_instance_id: requestData.courseInstanceId,
        course_title: requestData.courseTitle,
        course_table_name: requestData.courseTableName,
        course_price: requestData.coursePrice,
        course_discount_price: requestData.courseDiscountPrice,
        waitlist_email: requestData.waitlistEmail,
        waitlist_name: requestData.waitlistName,
        waitlist_phone: requestData.waitlistPhone || '',
        waitlist_message: requestData.waitlistMessage || '',
        offer_token: offerToken,
        expires_at: expiresAt.toISOString(),
        status: 'sent'
      });

    if (offerError) {
      throw new Error(`Failed to create offer record: ${offerError.message}`);
    }

    // Get email template from database
    const { data: emailTemplate } = await supabaseAdmin
      .from('email_templates')
      .select('subject, content')
      .eq('name', 'AUTO: course_offer')
      .eq('is_active', true)
      .single();

    // Send email using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const origin = req.headers.get('origin') || 'https://improteatern.se';
    const offerUrl = `${origin}/course-offer-payment/${offerToken}`;

    // Use template if available, otherwise fallback to default
    let emailSubject = 'Du har erbjudits en plats i kursen!';
    let emailContent = `
H1: Du har erbjudits en plats i kursen!

Hej ${requestData.waitlistName}!

Vi är glada att kunna erbjuda dig en plats i kursen "${requestData.courseTitle}".

**Kursinformation:**
- Kurs: ${requestData.courseTitle}
- Ordinarie pris: ${requestData.coursePrice} kr
- Studentpris: ${requestData.courseDiscountPrice} kr

För att säkra din plats behöver du betala senast ${expiresAt.toLocaleDateString('sv-SE')} kl ${expiresAt.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}.

**Betala och säkra din plats:**
${offerUrl}

Om du inte betalar inom tidsfristen kommer platsen att erbjudas till nästa person på väntelistan.

Har du frågor? Svara bara på detta mejl.

Välkommen!
`;

    if (emailTemplate) {
      emailSubject = emailTemplate.subject
        .replace('{KURSTITEL}', requestData.courseTitle);
      
      emailContent = emailTemplate.content
        .replace('{NAMN}', requestData.waitlistName)
        .replace(/\{KURSTITEL\}/g, requestData.courseTitle)
        .replace('{ORDINARIE_PRIS}', requestData.coursePrice.toString())
        .replace('{STUDENT_PRIS}', requestData.courseDiscountPrice.toString())
        .replace('{GILTIGT_TILL}', `${expiresAt.toLocaleDateString('sv-SE')} kl ${expiresAt.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`)
        .replace('{BETALLANK}', offerUrl);
    }

    const htmlContent = createUnifiedEmailTemplate(
      emailSubject,
      emailContent,
      undefined,
      { showUnsubscribe: false }
    );

    const emailResponse = await resend.emails.send({
      from: 'Improteatern <noreply@improteatern.se>',
      to: [requestData.waitlistEmail],
      subject: emailSubject,
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error('Email send error:', emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    // Log the sent email
    await logSentEmail({
      recipientEmail: requestData.waitlistEmail,
      recipientName: requestData.waitlistName,
      subject: emailSubject,
      content: emailContent,
      htmlContent: htmlContent,
      emailType: "course_offer",
      sourceFunction: "send-course-offer",
      resendId: emailResponse.data?.id,
      status: "sent"
    });

    // Mark waitlist entry as having received offer
    await supabaseAdmin
      .from('course_waitlist')
      .update({
        offer_sent: true,
        offer_sent_at: new Date().toISOString()
      })
      .eq('course_instance_id', requestData.courseInstanceId)
      .eq('email', requestData.waitlistEmail);

    console.log('Course offer email sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Kurserbjudande skickat!',
      offerToken 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in send-course-offer:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
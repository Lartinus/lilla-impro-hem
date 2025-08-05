
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUnifiedEmailTemplate } from '../_shared/email-template.ts';
import { convertMarkdownToHtml } from '../_shared/markdownHelpers.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  type: 'corporate' | 'private';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  occasion?: string;
  requirements: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const inquiryData: InquiryRequest = await req.json();
    
    console.log(`Processing ${inquiryData.type} inquiry from ${inquiryData.email}`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Save inquiry to database
    const { data: savedInquiry, error: dbError } = await supabase
      .from('inquiries')
      .insert({
        type: inquiryData.type,
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone,
        company: inquiryData.company,
        occasion: inquiryData.occasion,
        requirements: inquiryData.requirements
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Inquiry saved to database:', savedInquiry.id);

    // Add contact to Resend
    try {
      const contactData = {
        email: inquiryData.email,
        first_name: inquiryData.name.split(' ')[0] || inquiryData.name,
        last_name: inquiryData.name.split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
      };

      console.log('Adding contact to Resend:', contactData);
      
      const contactResponse = await resend.contacts.create({
        audienceId: Deno.env.get('RESEND_AUDIENCE_ID') || 'default',
        ...contactData
      });

      console.log('Contact added successfully:', contactResponse);
    } catch (contactError: any) {
      console.log('Contact creation failed (continuing):', contactError);
    }

    // Send notification email to kontakt@improteatern.se
    const notificationSubject = inquiryData.type === 'corporate' 
      ? `Ny företagsförfrågan från ${inquiryData.company || inquiryData.name}`
      : `Ny privatförfrågan från ${inquiryData.name}`;

    // Create notification content using markdown format
    const notificationMarkdown = `
## Kontaktuppgifter

**Namn:** ${inquiryData.name}  
**E-post:** ${inquiryData.email}  
${inquiryData.phone ? `**Telefon:** ${inquiryData.phone}  \n` : ''}${inquiryData.company ? `**Företag:** ${inquiryData.company}  \n` : ''}${inquiryData.occasion ? `**Tillfälle:** ${inquiryData.occasion}  \n` : ''}**Typ:** ${inquiryData.type === 'corporate' ? 'Företag' : 'Privat'}

## Krav och önskemål

${inquiryData.requirements}

---

Logga in på adminpanelen för att hantera förfrågan
    `.trim();

    // Convert markdown to HTML and create notification content
    const notificationContent = createUnifiedEmailTemplate(
      notificationSubject,
      convertMarkdownToHtml(notificationMarkdown)
    );

    await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: ["kontakt@improteatern.se"],
      subject: notificationSubject,
      html: notificationContent,
      tags: [
        { name: 'type', value: 'inquiry-notification' },
        { name: 'inquiry_type', value: inquiryData.type }
      ]
    });

    // Get email template from database
    const templateName = inquiryData.type === 'corporate' 
      ? 'AUTO: Företagsförfrågan bekräftelse'
      : 'AUTO: Privatförfrågan bekräftelse';

    console.log(`Fetching email template: ${templateName}`);

    const { data: emailTemplate, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, content')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError) {
      console.error('Template fetch error:', templateError);
      throw new Error(`Could not fetch email template: ${templateError.message}`);
    }

    console.log('Email template fetched successfully');

    // Prepare variables for replacement
    const variables: Record<string, string> = {
      NAMN: inquiryData.name
    };

    if (inquiryData.type === 'corporate') {
      variables.FÖRETAG = inquiryData.company || '';
      variables.TILLFÄLLE = inquiryData.occasion || '';
    } else {
      variables.TILLFÄLLE = inquiryData.occasion || '';
    }

    // Replace variables in subject and content
    let personalizedSubject = emailTemplate.subject;
    let personalizedContent = emailTemplate.content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      personalizedSubject = personalizedSubject.replace(regex, value);
      personalizedContent = personalizedContent.replace(regex, value);
    });

    // Create confirmation email using unified template
    const confirmationContent = createUnifiedEmailTemplate(
      personalizedSubject,
      personalizedContent
    ).replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(inquiryData.email)}`);

    await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [inquiryData.email],
      subject: personalizedSubject,
      html: confirmationContent,
      tags: [
        { name: 'type', value: 'inquiry-confirmation' },
        { name: 'inquiry_type', value: inquiryData.type }
      ]
    });

    console.log('All emails sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Förfrågan skickad!',
      inquiryId: savedInquiry.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-inquiry function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Ett fel uppstod när förfrågan skulle skickas',
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

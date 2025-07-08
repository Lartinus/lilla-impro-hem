import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  recipientGroup: string;
  subject: string;
  content: string;
  templateId?: string;
}

interface EmailContact {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientGroup, subject, content, templateId }: BulkEmailRequest = await req.json();

    console.log('Processing bulk email request for group:', recipientGroup);

    // Get template if templateId is provided
    let template = null;
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .maybeSingle();

      if (!templateError && templateData) {
        template = templateData;
        console.log('Using template:', template.name);
      }
    }

    // Get recipients based on group type
    let recipients: EmailContact[] = [];

    if (recipientGroup.startsWith('manual_')) {
      // Manual group - get from email_group_members
      const groupId = recipientGroup.replace('manual_', '');
      console.log('Fetching manual group members for group:', groupId);
      
      const { data: groupMembers, error: groupError } = await supabase
        .from('email_group_members')
        .select(`
          email_contacts (email, name)
        `)
        .eq('group_id', groupId);

      if (groupError) {
        console.error('Error fetching group members:', groupError);
        throw groupError;
      }

      recipients = groupMembers
        ?.map(member => member.email_contacts)
        .filter(Boolean)
        .map(contact => ({
          email: contact.email,
          name: contact.name
        })) || [];

    } else if (recipientGroup === 'all_contacts') {
      // All contacts
      console.log('Fetching all contacts');
      
      const { data: contacts, error: contactsError } = await supabase
        .from('email_contacts')
        .select('email, name');

      if (contactsError) {
        console.error('Error fetching all contacts:', contactsError);
        throw contactsError;
      }

      recipients = contacts?.map(contact => ({
        email: contact.email,
        name: contact.name
      })) || [];

    } else if (recipientGroup === 'all_ticket_buyers') {
      // All ticket buyers
      console.log('Fetching all ticket buyers');
      
      const { data: ticketBuyers, error: ticketError } = await supabase
        .from('ticket_purchases')
        .select('buyer_email, buyer_name')
        .eq('payment_status', 'paid');

      if (ticketError) {
        console.error('Error fetching ticket buyers:', ticketError);
        throw ticketError;
      }

      // Get unique buyers
      const uniqueBuyers = new Map();
      ticketBuyers?.forEach(buyer => {
        uniqueBuyers.set(buyer.buyer_email, {
          email: buyer.buyer_email,
          name: buyer.buyer_name
        });
      });

      recipients = Array.from(uniqueBuyers.values());

    } else if (recipientGroup.startsWith('interest_')) {
      // Interest signup group
      const interestId = recipientGroup.replace('interest_', '');
      console.log('Fetching interest signup submissions for:', interestId);
      
      const { data: submissions, error: submissionsError } = await supabase
        .from('interest_signup_submissions')
        .select('email, name')
        .eq('interest_signup_id', interestId);

      if (submissionsError) {
        console.error('Error fetching interest submissions:', submissionsError);
        throw submissionsError;
      }

      recipients = submissions?.map(submission => ({
        email: submission.email,
        name: submission.name
      })) || [];

    } else {
      // Course group - dynamic table
      console.log('Fetching course participants from table:', recipientGroup);
      
      // Use RPC to safely query dynamic table
      const { data: courseParticipants, error: courseError } = await supabase
        .rpc('get_course_participants', {
          table_name: recipientGroup
        });

      if (courseError) {
        console.error('Error fetching course participants:', courseError);
        // Fall back to direct query (less safe but might work)
        try {
          const { data, error } = await supabase
            .from(recipientGroup)
            .select('email, name');
          
          if (error) throw error;
          recipients = data?.map(participant => ({
            email: participant.email,
            name: participant.name
          })) || [];
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw new Error(`Could not fetch participants from course table: ${recipientGroup}`);
        }
      } else {
        recipients = courseParticipants?.map((participant: any) => ({
          email: participant.email,
          name: participant.name
        })) || [];
      }
    }

    console.log(`Found ${recipients.length} recipients`);

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No recipients found for the selected group' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let totalSent = 0;
    let errors = [];

    for (const batch of batches) {
      try {
        const emailPromises = batch.map(async (recipient) => {
          // Determine what content and subject to use
          let finalContent = content;
          let finalSubject = subject;
          
          // If template is provided, use template content and subject unless overridden
          if (template) {
            finalContent = content || template.content;
            finalSubject = subject || template.subject;
          }
          
          // Personalize content by replacing [NAMN] with recipient name
          let personalizedContent = finalContent.replace(/\[NAMN\]/g, recipient.name || 'Vän');
          
          // Check if content is plain text or HTML
          const isPlainText = !finalContent.includes('<') && !finalContent.includes('>');
          
          let htmlContent;
          if (isPlainText) {
            // Create styled HTML email for plain text content
            const textWithBreaks = personalizedContent.replace(/\n/g, '<br>');
            htmlContent = createStyledEmailTemplate(finalSubject, textWithBreaks, template);
          } else {
            // Use HTML content but wrap in template
            htmlContent = createStyledEmailTemplate(finalSubject, personalizedContent, template);
          }

          function createStyledEmailTemplate(subjectText: string, contentText: string, templateData: any = null) {
            const hasBackground = templateData?.background_image && templateData.background_image.trim() !== '';
            const hasTitle = templateData?.title && templateData.title.trim() !== '';
            const finalTitleSize = templateData?.title_size || '32';
            const imagePosition = templateData?.image_position || 'top';
            
            return `
              <div style="
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333;
                background-color: #f5f5f5;
                padding: 0;
                margin: 0;
              ">
                ${imagePosition === 'top' && hasBackground ? `
                  <div style="
                    height: 300px;
                    background-image: url('${templateData.background_image}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    margin: 0;
                  "></div>
                ` : ''}
                
                ${imagePosition === 'behind' && hasBackground ? `
                  <div style="
                    position: relative;
                    min-height: 400px;
                    background-image: url('${templateData.background_image}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    margin: 0;
                    padding: 40px 20px;
                  ">
                ` : ''}
                
                <div style="
                  max-width: 600px;
                  margin: ${imagePosition === 'top' && hasBackground ? '-80px auto 40px auto' : 
                           imagePosition === 'behind' && hasBackground ? '0 auto' : 
                           '40px auto'};
                  position: relative;
                  z-index: 10;
                  ${imagePosition === 'behind' && hasBackground ? '' : 'padding: 0 20px;'}
                ">
                  <div style="
                    background-color: #fff;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    position: relative;
                    ${imagePosition === 'behind' && hasBackground ? 'background-color: rgba(255,255,255,0.95); backdrop-filter: blur(10px);' : ''}
                  ">
                    ${hasTitle ? `
                      <h1 style="
                        color: #333; 
                        margin: 0 0 20px 0;
                        font-size: ${finalTitleSize}px;
                        font-weight: bold;
                        text-align: center;
                        line-height: 1.2;
                      ">
                        ${templateData.title}
                      </h1>
                      <div style="
                        width: 60px;
                        height: 3px;
                        background-color: #333;
                        margin: 0 auto 30px auto;
                      "></div>
                    ` : `
                      <div style="
                        border-bottom: 2px solid #d32f2f; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px;
                      ">
                        <h2 style="
                          color: #d32f2f; 
                          margin: 0 0 10px 0;
                          font-size: 24px;
                        ">
                          ${subjectText}
                        </h2>
                      </div>
                    `}
                    
                    <div style="margin-bottom: 30px;">
                      ${contentText}
                    </div>
                    
                    ${imagePosition === 'bottom' && hasBackground ? `
                      <div style="
                        height: 200px;
                        background-image: url('${templateData.background_image}');
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        margin: 30px -40px 30px -40px;
                        border-radius: 8px;
                      "></div>
                    ` : ''}
                    
                    <div style="
                      border-top: 1px solid #eee; 
                      padding-top: 20px;
                      color: #666;
                      font-size: 14px;
                    ">
                      <p style="margin: 0 0 15px 0;">
                        Med vänliga hälsningar,<br />
                        <strong>Lilla Improteatern</strong>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999;">
                        Vill du inte längre få våra mejl? 
                        <a href="${Deno.env.get('SUPABASE_URL')}/functions/v1/unsubscribe-email?email=${encodeURIComponent(recipient.email)}" style="color: #d32f2f; text-decoration: underline;">
                          Avprenumerera här
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                ${imagePosition === 'behind' && hasBackground ? '</div>' : ''}
              </div>
            `;
          }
          
          return resend.emails.send({
            from: "Lilla Improteatern <noreply@improteatern.se>",
            to: [recipient.email],
            subject: finalSubject,
            html: htmlContent,
            text: personalizedContent, // Keep plain text version for fallback
          });
        });

        const results = await Promise.allSettled(emailPromises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            totalSent++;
            console.log(`Email sent successfully to ${batch[index].email}`);
          } else {
            console.error(`Failed to send email to ${batch[index].email}:`, result.reason);
            errors.push(`${batch[index].email}: ${result.reason}`);
          }
        });

        // Small delay between batches to respect rate limits
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (batchError) {
        console.error('Batch error:', batchError);
        errors.push(`Batch error: ${batchError.message}`);
      }
    }

    console.log(`Bulk email completed. Sent: ${totalSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: totalSent, 
        total: recipients.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
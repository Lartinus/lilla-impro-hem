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
  recipientGroup?: string;
  recipients?: string[];
  subject: string;
  content: string;
  templateId?: string;
  group_name?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    contentType: string;
  }>;
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
    const { recipientGroup, recipients, subject, content, templateId, attachments, group_name }: BulkEmailRequest = await req.json();

    console.log('Processing bulk email request for group:', recipientGroup || group_name || 'direct recipients');

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

    // Get recipients based on group type or direct recipients
    let emailRecipients: EmailContact[] = [];

    if (recipients && recipients.length > 0) {
      // Direct recipients array provided (from EmailManagement component)
      emailRecipients = recipients.map(email => ({ email }));
      console.log(`Using direct recipients: ${recipients.length} emails`);
    } else if (recipientGroup && recipientGroup.startsWith('manual_')) {
      // Manual group - get from email_group_members
      const groupId = recipientGroup.replace('manual_', '');
      console.log('Fetching manual group members for group:', groupId);
      
      const { data: groupMembers, error: groupError } = await supabase
        .from('email_group_members')
        .select(`
          email_contacts (email, name, metadata)
        `)
        .eq('group_id', groupId);

        if (groupError) {
        console.error('Error fetching group members:', groupError);
        throw groupError;
      }

      emailRecipients = groupMembers
        ?.map((member: any) => member.email_contacts)
        ?.filter(contact => {
          // Filter out unsubscribed contacts (check both flags)
          const metadata = contact.metadata || {};
          return !metadata.unsubscribed && !metadata.newsletter_unsubscribed;
        })
        ?.map(contact => ({
          email: contact.email,
          name: contact.name
        })) || [];

    } else if (recipientGroup === 'all_contacts') {
      // All contacts
      console.log('Fetching all contacts');
      
      const { data: contacts, error: contactsError } = await supabase
        .from('email_contacts')
        .select('email, name, metadata');

      if (contactsError) {
        console.error('Error fetching all contacts:', contactsError);
        throw contactsError;
      }

      emailRecipients = contacts
        ?.filter(contact => {
          // Filter out unsubscribed contacts (check both flags)
          const metadata = contact.metadata || {};
          return !metadata.unsubscribed && !metadata.newsletter_unsubscribed;
        })
        ?.map(contact => ({
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

      emailRecipients = Array.from(uniqueBuyers.values());

    } else if (recipientGroup && recipientGroup.startsWith('interest_')) {
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

      emailRecipients = submissions?.map(submission => ({
        email: submission.email,
        name: submission.name
      })) || [];

    } else if (recipientGroup) {
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
          emailRecipients = data?.map(participant => ({
            email: participant.email,
            name: participant.name
          })) || [];
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw new Error(`Could not fetch participants from course table: ${recipientGroup}`);
        }
      } else {
        emailRecipients = courseParticipants?.map((participant: any) => ({
          email: participant.email,
          name: participant.name
        })) || [];
      }
    }

    console.log(`Found ${emailRecipients.length} recipients`);
    console.log('DEBUG: First few recipients:', emailRecipients.slice(0, 3));

    if (emailRecipients.length === 0) {
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
    for (let i = 0; i < emailRecipients.length; i += batchSize) {
      batches.push(emailRecipients.slice(i, i + batchSize));
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
          
          // Personalize content by replacing [NAMN] with recipient name (first name only)
          const firstName = recipient.name ? recipient.name.split(' ')[0] : '';
          let personalizedContent = finalContent.replace(/\[NAMN\]/g, firstName);
          // Clean up extra spaces when name is empty (e.g., "Hej !" becomes "Hej!")
          if (!firstName) {
            personalizedContent = personalizedContent.replace(/Hej\s+!/g, 'Hej!');
          }
          let personalizedSubject = finalSubject.replace(/\[NAMN\]/g, firstName);
          
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
            
            return `
              <!DOCTYPE html>
              <html lang="sv" style="margin: 0; padding: 0;">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subjectText}</title>
                <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
              </head>
              <body style="
                margin: 0;
                padding: 0;
                font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                background-color: #f0f0f0;
                line-height: 1.6;
                color: #333333;
              ">
                ${hasBackground ? `
                  <div style="
                    text-align: center;
                    padding: 0;
                    margin: 0;
                  ">
                    <img src="${templateData.background_image}" alt="" style="
                      width: 100%;
                      max-width: 600px;
                      height: auto;
                      aspect-ratio: 1;
                      object-fit: cover;
                      display: block;
                      margin: 0 auto;
                    "/>
                  </div>
                ` : ''}
                
                <div style="
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  background-color: #f0f0f0;
                ">
                  <div style="
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333333;
                    font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                  ">
                    <div style="font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">
                      ${contentText}
                    </div>
                  </div>
                </div>

                <div style="
                  background-color: #e5e5e5;
                  padding: 40px 20px;
                  text-align: center;
                ">
                  <div style="max-width: 600px; margin: 0 auto;">
                    <img src="https://gcimnsbeexkkqragmdzo.supabase.co/storage/v1/object/public/images/1752141748739-LIT_red_large.png" alt="Lilla Improteatern" style="
                      width: 180px;
                      height: auto;
                      margin: 0 auto 20px auto;
                      display: block;
                    "/>
                    <p style="
                      font-size: 12px;
                      color: #999999;
                      margin: 0;
                    ">
                      Vill du inte längre få våra mejl? 
                      <a href="https://improteatern.se/avprenumerera?email=${encodeURIComponent(recipient.email)}" style="
                        color: #666666;
                        text-decoration: underline;
                      ">
                        Avprenumerera här
                      </a>
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `;
          }
          
          // Prepare attachments for Resend by downloading from URLs
          const resendAttachments = [];
          if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
              try {
                const response = await fetch(attachment.url);
                if (response.ok) {
                  const content = await response.arrayBuffer();
                  resendAttachments.push({
                    filename: attachment.filename,
                    content: new Uint8Array(content),
                  });
                }
              } catch (attachmentError) {
                console.error(`Failed to download attachment ${attachment.filename}:`, attachmentError);
                // Continue with other attachments
              }
            }
          }

          return resend.emails.send({
            from: "Lilla Improteatern <noreply@improteatern.se>",
            to: [recipient.email],
            subject: personalizedSubject,
            html: htmlContent,
            text: personalizedContent, // Keep plain text version for fallback
            attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
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
          total: emailRecipients.length,
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
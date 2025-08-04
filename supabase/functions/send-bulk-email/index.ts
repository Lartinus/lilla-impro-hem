import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabase } from "../_shared/supabase.ts";
import { logSentEmail } from "../_shared/email-logger.ts";
import { createUnifiedEmailTemplate } from "../_shared/email-template.ts";

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
      // For manual groups, we need to get names from email_contacts
      console.log('Processing recipients array, group_name:', group_name);
      
      if (group_name && group_name !== 'Alla kontakter') {
        // This is a manual group, get contact details with names
        console.log('Fetching contact details for manual group:', group_name);
        const { data: contacts, error: contactsError } = await supabase
          .from('email_contacts')
          .select('email, name')
          .in('email', recipients);
        
        console.log('Contacts query result:', { contacts, contactsError });
        
        if (!contactsError && contacts) {
          emailRecipients = contacts.map(contact => ({
            email: contact.email,
            name: contact.name
          }));
          console.log('Successfully mapped contacts with names:', emailRecipients);
        } else {
          // Fallback to just emails if we can't get names
          console.log('Falling back to emails only due to error:', contactsError);
          emailRecipients = recipients.map(email => ({ email }));
        }
      } else {
        console.log('Using all contacts or no group name provided');
        emailRecipients = recipients.map(email => ({ email }));
      }
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
          
          // Check if content is already HTML (from SimpleEmailBuilder)
          const isHtml = finalContent.includes('<!DOCTYPE html>') || finalContent.includes('<html');
          
          let htmlContent;
          if (isHtml) {
            // Content is already formatted HTML, just replace unsubscribe URL
            htmlContent = personalizedContent.replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(recipient.email)}`);
          } else {
            // Plain text content, use old template system
            const processedContent = personalizedContent.replace(/\n/g, '<br>');
            htmlContent = createUnifiedEmailTemplate(
              finalSubject, 
              personalizedContent, 
              template?.background_image
            ).replace('{UNSUBSCRIBE_URL}', `https://improteatern.se/avprenumerera?email=${encodeURIComponent(recipient.email)}`);
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
        
        results.forEach(async (result, index) => {
          const recipient = batch[index];
          if (result.status === 'fulfilled') {
            totalSent++;
            console.log(`Email sent successfully to ${recipient.email}`);
            
            // Log successful email
            await logSentEmail({
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              subject: subject,
              content: content,
              htmlContent: htmlContent,
              emailType: 'bulk',
              sourceFunction: 'send-bulk-email',
              resendId: result.value?.id,
              status: 'sent'
            });
          } else {
            console.error(`Failed to send email to ${recipient.email}:`, result.reason);
            errors.push(`${recipient.email}: ${result.reason}`);
            
            // Log failed email
            await logSentEmail({
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              subject: subject,
              content: content,
              htmlContent: htmlContent,
              emailType: 'bulk',
              sourceFunction: 'send-bulk-email',
              status: 'failed',
              errorMessage: String(result.reason)
            });
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
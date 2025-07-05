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
    const { recipientGroup, subject, content }: BulkEmailRequest = await req.json();

    console.log('Processing bulk email request for group:', recipientGroup);

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
          // Personalize content by replacing [NAMN] with recipient name
          const personalizedContent = content.replace(/\[NAMN\]/g, recipient.name || 'Vän');
          
          return resend.emails.send({
            from: "LIT - Luleå Improvisationsteater <noreply@improteatern.se>",
            to: [recipient.email],
            subject: subject,
            html: personalizedContent.replace(/\n/g, '<br>'),
            text: personalizedContent,
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
import { supabase } from './supabase.ts';

interface LogEmailParams {
  recipientEmail: string;
  recipientName?: string;
  senderEmail?: string;
  subject: string;
  content?: string;
  htmlContent?: string;
  emailType: string;
  sourceFunction: string;
  resendId?: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}

export async function logSentEmail(params: LogEmailParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('sent_emails')
      .insert({
        recipient_email: params.recipientEmail,
        recipient_name: params.recipientName,
        sender_email: params.senderEmail || 'kontakt@improteatern.se',
        subject: params.subject,
        content: params.content,
        html_content: params.htmlContent,
        email_type: params.emailType,
        source_function: params.sourceFunction,
        resend_id: params.resendId,
        status: params.status,
        error_message: params.errorMessage,
        sent_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log sent email:', error);
    } else {
      console.log('Successfully logged sent email for:', params.recipientEmail);
    }
  } catch (error) {
    console.error('Exception while logging sent email:', error);
  }
}
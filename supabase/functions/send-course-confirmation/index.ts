
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  name: string;
  email: string;
  courseTitle: string;
  isAvailable: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, courseTitle, isAvailable }: ConfirmationEmailRequest = await req.json();

    console.log(`Processing course confirmation for ${email} - course: ${courseTitle}`);

    // First, try to add contact to Resend
    try {
      const contactData = {
        email: email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        unsubscribed: false,
      };

      console.log('Adding contact to Resend:', contactData);
      
      const contactResponse = await resend.contacts.create({
        audienceId: process.env.RESEND_AUDIENCE_ID || 'default', // You'll need to set this
        ...contactData
      });

      console.log('Contact added successfully:', contactResponse);

      // Add tags to categorize the contact
      if (contactResponse.data?.id) {
        try {
          await resend.contacts.update({
            audienceId: process.env.RESEND_AUDIENCE_ID || 'default',
            id: contactResponse.data.id,
            unsubscribed: false,
          });
          console.log('Contact tags updated');
        } catch (tagError) {
          console.log('Could not update contact tags:', tagError);
          // Continue anyway - not critical
        }
      }
    } catch (contactError: any) {
      console.log('Contact creation failed (continuing with email):', contactError);
      // Continue with email sending even if contact creation fails
      // This could happen if contact already exists or other API issues
    }

    const subject = isAvailable 
      ? `Bekräftelse av kursbokning - ${courseTitle}`
      : `Bekräftelse av intresseanmälan - ${courseTitle}`;

    // Table-based email template for better compatibility
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #d32f2f; padding: 30px 40px; border-bottom: 3px solid #b71c1c;">
                    <h1 style="color: #ffffff; margin: 0; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; text-align: center;">
                      Lilla Improteatern
                    </h1>
                  </td>
                </tr>
                
                <!-- Subject -->
                <tr>
                  <td style="padding: 30px 40px 20px; background-color: #ffffff;">
                    <h2 style="color: #d32f2f; margin: 0; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; text-align: center;">
                      ${subject}
                    </h2>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 30px; background-color: #ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0;">
                          <p style="margin: 0; color: #333333; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                            ${isAvailable ? 
                              `Tack för din kursbokning, <strong>${name}</strong>!` : 
                              `Tack för din intresseanmälan, <strong>${name}</strong>!`
                            }
                          </p>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 15px 0;">
                          <p style="margin: 0; color: #333333; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                            ${isAvailable ? 
                              `Vi har tagit emot din bokning för kursen <strong>${courseTitle}</strong>.` : 
                              `Vi har tagit emot din intresseanmälan för <strong>${courseTitle}</strong>.`
                            }
                          </p>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 15px 0;">
                          <p style="margin: 0; color: #333333; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                            ${isAvailable ? 
                              "Vi kommer att kontakta dig snart med mer information om kursen, inklusive tid, plats och praktiska detaljer." : 
                              "Vi kommer att kontakta dig så snart det finns lediga platser eller när nästa kurs planeras."
                            }
                          </p>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 15px 0;">
                          <p style="margin: 0; color: #333333; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                            ${isAvailable ? 
                              "Vi ser fram emot att träffa dig på kursen!" : 
                              "Tack för ditt intresse!"
                            }
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9f9f9; padding: 30px 40px; border-top: 1px solid #eeeeee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 10px 0; color: #666666; font-family: Arial, sans-serif; font-size: 14px;">
                            Med vänliga hälsningar,<br>
                            <strong style="color: #d32f2f;">Lilla Improteatern</strong>
                          </p>
                          <p style="margin: 0; color: #999999; font-family: Arial, sans-serif; font-size: 12px;">
                            Besök oss på <a href="https://improteatern.se" style="color: #d32f2f; text-decoration: none;">improteatern.se</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send the email
    console.log('Sending confirmation email...');
    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject,
      html: emailContent,
      tags: [
        { name: 'type', value: 'course-confirmation' },
        { name: 'course', value: courseTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() },
        { name: 'available', value: isAvailable ? 'yes' : 'no' }
      ]
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-course-confirmation function:", error);
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

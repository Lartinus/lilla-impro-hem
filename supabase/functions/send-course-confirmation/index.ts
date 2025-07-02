
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

    console.log(`Sending confirmation email to ${email} for course: ${courseTitle}`);

    const subject = isAvailable 
      ? `Bekräftelse av kursbokning - ${courseTitle}`
      : `Bekräftelse av intresseanmälan - ${courseTitle}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #fff; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="border-bottom: 2px solid #d32f2f; padding-bottom: 20px; margin-bottom: 30px; padding: 20px;">
          <h2 style="color: #d32f2f; margin: 0 0 10px 0; font-size: 24px;">
            ${subject}
          </h2>
        </div>
        
        <div style="padding: 0 30px; margin-bottom: 30px;">
          <p style="margin-bottom: 15px;">
            ${isAvailable ? 
              `Tack för din kursbokning, <strong>${name}</strong>!` : 
              `Tack för din intresseanmälan, <strong>${name}</strong>!`
            }
          </p>
          
          <p style="margin-bottom: 15px;">
            ${isAvailable ? 
              `Vi har tagit emot din bokning för kursen <strong>${courseTitle}</strong>.` : 
              `Vi har tagit emot din intresseanmälan för <strong>${courseTitle}</strong>.`
            }
          </p>
          
          <p style="margin-bottom: 15px;">
            ${isAvailable ? 
              "Vi kommer att kontakta dig snart med mer information om kursen, inklusive tid, plats och praktiska detaljer." : 
              "Vi kommer att kontakta dig så snart det finns lediga platser eller när nästa kurs planeras."
            }
          </p>
          
          <p style="margin-bottom: 15px;">
            ${isAvailable ? 
              "Vi ser fram emot att träffa dig på kursen!" : 
              "Tack för ditt intresse!"
            }
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding: 20px 30px; color: #666; font-size: 14px; background-color: #f9f9f9;">
          <p style="margin: 0;">
            Med vänliga hälsningar,<br>
            <strong style="color: #d32f2f;">Lilla Improteatern</strong>
          </p>
          <p style="margin: 10px 0 0; font-size: 12px; color: #999;">
            Besök oss på <a href="https://improteatern.se" style="color: #d32f2f; text-decoration: none;">improteatern.se</a>
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <noreply@improteatern.se>",
      to: [email],
      subject,
      html: emailContent,
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

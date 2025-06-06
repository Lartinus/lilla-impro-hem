
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

    const emailContent = isAvailable 
      ? `
        <h4>Tack för din kursbokning, ${name}!</h4>
        <p>Vi har tagit emot din bokning för kursen <strong>${courseTitle}</strong>.</p>
        <p>Vi kommer att kontakta dig snart med mer information om kursen, inklusive tid, plats och praktiska detaljer.</p>
        <p>Vi ser fram emot att träffa dig på kursen!</p>
        <p>Med vänliga hälsningar,<br>Lilla Improteatern</p>
      `
      : `
        <h1>Tack för din intresseanmälan, ${name}!</h1>
        <p>Vi har tagit emot din intresseanmälan för kursen <strong>${courseTitle}</strong>.</p>
        <p>Vi kommer att kontakta dig så snart det finns lediga platser eller när nästa kurs planeras.</p>
        <p>Tack för ditt intresse!</p>
        <p>Med vänliga hälsningar,<br>Lilla Imroteatern</p>
      `;

    const emailResponse = await resend.emails.send({
      from: "Lilla Improteatern <onboarding@resend.dev>",
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

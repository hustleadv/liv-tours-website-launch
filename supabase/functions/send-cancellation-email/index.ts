import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationEmailRequest {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
}

const generateCancellationEmailHtml = (data: CancellationEmailRequest): string => {
  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">❌</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Η κράτησή σας ακυρώθηκε</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Αγαπητέ/ή ${data.customerName}</p>
            </td>
          </tr>

          <!-- Booking ID -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: #fee2e2; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px; border: 1px solid #fecaca;">
                <p style="margin: 0 0 5px 0; color: #991b1b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Κωδικός Κράτησης (Ακυρωμένη)</p>
                <p style="margin: 0; color: #b91c1c; font-size: 28px; font-weight: bold; letter-spacing: 2px; text-decoration: line-through;">${data.bookingId}</p>
              </div>

              <!-- Trip Details -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #6c757d; font-size: 18px; font-weight: 600;">📋 Ακυρωμένη Μεταφορά</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📅 Ημερομηνία</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #9ca3af; font-weight: 600; text-decoration: line-through;">${data.date}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">🕐 Ώρα</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #9ca3af; font-weight: 600; text-decoration: line-through;">${data.time}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Route -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px; opacity: 0.7;">
                <h2 style="margin: 0 0 20px 0; color: #6c757d; font-size: 18px; font-weight: 600;">📍 Διαδρομή</h2>
                
                <div style="position: relative; padding-left: 30px;">
                  <div style="position: absolute; left: 8px; top: 8px; bottom: 8px; width: 2px; background: #d1d5db;"></div>
                  
                  <div style="margin-bottom: 20px;">
                    <div style="position: absolute; left: 0; width: 18px; height: 18px; background: #9ca3af; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 12px; text-transform: uppercase;">Παραλαβή</p>
                    <p style="margin: 0; color: #9ca3af; font-weight: 600; font-size: 15px; text-decoration: line-through;">${data.pickup}</p>
                  </div>
                  
                  <div>
                    <div style="position: absolute; left: 0; bottom: 0; width: 18px; height: 18px; background: #9ca3af; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 12px; text-transform: uppercase;">Αποβίβαση</p>
                    <p style="margin: 0; color: #9ca3af; font-weight: 600; font-size: 15px; text-decoration: line-through;">${data.dropoff}</p>
                  </div>
                </div>
              </div>

              <!-- Rebook CTA -->
              <div style="background: #f0fdf4; border-radius: 12px; padding: 25px; border: 1px solid #bbf7d0; text-align: center;">
                <h2 style="margin: 0 0 15px 0; color: #166534; font-size: 18px; font-weight: 600;">🚗 Χρειάζεστε νέα μεταφορά;</h2>
                <p style="margin: 0 0 20px 0; color: #15803d; font-size: 14px;">
                  Κάντε νέα κράτηση εύκολα και γρήγορα
                </p>
                <a href="https://livtours.gr/transfers" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Νέα Κράτηση
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                Ερωτήσεις; Επικοινωνήστε μαζί μας:
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="mailto:info@liv-tours.com" style="color: #0f4c5c; text-decoration: none; font-weight: 600;">info@liv-tours.com</a>
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">
                © 2024 LIV Tours Crete. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received cancellation email request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: CancellationEmailRequest = await req.json();
    console.log("Sending cancellation email to:", data.customerEmail);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: [data.customerEmail],
        subject: `❌ Η κράτησή σας ${data.bookingId} ακυρώθηκε | LIV Tours`,
        html: generateCancellationEmailHtml(data),
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Cancellation email response:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending cancellation email:", error);
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

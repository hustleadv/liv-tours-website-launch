import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceNotificationRequest {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: number;
  tripHubUrl?: string;
}

const generatePriceEmailHtml = (data: PriceNotificationRequest): string => {
  return `
<!DOCTYPE html>
<html lang="en">
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
            <td style="background: linear-gradient(135deg, #0f4c5c 0%, #1a6b7d 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">💰</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Your transfer price is ready!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Hello ${data.customerName}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <!-- Booking ID -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 5px 0; color: #6c757d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking ID</p>
                <p style="margin: 0; color: #0f4c5c; font-size: 20px; font-weight: bold; letter-spacing: 2px;">${data.bookingId}</p>
              </div>

              <!-- Price Box -->
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 5px 0; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Transfer Price</p>
                <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: bold;">€${data.price.toFixed(2)}</p>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Fixed price • No hidden fees</p>
              </div>

              <!-- Route Details -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #0f4c5c; font-size: 18px; font-weight: 600;">📋 Transfer Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📅 Date</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.date}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">🕐 Pickup Time</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #e8a54b; font-weight: 700; font-size: 16px;">${data.time}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📍 From</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.pickup}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #6c757d; font-size: 14px;">📍 To</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.dropoff}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Trip Hub Button -->
              ${data.tripHubUrl ? `
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${data.tripHubUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f4c5c 0%, #1a6b7d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(15, 76, 92, 0.4);">
                  📱 View in Trip Hub
                </a>
                <p style="margin: 12px 0 0 0; color: #6c757d; font-size: 13px;">View all your booking details and payment options</p>
              </div>
              ` : ''}

              <!-- What's Next -->
              <div style="background: #fffbeb; border-radius: 12px; padding: 20px; border: 1px solid #fcd34d;">
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">✅ How to confirm</h2>
                <p style="margin: 0 0 15px 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  To complete your booking, please <strong>reply to this email</strong> or message us on <strong>WhatsApp</strong> confirming you accept the price.
                </p>
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">💳 Payment Options</h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li><strong>Pay online:</strong> Get 5% discount (via Trip Hub)</li>
                  <li><strong>Pay to driver:</strong> Cash or card on arrival</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                Questions? Contact us:
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="mailto:info@liv-tours.com" style="color: #0f4c5c; text-decoration: none; font-weight: 600;">info@liv-tours.com</a>
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">
                © 2026 LIV Tours & Transfers Crete. All rights reserved.
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
  console.log("Received price notification request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PriceNotificationRequest = await req.json();
    console.log("Sending price notification to:", data.customerEmail, "Price:", data.price);

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
        subject: `💰 Your transfer price: €${data.price} | LIV Tours`,
        html: generatePriceEmailHtml(data),
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email response:", emailResult);

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending price notification:", error);
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

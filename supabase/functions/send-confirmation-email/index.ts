import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  vehicleType: string;
  childSeat?: boolean;
  extraStop?: boolean;
  meetGreet?: boolean;
  tripHubUrl?: string;
}

const generateConfirmationEmailHtml = (data: ConfirmationEmailRequest): string => {
  const extras = [];
  if (data.childSeat) extras.push("🧸 Child seat");
  if (data.extraStop) extras.push("📍 Extra stop");
  if (data.meetGreet) extras.push("👋 Meet & Greet");

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
              <div style="font-size: 32px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Your booking is confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you ${data.customerName}</p>
            </td>
          </tr>

          <!-- Booking ID -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #e8a54b 0%, #d4922e 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 5px 0; color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking ID</p>
                <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${data.bookingId}</p>
              </div>

              <!-- Trip Details -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #0f4c5c; font-size: 18px; font-weight: 600;">📋 Transfer Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">🚗 Vehicle</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.vehicleType}</span>
                    </td>
                  </tr>
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
                      <span style="color: #6c757d; font-size: 14px;">👥 Passengers</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.passengers}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Route -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #0f4c5c; font-size: 18px; font-weight: 600;">📍 Route</h2>
                
                <div style="position: relative; padding-left: 30px;">
                  <div style="position: absolute; left: 8px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(180deg, #22c55e 0%, #e8a54b 100%);"></div>
                  
                  <div style="margin-bottom: 20px;">
                    <div style="position: absolute; left: 0; width: 18px; height: 18px; background: #22c55e; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 12px; text-transform: uppercase;">Pickup</p>
                    <p style="margin: 0; color: #212529; font-weight: 600; font-size: 15px;">${data.pickup}</p>
                  </div>
                  
                  <div>
                    <div style="position: absolute; left: 0; bottom: 0; width: 18px; height: 18px; background: #e8a54b; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                    <p style="margin: 0 0 4px 0; color: #6c757d; font-size: 12px; text-transform: uppercase;">Drop-off</p>
                    <p style="margin: 0; color: #212529; font-weight: 600; font-size: 15px;">${data.dropoff}</p>
                  </div>
                </div>
              </div>

              ${extras.length > 0 ? `
              <!-- Extras -->
              <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 15px 0; color: #166534; font-size: 16px; font-weight: 600;">✨ Additional Services</h2>
                <div>
                  ${extras.map(extra => `<span style="display: inline-block; background: #ffffff; padding: 8px 12px; border-radius: 20px; margin: 4px; font-size: 14px; color: #166534;">${extra}</span>`).join('')}
                </div>
              </div>
              ` : ''}

              <!-- Trip Hub Button -->
              ${data.tripHubUrl ? `
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${data.tripHubUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f4c5c 0%, #1a6b7d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(15, 76, 92, 0.4);">
                  📱 Open Trip Hub
                </a>
                <p style="margin: 12px 0 0 0; color: #6c757d; font-size: 13px;">View all your booking details</p>
              </div>
              ` : ''}

              <!-- What's Next -->
              <div style="background: #fffbeb; border-radius: 12px; padding: 20px; border: 1px solid #fcd34d;">
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">📱 What's next?</h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>Your driver will contact you before pickup</li>
                  <li>You'll receive the driver's contact details</li>
                  <li>For any changes, please contact us</li>
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
  console.log("Received confirmation email request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ConfirmationEmailRequest = await req.json();
    console.log("Sending confirmation email to:", data.customerEmail);

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
        subject: `✅ Your booking ${data.bookingId} is confirmed! | LIV Tours`,
        html: generateConfirmationEmailHtml(data),
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email response:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
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
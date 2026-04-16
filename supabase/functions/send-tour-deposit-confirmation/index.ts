import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TourDepositEmailRequest {
  customerName: string;
  customerEmail: string;
  requestId: string;
  itineraryTitle: string;
  tourVibe: string;
  pickupArea: string;
  preferredDate: string;
  groupSize: string;
  duration: string;
  depositAmount: number;
  estimatedTotal: number;
  discountApplied: boolean;
  discountAmount: number;
  language?: string;
}

const generateTourDepositEmailHtml = (data: TourDepositEmailRequest): string => {
  const remainingBalance = data.estimatedTotal - data.depositAmount;
  const peopleText = `${data.groupSize} people`;

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
              <div style="font-size: 32px; margin-bottom: 10px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Your deposit is confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you ${data.customerName || ''}!</p>
            </td>
          </tr>

          <!-- Request ID -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #e8a54b 0%, #d4922e 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 5px 0; color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tour Request ID</p>
                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${data.requestId}</p>
              </div>

              ${data.discountApplied ? `
              <!-- Discount Applied -->
              <div style="background: #ecfdf5; border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; border: 1px solid #a7f3d0;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                  ✨ You saved €${data.discountAmount} with online payment!
                </p>
              </div>
              ` : ''}

              <!-- Tour Details -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #0f4c5c; font-size: 18px; font-weight: 600;">🗺️ Tour Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">🎯 Tour</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.itineraryTitle || data.tourVibe || 'Custom Tour'}</span>
                    </td>
                  </tr>
                  ${data.pickupArea ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📍 Pickup</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.pickupArea}</span>
                    </td>
                  </tr>
                  ` : ''}
                  ${data.preferredDate ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📅 Date</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.preferredDate}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">👥 Group Size</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${peopleText}</span>
                    </td>
                  </tr>
                  ${data.duration ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">⏱️ Duration</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${data.duration}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Payment Summary -->
              <div style="background: #f0fdf4; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #bbf7d0;">
                <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 18px; font-weight: 600;">💳 Payment Summary</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #166534; font-size: 14px;">Estimated total</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #166534;">~€${data.estimatedTotal}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px dashed #bbf7d0;">
                      <span style="color: #166534; font-size: 14px; font-weight: 600;">Deposit (30%)</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right; border-top: 1px dashed #bbf7d0;">
                      <span style="color: #166534; font-weight: 700; font-size: 18px;">€${data.depositAmount}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #166534; font-size: 14px;">Remaining (payable on the day)</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #166534;">~€${remainingBalance}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What's Next -->
              <div style="background: #fffbeb; border-radius: 12px; padding: 20px; border: 1px solid #fcd34d;">
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">📱 What's next?</h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>We will contact you via WhatsApp to confirm details</li>
                  <li>You'll receive the final price after we review your request</li>
                  <li>Your driver will contact you 24 hours before the tour</li>
                  <li>The remaining balance is paid to the driver on the day</li>
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
  console.log("[TOUR-DEPOSIT-EMAIL] Received request");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: TourDepositEmailRequest = await req.json();
    
    console.log("[TOUR-DEPOSIT-EMAIL] Sending to:", data.customerEmail);

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
        subject: `🎉 Deposit Confirmed - ${data.requestId} | LIV Tours`,
        html: generateTourDepositEmailHtml(data),
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("[TOUR-DEPOSIT-EMAIL] Response:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[TOUR-DEPOSIT-EMAIL] Error:", error);
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
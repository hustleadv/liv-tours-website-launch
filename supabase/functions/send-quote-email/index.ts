import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteEmailRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  luggage: string;
  vehicleType: string;
  childSeat: number; // Now a number for quantity
  extraStop: boolean;
  meetGreet: boolean;
  bookingId?: string;
  hasFixedPrice?: boolean; // indicates if this route has a fixed price
}

const generateBusinessEmailHtml = (data: QuoteEmailRequest) => {
  const needsPriceQuote = !data.hasFixedPrice;
  const urgencyBanner = needsPriceQuote 
    ? `<tr>
        <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 15px 30px; text-align: center;">
          <p style="color: #ffffff; margin: 0; font-size: 16px; font-weight: 700;">⚠️ PRICE QUOTE REQUIRED</p>
          <p style="color: #fecaca; margin: 5px 0 0 0; font-size: 13px;">This route has no fixed price - please send pricing to customer</p>
        </td>
      </tr>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📬 New Quote Request</h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">A new booking inquiry has been received</p>
            </td>
          </tr>
          
          <!-- Urgency Banner for routes without price -->
          ${urgencyBanner}
          
          <!-- Customer Info -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px;">👤 Customer Details</h2>
                <p style="color: #ffffff; margin: 5px 0;"><strong>Name:</strong> ${data.customerName}</p>
                <p style="color: #ffffff; margin: 5px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
                ${data.customerPhone ? `<p style="color: #ffffff; margin: 5px 0;"><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
              </div>
              
              <!-- Route Details -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #0f172a; margin: 0 0 15px 0; font-size: 18px;">🚗 Transfer Details</h2>
                <table style="width: 100%; font-size: 14px; color: #334155;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Route:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.pickup} → ${data.dropoff}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Date:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Time:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Passengers:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.passengers}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Luggage:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${data.luggage}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Vehicle:</strong></td>
                    <td style="padding: 8px 0;">${data.vehicleType}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Extras -->
              <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px;">
                <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">✨ Extras</h2>
                <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                  ${data.childSeat > 0 ? `<li style="margin: 5px 0;">Child Seats ×${data.childSeat} (+€${data.childSeat * 5})</li>` : ''}
                  ${data.extraStop ? '<li style="margin: 5px 0;">Extra Stop ✓</li>' : ''}
                  ${data.meetGreet ? '<li style="margin: 5px 0;">Meet & Greet ✓</li>' : ''}
                  ${data.childSeat === 0 && !data.extraStop && !data.meetGreet ? '<li style="margin: 5px 0;">No extras selected</li>' : ''}
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 25px 30px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                ${needsPriceQuote ? '⚠️ Remember to send a price quote to this customer!' : 'Please respond to this inquiry as soon as possible.'}
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

const generateCustomerEmailHtml = (data: QuoteEmailRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LIV Tours Booking Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">LIV Tours</h1>
              <p style="color: #84cc16; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Premium Transfers & Tours in Crete</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h2 style="color: #0f172a; margin: 0 0 15px 0; font-size: 24px;">Thank you, ${data.customerName}! 🎉</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                We've received your booking request and our team will get back to you shortly with a confirmation and exact pricing.
              </p>
            </td>
          </tr>
          
          <!-- Booking Summary -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #84cc16;">
                <h3 style="color: #166534; margin: 0 0 20px 0; font-size: 18px;">📋 Your Booking Summary</h3>
                <table style="width: 100%; font-size: 14px; color: #334155;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0; width: 35%;"><strong>Route:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;">${data.pickup} → ${data.dropoff}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>Date:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;">${data.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>Time:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;">${data.time}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>Passengers:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;">${data.passengers}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>Vehicle:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;">${data.vehicleType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;"><strong>Extras:</strong></td>
                    <td style="padding: 10px 0;">
                      ${[
                        data.meetGreet ? 'Meet & Greet' : '',
                        data.childSeat > 0 ? `Child Seat ×${data.childSeat}` : '',
                        data.extraStop ? 'Extra Stop' : ''
                      ].filter(Boolean).join(', ') || 'None'}
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- What's Included -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 25px;">
                <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 16px;">✅ What's Included</h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                  <li>Flight monitoring (airport pickups)</li>
                  <li>Meet & Greet service</li>
                  <li>No hidden fees</li>
                  <li>Clean, air-conditioned vehicles</li>
                  <li>English-speaking drivers</li>
                  <li>Free cancellation up to 24h before</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Contact CTA -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <p style="color: #64748b; margin: 0 0 20px 0; font-size: 14px;">
                Have questions? Contact us anytime:
              </p>
              <a href="https://wa.me/306944363525" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 10px;">
                💬 WhatsApp
              </a>
              <a href="mailto:info@liv-tours.com" style="display: inline-block; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                ✉️ Email Us
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px; text-align: center;">
              <p style="color: #84cc16; margin: 0 0 5px 0; font-size: 18px; font-weight: 700;">LIV Tours</p>
              <p style="color: #94a3b8; margin: 0 0 15px 0; font-size: 12px;">Premium Transfers & Tours in Crete</p>
              <p style="color: #64748b; margin: 0; font-size: 11px;">
                Chania, Crete, Greece<br>
                info@liv-tours.com
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteEmailRequest = await req.json();
    console.log("Received quote request:", data);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Send email to business
    const businessEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: ["info@liv-tours.com"],
        subject: data.hasFixedPrice === false 
          ? `⚠️ PRICE NEEDED: ${data.pickup} → ${data.dropoff}`
          : `New Quote Request: ${data.pickup} → ${data.dropoff}`,
        html: generateBusinessEmailHtml(data),
      }),
    });

    const businessResult = await businessEmailResponse.json();
    console.log("Business email sent:", businessResult);

    // Send confirmation email to customer
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: [data.customerEmail],
        subject: "Your LIV Tours Booking Request Received ✈️",
        html: generateCustomerEmailHtml(data),
      }),
    });

    const customerResult = await customerEmailResponse.json();
    console.log("Customer email sent:", customerResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        businessEmail: businessResult,
        customerEmail: customerResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-quote-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

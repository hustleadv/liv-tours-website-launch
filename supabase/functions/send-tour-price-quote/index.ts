import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPriceQuoteRequest {
  tourRequestId: string;
  finalPrice: number;
  adminMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-TOUR-PRICE-QUOTE] Function started");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { tourRequestId, finalPrice, adminMessage }: SendPriceQuoteRequest = await req.json();
    console.log("[SEND-TOUR-PRICE-QUOTE] Processing request:", { tourRequestId, finalPrice });

    // Fetch the tour request
    const { data: tourRequest, error: fetchError } = await supabaseClient
      .from("tour_requests")
      .select("*")
      .eq("id", tourRequestId)
      .single();

    if (fetchError || !tourRequest) {
      console.error("[SEND-TOUR-PRICE-QUOTE] Tour request not found:", fetchError);
      throw new Error("Tour request not found");
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID();
    
    // Update tour request with final price and token
    const { error: updateError } = await supabaseClient
      .from("tour_requests")
      .update({
        final_price: finalPrice,
        confirmation_token: confirmationToken,
        price_sent_at: new Date().toISOString(),
        status: "awaiting_confirmation"
      })
      .eq("id", tourRequestId);

    if (updateError) {
      console.error("[SEND-TOUR-PRICE-QUOTE] Update error:", updateError);
      throw new Error("Failed to update tour request");
    }

    // Build confirmation URL
    const origin = req.headers.get("origin") || "https://liv-tours.com";
    const confirmUrl = `${origin}/tour/confirm-price?token=${confirmationToken}`;

    // Calculate deposit (30% of final price)
    const depositAmount = Math.round(finalPrice * 0.30);

    // Send email to customer
    const emailResponse = await resend.emails.send({
      from: "LIV Tours <info@liv-tours.com>",
      to: [tourRequest.customer_email],
      subject: `Προσφορά τιμής για την εκδρομή σας - LIV Tours`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">LIV Tours</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Προσφορά Τιμής Εκδρομής</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Αγαπητέ/ή ${tourRequest.customer_name || "Πελάτη"},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Ευχαριστούμε για το ενδιαφέρον σας! Μετά από προσεκτική εξέταση του αιτήματός σας, σας παρουσιάζουμε την τελική τιμή για την εκδρομή σας:
              </p>

              <!-- Tour Details Box -->
              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="color: #1a365d; margin: 0 0 16px; font-size: 18px;">Στοιχεία Εκδρομής</h3>
                
                ${tourRequest.itinerary_title ? `<p style="color: #4b5563; margin: 8px 0;"><strong>Τίτλος:</strong> ${tourRequest.itinerary_title}</p>` : ""}
                ${tourRequest.preferred_date ? `<p style="color: #4b5563; margin: 8px 0;"><strong>Ημερομηνία:</strong> ${tourRequest.preferred_date}</p>` : ""}
                ${tourRequest.group_size ? `<p style="color: #4b5563; margin: 8px 0;"><strong>Άτομα:</strong> ${tourRequest.group_size}</p>` : ""}
                ${tourRequest.duration ? `<p style="color: #4b5563; margin: 8px 0;"><strong>Διάρκεια:</strong> ${tourRequest.duration}</p>` : ""}
                ${tourRequest.pickup_area ? `<p style="color: #4b5563; margin: 8px 0;"><strong>Παραλαβή:</strong> ${tourRequest.pickup_area}</p>` : ""}
              </div>

              <!-- Price Box -->
              <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Τελική Τιμή</p>
                <p style="color: white; margin: 0; font-size: 48px; font-weight: 700;">€${finalPrice}</p>
                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">Προκαταβολή: €${depositAmount} (30%)</p>
              </div>

              ${adminMessage ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Σημείωση:</strong> ${adminMessage}</p>
              </div>
              ` : ""}

              <p style="background: #fffbeb; border-radius: 12px; padding: 20px; border: 1px solid #fcd34d; color: #92400e; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                ✅ <strong>Σημαντικό:</strong> Για την ολοκλήρωση της κράτησής σας, παρακαλούμε <strong>απαντήστε σε αυτό το email</strong> ή στείλτε μας ένα μήνυμα στο <strong>WhatsApp</strong> επιβεβαιώνοντας ότι αποδέχεστε την τιμή.
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Αν η τιμή σας ικανοποιεί, μπορείτε επίσης να πατήσετε το παρακάτω κουμπί για αυτόματη επιβεβαίωση:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  ✓ Αποδέχομαι την Τιμή
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                Μετά την επιβεβαίωση, θα μπορείτε να προχωρήσετε στην πληρωμή της προκαταβολής.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Για οποιαδήποτε απορία επικοινωνήστε μαζί μας:<br>
                <a href="mailto:info@liv-tours.com" style="color: #2563eb;">info@liv-tours.com</a> | 
                <a href="https://wa.me/306944363525" style="color: #2563eb;">WhatsApp</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("[SEND-TOUR-PRICE-QUOTE] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[SEND-TOUR-PRICE-QUOTE] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

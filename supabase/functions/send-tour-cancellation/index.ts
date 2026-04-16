import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelTourRequest {
  tourRequestId: string;
  cancellationReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-TOUR-CANCELLATION] Function started");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { tourRequestId, cancellationReason }: CancelTourRequest = await req.json();
    console.log("[SEND-TOUR-CANCELLATION] Processing request:", { tourRequestId });

    // Fetch the tour request
    const { data: tourRequest, error: fetchError } = await supabaseClient
      .from("tour_requests")
      .select("*")
      .eq("id", tourRequestId)
      .single();

    if (fetchError || !tourRequest) {
      console.error("[SEND-TOUR-CANCELLATION] Tour request not found:", fetchError);
      throw new Error("Tour request not found");
    }

    // Update tour request status to cancelled
    const { error: updateError } = await supabaseClient
      .from("tour_requests")
      .update({
        status: "cancelled",
        admin_notes: tourRequest.admin_notes 
          ? `${tourRequest.admin_notes}\n\n[Ακύρωση] ${cancellationReason || "Χωρίς αιτιολόγηση"}`
          : `[Ακύρωση] ${cancellationReason || "Χωρίς αιτιολόγηση"}`
      })
      .eq("id", tourRequestId);

    if (updateError) {
      console.error("[SEND-TOUR-CANCELLATION] Update error:", updateError);
      throw new Error("Failed to update tour request");
    }

    // Send cancellation email to customer
    const emailResponse = await resend.emails.send({
      from: "LIV Tours <info@liv-tours.com>",
      to: [tourRequest.customer_email],
      subject: `Ακύρωση αιτήματος εκδρομής - LIV Tours`,
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
            <div style="background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">LIV Tours</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Ακύρωση Αιτήματος</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Αγαπητέ/ή ${tourRequest.customer_name || "Πελάτη"},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Δυστυχώς, το αίτημά σας για εκδρομή έχει ακυρωθεί.
              </p>

              <!-- Tour Details Box -->
              <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #fecaca;">
                <h3 style="color: #991b1b; margin: 0 0 16px; font-size: 18px;">Στοιχεία Ακυρωμένου Αιτήματος</h3>
                
                <p style="color: #7f1d1d; margin: 8px 0;"><strong>Κωδικός:</strong> #${tourRequest.request_id}</p>
                ${tourRequest.itinerary_title ? `<p style="color: #7f1d1d; margin: 8px 0;"><strong>Τίτλος:</strong> ${tourRequest.itinerary_title}</p>` : ""}
                ${tourRequest.preferred_date ? `<p style="color: #7f1d1d; margin: 8px 0;"><strong>Ημερομηνία:</strong> ${tourRequest.preferred_date}</p>` : ""}
              </div>

              ${cancellationReason ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>Αιτία ακύρωσης:</strong> ${cancellationReason}</p>
              </div>
              ` : ""}

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Αν επιθυμείτε να κανονίσετε μια νέα εκδρομή ή να συζητήσετε εναλλακτικές επιλογές, μη διστάσετε να επικοινωνήσετε μαζί μας.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://liv-tours.com/tours" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  Δείτε τις Εκδρομές μας
                </a>
              </div>
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

    console.log("[SEND-TOUR-CANCELLATION] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[SEND-TOUR-CANCELLATION] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

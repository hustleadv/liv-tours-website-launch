import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    logStep("Verifying webhook signature");

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          sessionId: session.id, 
          bookingId: session.client_reference_id,
          paymentStatus: session.payment_status
        });

        if (session.client_reference_id && session.payment_status === "paid") {
          const metadata = session.metadata || {};
          const bookingType = metadata.booking_type || 'transfer';
          
          // Handle tour deposits differently
          if (bookingType === 'tour' && session.client_reference_id.startsWith('TOUR-')) {
            logStep("Processing tour deposit payment");
            
            const depositAmount = parseFloat(metadata.deposit_amount || '0');
            const finalPrice = parseFloat(metadata.final_price || '0');
            const discountApplied = metadata.discount_applied === 'yes';
            
            // Update tour_requests table with deposit_paid status
            const { data: tourRequest, error: updateError } = await supabase
              .from("tour_requests")
              .update({
                payment_status: "deposit_paid",
                deposit_amount: depositAmount,
                stripe_payment_intent_id: typeof session.payment_intent === 'string' 
                  ? session.payment_intent 
                  : session.payment_intent?.id || null,
                paid_at: new Date().toISOString(),
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
              })
              .eq("request_id", session.client_reference_id)
              .select()
              .maybeSingle();

            if (updateError) {
              logStep("Failed to update tour request", { error: updateError.message });
              throw new Error(`Failed to update tour request: ${updateError.message}`);
            }

            logStep("Tour request updated successfully", { 
              requestId: session.client_reference_id,
              depositAmount,
              finalPrice,
              paymentStatus: "deposit_paid"
            });

            // Send tour deposit confirmation email
            if (tourRequest) {
              try {
                // Detect language from metadata or default to English
                const customerLanguage = metadata.language || 'en';
                
                const emailPayload = {
                  customerName: tourRequest.customer_name || metadata.customer_name || '',
                  customerEmail: tourRequest.customer_email,
                  requestId: tourRequest.request_id,
                  itineraryTitle: tourRequest.itinerary_title || metadata.itinerary_title || '',
                  tourVibe: tourRequest.tour_vibe || metadata.tour_vibe || '',
                  pickupArea: tourRequest.pickup_area || metadata.pickup_area || '',
                  preferredDate: tourRequest.preferred_date || metadata.date || '',
                  groupSize: tourRequest.group_size || metadata.group_size || '',
                  duration: tourRequest.duration || metadata.duration || '',
                  depositAmount: depositAmount,
                  finalPrice: finalPrice,
                  discountApplied: discountApplied,
                  discountAmount: tourRequest.discount_amount || 0,
                  language: customerLanguage,
                };

                const emailResponse = await fetch(
                  `${supabaseUrl}/functions/v1/send-tour-deposit-confirmation`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${supabaseServiceKey}`,
                    },
                    body: JSON.stringify(emailPayload),
                  }
                );

                if (emailResponse.ok) {
                  logStep("Tour deposit confirmation email sent successfully");
                } else {
                  const emailError = await emailResponse.text();
                  logStep("Failed to send tour deposit email", { error: emailError });
                }
              } catch (emailErr: unknown) {
                const emailErrMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
                logStep("Error sending tour deposit email", { error: emailErrMsg });
              }
            }
          } else {
            // Handle regular transfer bookings
            const totalAmount = metadata.final_amount ? parseFloat(metadata.final_amount) : 0;
            const depositPaid = metadata.deposit_paid ? parseFloat(metadata.deposit_paid) : 0;
            const paymentType = metadata.payment_type || "full";
            
            const updateData: Record<string, unknown> = {
              payment_status: "paid",
              payment_type: paymentType,
              payment_amount: totalAmount, // Keep for backwards compatibility
              total_amount: totalAmount, // Final discounted total
              stripe_session_id: session.id,
              stripe_payment_intent_id: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id || null,
              paid_at: new Date().toISOString(),
            };
            
            // Only set deposit_paid for deposit payments
            if (paymentType === 'deposit' && depositPaid > 0) {
              updateData.deposit_paid = depositPaid;
            }

            logStep("Updating booking", { bookingId: session.client_reference_id, updateData });

            const { error } = await supabase
              .from("bookings")
              .update(updateData)
              .eq("booking_id", session.client_reference_id);

            if (error) {
              logStep("Failed to update booking", { error: error.message });
              throw new Error(`Failed to update booking: ${error.message}`);
            }

            logStep("Booking updated successfully", { bookingId: session.client_reference_id });

            // Fetch booking details to send payment confirmation email
            const { data: booking, error: fetchError } = await supabase
              .from("bookings")
              .select("*")
              .eq("booking_id", session.client_reference_id)
              .maybeSingle();

            if (booking && !fetchError) {
              logStep("Sending payment confirmation email");
              
              const paidAmount = paymentType === 'deposit' 
                ? depositPaid 
                : totalAmount;

              try {
                const emailPayload = {
                  customerName: booking.customer_name,
                  customerEmail: booking.customer_email,
                  bookingId: booking.booking_id,
                  pickup: booking.pickup,
                  dropoff: booking.dropoff,
                  date: booking.date,
                  time: booking.time,
                  paymentAmount: paidAmount,
                  paymentType: paymentType,
                  tripHubUrl: `https://livtransfers.com/trip?id=${booking.booking_id}`,
                };

                const emailResponse = await fetch(
                  `${supabaseUrl}/functions/v1/send-payment-confirmation`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${supabaseServiceKey}`,
                    },
                    body: JSON.stringify(emailPayload),
                  }
                );

                if (emailResponse.ok) {
                  logStep("Payment confirmation email sent successfully");
                } else {
                  const emailError = await emailResponse.text();
                  logStep("Failed to send payment confirmation email", { error: emailError });
                }
              } catch (emailErr: unknown) {
                const emailErrMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
                logStep("Error sending payment confirmation email", { error: emailErrMsg });
              }
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent succeeded", { 
          paymentIntentId: paymentIntent.id,
          bookingId: paymentIntent.metadata?.booking_id
        });

        // Update booking if we have a booking_id in metadata
        if (paymentIntent.metadata?.booking_id) {
          const { error } = await supabase
            .from("bookings")
            .update({
              payment_status: "paid",
              stripe_payment_intent_id: paymentIntent.id,
              paid_at: new Date().toISOString(),
            })
            .eq("booking_id", paymentIntent.metadata.booking_id);

          if (error) {
            logStep("Failed to update booking from payment_intent", { error: error.message });
          } else {
            logStep("Booking updated from payment_intent", { bookingId: paymentIntent.metadata.booking_id });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent failed", { 
          paymentIntentId: paymentIntent.id,
          bookingId: paymentIntent.metadata?.booking_id
        });

        if (paymentIntent.metadata?.booking_id) {
          const { error } = await supabase
            .from("bookings")
            .update({
              payment_status: "failed",
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq("booking_id", paymentIntent.metadata.booking_id);

          if (error) {
            logStep("Failed to update booking for failed payment", { error: error.message });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        logStep("Charge refunded", { chargeId: charge.id });

        // Try to find the booking by payment intent
        if (charge.payment_intent) {
          const paymentIntentId = typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : charge.payment_intent.id;

          const { error } = await supabase
            .from("bookings")
            .update({
              payment_status: "refunded",
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          if (error) {
            logStep("Failed to update booking for refund", { error: error.message });
          } else {
            logStep("Booking marked as refunded");
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAY-TOUR-DEPOSIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const body = await req.json();
    const { requestId } = body;

    logStep("Request body parsed", { requestId });

    if (!requestId) {
      throw new Error("Missing required field: requestId");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the tour request
    const { data: tourRequest, error: fetchError } = await supabase
      .from("tour_requests")
      .select("*")
      .eq("request_id", requestId)
      .single();

    if (fetchError || !tourRequest) {
      logStep("Tour request not found", { error: fetchError?.message });
      throw new Error("Tour request not found");
    }

    logStep("Tour request found", { 
      requestId,
      finalPrice: tourRequest.final_price,
      priceConfirmedAt: tourRequest.price_confirmed_at,
      paymentStatus: tourRequest.payment_status
    });

    // Validate the request can be paid
    if (!tourRequest.final_price) {
      throw new Error("Final price not set for this tour request");
    }

    if (!tourRequest.price_confirmed_at) {
      throw new Error("Price not confirmed by customer yet");
    }

    if (tourRequest.payment_status === 'paid' || tourRequest.payment_status === 'deposit_paid') {
      throw new Error("Deposit already paid");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: tourRequest.customer_email, 
      limit: 1 
    });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Calculate 30% deposit from final price
    const depositAmount = Math.ceil(tourRequest.final_price * 0.30);
    const amountInCents = depositAmount * 100;

    logStep("Calculated deposit", { 
      finalPrice: tourRequest.final_price,
      depositAmount,
      amountInCents
    });

    // Create product description
    const productDescription = [
      `Tour: ${tourRequest.itinerary_title || 'Custom Tour'}`,
      tourRequest.pickup_area ? `Pickup: ${tourRequest.pickup_area}` : null,
      tourRequest.preferred_date ? `Date: ${tourRequest.preferred_date}` : null,
      tourRequest.preferred_time ? `Time: ${tourRequest.preferred_time}` : null,
      tourRequest.group_size ? `Group: ${tourRequest.group_size} people` : null,
    ].filter(Boolean).join(' | ');

    // Get origin with fallback
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://livtours.gr";

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : tourRequest.customer_email,
      client_reference_id: requestId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountInCents,
            product_data: {
              name: `Tour Deposit (30%) - ${requestId}`,
              description: productDescription,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/tour-confirmed?token=${requestId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/trip?token=${requestId}&payment_canceled=true`,
      metadata: {
        tour_request_id: requestId,
        booking_type: 'tour',
        payment_type: 'deposit',
        final_price: tourRequest.final_price.toString(),
        deposit_amount: depositAmount.toString(),
        customer_name: tourRequest.customer_name || '',
        customer_email: tourRequest.customer_email,
      },
      payment_intent_data: {
        metadata: {
          tour_request_id: requestId,
          booking_type: 'tour',
          payment_type: 'deposit',
        },
      },
    });

    // Update tour request with new Stripe session ID
    await supabase
      .from("tour_requests")
      .update({ 
        stripe_session_id: session.id,
        deposit_amount: depositAmount,
      })
      .eq("request_id", requestId);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      requestId,
      depositAmount
    });

    return new Response(JSON.stringify({ 
      url: session.url, 
      sessionId: session.id,
      depositAmount,
      finalPrice: tourRequest.final_price,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

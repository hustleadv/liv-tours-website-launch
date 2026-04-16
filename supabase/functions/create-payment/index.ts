import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Try to get Stripe Secret Key from site_settings table
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    try {
      const { data: settings } = await supabaseClient
        .from('site_settings')
        .select('stripe_secret_key')
        .maybeSingle();
      
      if (settings?.stripe_secret_key) {
        stripeKey = settings.stripe_secret_key;
        logStep("Using Stripe key from database settings");
      }
    } catch (dbError) {
      logStep("Could not fetch settings from DB, falling back to ENV", dbError);
    }

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set (checked ENV and DB)");
    logStep("Stripe key verified");

    const body = await req.json();
    const {
      bookingId,
      customerEmail,
      customerName,
      amount, // Amount in EUR (deposit amount)
      bookingType, // 'transfer' or 'tour'
      paymentType, // 'full' or 'deposit'
      pickup,
      dropoff,
      date,
      applyDiscount,
      discountAmount,
      originalAmount,
      finalAmount,
    } = body;

    logStep("Request body parsed", { bookingId, customerEmail, amount, bookingType, paymentType });

    if (!bookingId || !customerEmail || !amount) {
      throw new Error("Missing required fields: bookingId, customerEmail, or amount");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Calculate payment amount (already the deposit/full amount passed from frontend)
    const amountInCents = Math.round(amount * 100);

    logStep("Calculated payment", { 
      amount,
      amountInCents, 
      paymentType,
      applyDiscount,
      discountAmount,
      originalAmount,
      finalAmount,
    });

    // Create product description
    const productName = paymentType === 'deposit'
      ? `${bookingType === 'tour' ? 'Tour' : 'Transfer'} Deposit (30%)${applyDiscount ? ' + 10% Discount' : ''}`
      : `${bookingType === 'tour' ? 'Tour' : 'Transfer'} Payment`;

    const discountText = applyDiscount && discountAmount 
      ? ` | 10% off: €${originalAmount} → €${finalAmount}`
      : '';
    const productDescription = `${pickup} → ${dropoff} on ${date}${discountText}`;

    // Get origin with fallback
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://livtransfers.com";

    // Create a one-time payment session with dynamic price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      client_reference_id: bookingId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountInCents,
            product_data: {
              name: productName,
              description: productDescription,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?booking_id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/confirmed?payment_canceled=true`,
      metadata: {
        booking_id: bookingId,
        booking_type: bookingType,
        payment_type: paymentType,
        original_amount: originalAmount?.toString() || amount.toString(),
        final_amount: finalAmount?.toString() || amount.toString(),
        deposit_paid: paymentType === 'deposit' ? amount.toString() : '0', // Exact deposit amount paid
        discount_applied: applyDiscount ? 'true' : 'false',
        discount_amount: discountAmount?.toString() || '0',
        customer_name: customerName,
      },
      payment_intent_data: {
        metadata: {
          booking_id: bookingId,
          booking_type: bookingType,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
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

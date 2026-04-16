import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TOUR-DEPOSIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const body = await req.json();
    const {
      customerEmail,
      customerName,
      estimatedTotal, // Estimated tour price in EUR
      tourTitle,
      tourVibe,
      pickupArea,
      date,
      preferredTime, // New: preferred time for pickup
      groupSize,
      duration,
      notes,
      itineraryTitle,
      addons,
      applyDiscount, // Whether to apply 15% online discount
      language, // Customer's preferred language for email
    } = body;

    logStep("Request body parsed", { 
      customerEmail, 
      estimatedTotal, 
      tourTitle, 
      applyDiscount 
    });

    if (!customerEmail || !estimatedTotal) {
      throw new Error("Missing required fields: customerEmail or estimatedTotal");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Calculate 30% deposit
    const depositAmount = estimatedTotal * 0.3;
    
    // Apply 15% discount if paying online
    const discountMultiplier = applyDiscount ? 0.85 : 1;
    const finalDepositAmount = Math.ceil(depositAmount * discountMultiplier);
    const discountSaved = applyDiscount ? Math.floor(depositAmount * 0.15) : 0;
    const amountInCents = Math.round(finalDepositAmount * 100);

    logStep("Calculated deposit", { 
      estimatedTotal,
      depositAmount,
      discountApplied: applyDiscount,
      discountSaved,
      finalDepositAmount,
      amountInCents
    });

    // Generate a unique tour request ID
    const tourRequestId = `TOUR-${Date.now().toString(36).toUpperCase()}`;

    // Save tour request to database
    const { error: insertError } = await supabase
      .from("tour_requests")
      .insert({
        request_id: tourRequestId,
        customer_email: customerEmail,
        customer_name: customerName || null,
        tour_vibe: tourVibe || null,
        itinerary_title: itineraryTitle || null,
        pickup_area: pickupArea || null,
        duration: duration || null,
        group_size: groupSize || null,
        preferred_date: date || null,
        preferred_time: preferredTime || null,
        notes: notes || null,
        addons: addons || [],
        estimated_total: estimatedTotal,
        deposit_amount: finalDepositAmount,
        discount_applied: applyDiscount || false,
        discount_amount: discountSaved,
        payment_status: 'pending',
        payment_type: 'deposit',
        status: 'pending',
      });

    if (insertError) {
      logStep("Failed to save tour request", { error: insertError.message });
      throw new Error(`Failed to save tour request: ${insertError.message}`);
    }

    logStep("Tour request saved to database", { tourRequestId });

    // Create product description
    const productName = applyDiscount 
      ? `Tour Deposit (30%) - 15% Online Discount Applied`
      : `Tour Deposit (30%)`;

    const productDescription = [
      `Tour: ${itineraryTitle || tourTitle || 'Custom Tour'}`,
      pickupArea ? `Pickup: ${pickupArea}` : null,
      date ? `Date: ${date}` : null,
      preferredTime ? `Time: ${preferredTime}` : null,
      groupSize ? `Group: ${groupSize} people` : null,
      duration ? `Duration: ${duration}` : null,
    ].filter(Boolean).join(' | ');

    // Get origin with fallback
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://livtours.gr";

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      client_reference_id: tourRequestId,
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
      success_url: `${origin}/payment-success?booking_id=${tourRequestId}&session_id={CHECKOUT_SESSION_ID}&type=tour`,
      cancel_url: `${origin}/tours/builder?payment_canceled=true`,
      metadata: {
        tour_request_id: tourRequestId,
        booking_type: 'tour',
        payment_type: 'deposit',
        estimated_total: estimatedTotal.toString(),
        deposit_amount: finalDepositAmount.toString(),
        discount_applied: applyDiscount ? 'yes' : 'no',
        customer_name: customerName || '',
        tour_vibe: tourVibe || '',
        pickup_area: pickupArea || '',
        date: date || '',
        preferred_time: preferredTime || '',
        group_size: groupSize || '',
        duration: duration || '',
        itinerary_title: itineraryTitle || '',
        notes: notes?.substring(0, 500) || '',
        addons: addons?.join(', ') || '',
        language: language || 'en', // Pass language for email
      },
      payment_intent_data: {
        metadata: {
          tour_request_id: tourRequestId,
          booking_type: 'tour',
        },
      },
    });

    // Update tour request with Stripe session ID
    await supabase
      .from("tour_requests")
      .update({ stripe_session_id: session.id })
      .eq("request_id", tourRequestId);

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      tourRequestId 
    });

    return new Response(JSON.stringify({ 
      url: session.url, 
      sessionId: session.id,
      tourRequestId,
      depositAmount: finalDepositAmount,
      discountSaved
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

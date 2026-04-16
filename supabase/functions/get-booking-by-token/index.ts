import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetBookingRequest {
  token: string;
  verifyPhone?: string;
  verifyLastName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received get-booking-by-token request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, verifyPhone, verifyLastName }: GetBookingRequest = await req.json();
    
    console.log("Looking up booking/tour with token:", token);

    if (!token || token.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const upperToken = token.toUpperCase().trim();

    // Validate token format (LIV-XXXXXX for bookings, TOUR-XXXXXXXX for tours)
    const bookingRegex = /^LIV-[A-Z0-9]{6}$/;
    const tourRegex = /^TOUR-[A-Z0-9]{8}$/;
    const isTourToken = tourRegex.test(upperToken);
    const isBookingToken = bookingRegex.test(upperToken);

    if (!isBookingToken && !isTourToken) {
      console.log("Invalid token format:", token);
      return new Response(
        JSON.stringify({ error: "Invalid booking/tour ID format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If it's a tour token, search tour_requests first
    if (isTourToken) {
      console.log("Searching tour_requests for:", upperToken);
      
      const { data: tourRequest, error: tourError } = await supabase
        .from("tour_requests")
        .select("*")
        .eq("request_id", upperToken)
        .maybeSingle();

      if (tourError) {
        console.error("Database error (tour_requests):", tourError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch tour request" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!tourRequest) {
        console.log("No tour request found for token:", upperToken);
        return new Response(
          JSON.stringify({ error: "Tour request not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Optional verification for tour requests
      if (verifyPhone || verifyLastName) {
        let verified = false;

        if (verifyPhone) {
          const normalizedInput = verifyPhone.replace(/[\s\-\(\)]/g, "");
          const normalizedStored = (tourRequest.customer_phone || "").replace(/[\s\-\(\)]/g, "");
          verified = normalizedStored.includes(normalizedInput) || normalizedInput.includes(normalizedStored);
        }

        if (verifyLastName && !verified) {
          const inputName = verifyLastName.toLowerCase().trim();
          const storedName = (tourRequest.customer_name || "").toLowerCase();
          verified = storedName.includes(inputName) || inputName.split(" ").some((part: string) => storedName.includes(part));
        }

        if (!verified) {
          console.log("Verification failed for tour request:", upperToken);
          return new Response(
            JSON.stringify({ error: "Verification failed. Please check your details." }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }

      console.log("Tour request found and returned:", tourRequest.request_id);

      // Return tour request data with driver info
      const sanitizedTourRequest = {
        bookingId: tourRequest.request_id,
        bookingType: "tour",
        // Tour-specific fields
        tourVibe: tourRequest.tour_vibe,
        itineraryTitle: tourRequest.itinerary_title,
        pickupArea: tourRequest.pickup_area,
        duration: tourRequest.duration,
        groupSize: tourRequest.group_size,
        preferredDate: tourRequest.preferred_date,
        preferredTime: tourRequest.preferred_time,
        addons: tourRequest.addons,
        notes: tourRequest.notes,
        // Customer info
        customerName: tourRequest.customer_name,
        customerEmail: tourRequest.customer_email,
        customerPhone: tourRequest.customer_phone,
        // Status
        status: tourRequest.status,
        createdAt: tourRequest.created_at,
        confirmedAt: tourRequest.confirmed_at,
        // Driver info
        driverName: tourRequest.driver_name,
        driverPhone: tourRequest.driver_phone,
        driverLanguage: tourRequest.driver_language,
        driverMessageSent: tourRequest.driver_message_sent,
        driverMessageSentAt: tourRequest.driver_message_sent_at,
        // Payment fields
        paymentStatus: tourRequest.payment_status,
        paymentType: tourRequest.payment_type,
        estimatedTotal: tourRequest.estimated_total,
        finalPrice: tourRequest.final_price,
        depositAmount: tourRequest.deposit_amount,
        paidAt: tourRequest.paid_at,
        priceSentAt: tourRequest.price_sent_at,
        priceConfirmedAt: tourRequest.price_confirmed_at,
      };

      return new Response(
        JSON.stringify({ booking: sanitizedTourRequest, type: "tour" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Standard booking lookup
    console.log("Searching bookings for:", upperToken);
    
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_id", upperToken)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch booking" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!booking) {
      console.log("No booking found for token:", upperToken);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Optional verification step - if verifyPhone or verifyLastName provided, check them
    if (verifyPhone || verifyLastName) {
      let verified = false;

      if (verifyPhone) {
        // Normalize phone for comparison (remove spaces, dashes)
        const normalizedInput = verifyPhone.replace(/[\s\-\(\)]/g, "");
        const normalizedStored = (booking.customer_phone || "").replace(/[\s\-\(\)]/g, "");
        verified = normalizedStored.includes(normalizedInput) || normalizedInput.includes(normalizedStored);
      }

      if (verifyLastName && !verified) {
        // Check if last name matches (case insensitive, partial match)
        const inputName = verifyLastName.toLowerCase().trim();
        const storedName = booking.customer_name.toLowerCase();
        verified = storedName.includes(inputName) || inputName.split(" ").some((part: string) => storedName.includes(part));
      }

      if (!verified) {
        console.log("Verification failed for booking:", upperToken);
        return new Response(
          JSON.stringify({ error: "Verification failed. Please check your details." }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log("Booking found and returned:", booking.booking_id);

    // Return booking data (sanitized - no internal IDs exposed)
    const sanitizedBooking = {
      bookingId: booking.booking_id,
      pickup: booking.pickup,
      dropoff: booking.dropoff,
      date: booking.date,
      time: booking.time,
      passengers: booking.passengers,
      luggage: booking.luggage,
      vehicleType: booking.vehicle_type,
      childSeat: booking.child_seat,
      extraStop: booking.extra_stop,
      meetGreet: booking.meet_greet,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      isAirportRoute: booking.is_airport_route,
      isPortRoute: booking.is_port_route,
      bookingType: booking.booking_type,
      status: booking.status,
      createdAt: booking.created_at,
      confirmedAt: booking.confirmed_at,
      driverName: booking.driver_name,
      driverPhone: booking.driver_phone,
      driverLanguage: booking.driver_language,
      driverMessageSent: booking.driver_message_sent,
      driverMessageSentAt: booking.driver_message_sent_at,
      // Payment fields
      paymentStatus: booking.payment_status,
      paymentType: booking.payment_type,
      paymentAmount: booking.payment_amount,
      totalAmount: booking.total_amount,
      depositPaid: booking.deposit_paid,
      paidAt: booking.paid_at,
    };

    return new Response(
      JSON.stringify({ booking: sanitizedBooking, type: "transfer" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in get-booking-by-token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

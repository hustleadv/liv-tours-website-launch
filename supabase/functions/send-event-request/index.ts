import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventRequestData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate?: string;
  guestCount?: string;
  pickupLocation?: string;
  message?: string;
}

const eventTypeLabels: Record<string, string> = {
  wedding: "Wedding Transfer",
  corporate: "Corporate Event",
  bachelor: "Bachelor/Bachelorette Party",
};

async function sendEmail(to: string[], subject: string, html: string, replyTo?: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LIV Tours <info@liv-tours.com>",
      to,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received event request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EventRequestData = await req.json();
    console.log("Event request data:", JSON.stringify(data));

    const { name, email, phone, eventType, eventDate, guestCount, pickupLocation, message } = data;

    // Validate required fields
    if (!name || !email || !phone || !eventType) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const eventLabel = eventTypeLabels[eventType] || eventType;

    // Email to business
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d; border-bottom: 2px solid #c6f6d5; padding-bottom: 10px;">
          🎉 New Event Request: ${eventLabel}
        </h1>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Customer Details</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        </div>

        <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Event Details</h2>
          <p><strong>Type:</strong> ${eventLabel}</p>
          ${eventDate ? `<p><strong>Date:</strong> ${eventDate}</p>` : ''}
          ${guestCount ? `<p><strong>Number of Guests:</strong> ${guestCount}</p>` : ''}
          ${pickupLocation ? `<p><strong>Pickup Area:</strong> ${pickupLocation}</p>` : ''}
        </div>

        ${message ? `
        <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Additional Message</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding: 15px; background: #c6f6d5; border-radius: 8px;">
          <p style="margin: 0;"><strong>Quick Actions:</strong></p>
          <p style="margin: 10px 0 0 0;">
            <a href="mailto:${email}" style="color: #2b6cb0;">Reply via Email</a> | 
            <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="color: #38a169;">WhatsApp</a> |
            <a href="tel:${phone}" style="color: #805ad5;">Call</a>
          </p>
        </div>
      </div>
    `;

    // Email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Thank You for Your Event Inquiry!</h1>
        
        <p>Dear ${name},</p>
        
        <p>We have received your <strong>${eventLabel}</strong> request and are excited to help make your special occasion in Crete unforgettable!</p>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">Your Request Summary</h2>
          <p><strong>Event Type:</strong> ${eventLabel}</p>
          ${eventDate ? `<p><strong>Date:</strong> ${eventDate}</p>` : ''}
          ${guestCount ? `<p><strong>Guests:</strong> ${guestCount}</p>` : ''}
          ${pickupLocation ? `<p><strong>Pickup Area:</strong> ${pickupLocation}</p>` : ''}
        </div>

        <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2d3748; margin-top: 0;">What Happens Next?</h2>
          <ol style="margin: 0; padding-left: 20px;">
            <li>Our team will review your request within 24 hours</li>
            <li>We'll contact you with a personalized quote</li>
            <li>Together we'll finalize the details for your perfect event</li>
          </ol>
        </div>

        <p>If you have any urgent questions, feel free to contact us:</p>
        <ul style="list-style: none; padding: 0;">
          <li>📧 <a href="mailto:info@liv-tours.com">info@liv-tours.com</a></li>
          <li>📱 <a href="https://wa.me/306944363525">WhatsApp: +30 694 436 3525</a></li>
        </ul>

        <p style="margin-top: 30px;">Best regards,<br><strong>The LIV Tours Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #718096; font-size: 12px;">
          LIV Tours - Premium Transfers & Tours in Crete<br>
          <a href="https://livtours.gr" style="color: #4299e1;">livtours.gr</a>
        </p>
      </div>
    `;

    // Send email to business
    console.log("Sending email to business...");
    const businessEmail = await sendEmail(
      ["info@liv-tours.com"],
      `🎉 New ${eventLabel} Request from ${name}`,
      businessEmailHtml,
      email
    );
    console.log("Business email sent:", businessEmail);

    // Send confirmation to customer
    console.log("Sending confirmation to customer...");
    const customerEmail = await sendEmail(
      [email],
      `Your ${eventLabel} Request - LIV Tours`,
      customerEmailHtml
    );
    console.log("Customer email sent:", customerEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Event request sent successfully",
        businessEmailId: businessEmail?.id,
        customerEmailId: customerEmail?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-event-request function:", error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Livy, the expert AI tour guide and personal concierge for LIV Transfers & Tours in Crete. You are named after the brand, but you have your own personality: warm, hospitable (philoxenos), and deeply knowledgeable about your island.

**YOUR PERSONALITY:**
- **Warm & Welcoming:** You don't just provide facts; you welcome guests as if they were coming to your own home. Use phrases like "Welcome to my beautiful island!" or "I'd be honored to show you..."
- **Local Insider:** You know the "secret" spots that aren't in the usual guidebooks. You suggest the best tavernas for specific dishes, the best time to avoid the crowds, and the most scenic routes.
- **Proactive & Caring:** If a user mentions children, you immediately think of safety and fun (shallow waters, snack stops). If they mentions hiking, you think of water and sun protection.
- **Proudly Cretan:** You occasionally use subtle Cretan hospitality references. You speak English and Greek fluently.

**THINKING PROCESS:**
Before responding, consider:
1. **The Human Need:** Is this a family looking for easy fun, or a couple looking for romance, or adventurers?
2. **Context:** What page is the user on? (If provided). What was said before?
3. **The "Livy" Touch:** What is one "insider" tip I can add to this specific answer to make it special?
4. **Logistics:** Mention durations, what to wear, and fixed prices from the data provided.

**ABOUT LIV TOURS/TRANSFERS:**
- Premium private transfers and tours across all of Crete.
- Locations: Chania (CHQ), Heraklion (HER), Souda Port.
- Service: 24/7, fixed transparent pricing, flight monitoring, child seats, modern Mercedes fleet.
- Flexibility: We can stop anywhere for photos or coffee. It's their day, their pace.

**LIV INSIDER KNOWLEDGE & TIPS:**

*West Crete (Chania):*
- **Balos Lagoon:** "The wind tip" - If the wind is north/west, it can be wavy. Suggest checking the forecast. Insider tip: The absolute best photo is from the path halfway down, not just the beach.
- **Elafonisi:** "The sunrise secret" - It's magical at 8 AM. If you go with us, we can leave early to beat the big buses. Suggest the "hidden" coves at the end of the island for more privacy.
- **Seitan Limania:** Warn about the steep path. Not for flip-flops! Insider tip: Go for the views even if you don't climb down.
- **Food in Chania:** Suggest "Tamam" or "The Well of the Turk" for authentic vibes. For the best "Bougatsa", mention Iordanis in Chania town.

*Central & South Crete:*
- **Lake Kournas:** Best for late afternoon when the turtles are most active.
- **Knossos Palace:** A MUST for history lovers. Suggest hiring a licensed guide at the entrance for the full experience. Combine with a stop at "Archanes" village for a truly authentic lunch away from the city.
- **Samaria Gorge:** Only for the fit. Suggest "Imbros Gorge" as a beautiful, family-friendly alternative that only takes 2-3 hours and is just as scenic.

*General Cretan Wisdom:*
- **The "Siga-Siga" Lifestyle:** Remind guests to slow down. Our tours are never rushed.
- **Tipping:** Not mandatory but appreciated for great service.
- **Water:** Always carry a bottle, though we provide cold water in our vehicles.
- **Sun:** The Cretan sun is strong even when it's breezy. Remind them of sunscreen!

**RESPONSE STYLE:**
- **BE CONCISE:** This is critical. Never provide huge walls of text. Keep paragraphs short (2-3 sentences max).
- **Friendly & Premium:** Conversational but sophisticated.
- **Use Bold & Lists:** Use bold for key terms and lists for logistics to ensure scannability.
- **Consistent Language:** Always match the user's language (Greek or English).
- **Offer Help:** Briefly offer to assist with bookings or quotes.
- **Micro-Interactions:** When collecting info, ask for only 1-2 items at a time to avoid overwhelming the guest.
- **HUMAN HANDOFF:** If a user asks for something very specific like a **wedding**, a **large corporate event**, or a **custom luxury package**, or if they seem **frustrated/confused**, tell them: "This sounds like something our human coordinator should handle for the best experience. Would you like to chat with them on WhatsApp?" 

**BOOKING & PRICING:**
- Collect: Event/Tour -> Date -> People -> Pickup -> Name -> Email -> Phone.
- Use the tools provided for actual submissions.`;


const BOOKING_TOOL = {
  type: "function",
  function: {
    name: "create_tour_booking",
    description: "Create a tour booking/reservation for a customer. Use this when you have collected all necessary booking information and the customer wants to confirm a booking.",
    parameters: {
      type: "object",
      properties: {
        tour_type: {
          type: "string",
          description: "The type of tour or destination (e.g., 'Balos Lagoon', 'Elafonisi Beach', 'Samaria Gorge', 'Custom Tour')"
        },
        preferred_date: {
          type: "string",
          description: "The preferred date for the tour (e.g., '2024-07-15' or 'July 15, 2024')"
        },
        group_size: {
          type: "string",
          description: "Number of people (e.g., '2', '4 adults + 2 children')"
        },
        pickup_area: {
          type: "string",
          description: "Where to pick up the customer (e.g., 'Chania Old Town', 'Heraklion Airport')"
        },
        customer_name: {
          type: "string",
          description: "Full name of the customer"
        },
        customer_email: {
          type: "string",
          description: "Email address of the customer"
        },
        customer_phone: {
          type: "string",
          description: "Phone number of the customer (optional)"
        },
        notes: {
          type: "string",
          description: "Any additional notes or special requests"
        }
      },
      required: ["tour_type", "preferred_date", "group_size", "pickup_area", "customer_name", "customer_email"]
    }
  }
};

const PRICE_INQUIRY_TOOL = {
  type: "function",
  function: {
    name: "create_price_inquiry",
    description: "Create a price inquiry when a customer wants a quote for a tour or transfer. Use this when the customer asks about pricing and provides their contact details so we can send them a personalized quote.",
    parameters: {
      type: "object",
      properties: {
        tour_or_service: {
          type: "string",
          description: "What tour, destination, or service they're asking about (e.g., 'Lake Kournas', 'Balos Lagoon day trip', 'Custom west Crete tour')"
        },
        group_size: {
          type: "string",
          description: "Number of people (e.g., '5-7 people', '2 adults', 'large group')"
        },
        preferred_date: {
          type: "string",
          description: "When they want to go (optional, e.g., 'next week', 'July 20')"
        },
        pickup_area: {
          type: "string",
          description: "Where they're staying or want pickup from (optional)"
        },
        customer_name: {
          type: "string",
          description: "Full name of the customer"
        },
        customer_email: {
          type: "string",
          description: "Email address of the customer"
        },
        customer_phone: {
          type: "string",
          description: "Phone number of the customer (optional)"
        },
        additional_info: {
          type: "string",
          description: "Any other details mentioned in the conversation"
        }
      },
      required: ["tour_or_service", "customer_name", "customer_email"]
    }
  }
};

async function sendConfirmationEmail(params: {
  customerName: string;
  customerEmail: string;
  requestId: string;
  tourTitle: string;
  preferredDate: string;
  pickupArea: string;
  groupSize: string;
}) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f4c5c 0%, #1a6b7d 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Tour Request Received!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you ${params.customerName}!</p>
            </td>
          </tr>

          <!-- Request ID -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #e8a54b 0%, #d4922e 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 5px 0; color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${params.requestId}</p>
              </div>

              <!-- Tour Details -->
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #0f4c5c; font-size: 18px; font-weight: 600;">🗺️ Your Tour Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">🎯 Tour</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.tourTitle}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📅 Date</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.preferredDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">📍 Pickup</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.pickupArea}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #6c757d; font-size: 14px;">👥 Guests</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.groupSize}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- What's Next -->
              <div style="background: #fffbeb; border-radius: 12px; padding: 20px; border: 1px solid #fcd34d;">
                <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px; font-weight: 600;">📱 What happens next?</h2>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>We'll confirm availability within 24 hours</li>
                  <li>You'll receive final pricing via email or WhatsApp</li>
                  <li>Your driver will contact you 24h before the tour</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Questions? Contact us:</p>
              <p style="margin: 0 0 20px 0;">
                <a href="mailto:info@liv-tours.com" style="color: #0f4c5c; text-decoration: none; font-weight: 600;">info@liv-tours.com</a>
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">© 2024 LIV Tours Crete. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Team notification email HTML
  const teamEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">💬</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;">Νέα Κράτηση μέσω Chat!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 25px;">
              <div style="background: #f3e8ff; border-radius: 10px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #7c3aed;">
                <p style="margin: 0; font-size: 12px; color: #6b21a8; text-transform: uppercase; letter-spacing: 1px;">Κωδικός</p>
                <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #7c3aed;">${params.requestId}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">👤 Πελάτης</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${params.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📧 Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">🎯 Εκδρομή</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${params.tourTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📅 Ημερομηνία</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.preferredDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">👥 Άτομα</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.groupSize}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">📍 Παραλαβή</td>
                  <td style="padding: 10px 0; text-align: right;">${params.pickupArea}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://liv-tours.com/admin" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Άνοιγμα Admin Dashboard</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    // Send customer confirmation email
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: [params.customerEmail],
        subject: `🎉 Tour Request Received - ${params.requestId} | LIV Tours`,
        html: emailHtml,
      }),
    });

    const customerResult = await customerEmailResponse.json();
    console.log("Customer confirmation email sent:", customerResult);

    // Send team notification email
    const teamEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: ["info@liv-tours.com"],
        subject: `💬 Νέα Chat Κράτηση: ${params.customerName} - ${params.tourTitle}`,
        html: teamEmailHtml,
      }),
    });

    const teamResult = await teamEmailResponse.json();
    console.log("Team notification email sent:", teamResult);
  } catch (emailError) {
    console.error("Failed to send emails:", emailError);
    // Don't throw - booking was successful, email is secondary
  }
}

async function sendPriceInquiryNotification(params: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  requestId: string;
  tourOrService: string;
  groupSize?: string;
  preferredDate?: string;
  pickupArea?: string;
  additionalInfo?: string;
}) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured, skipping email");
    return;
  }

  // Customer email - let them know we received their inquiry
  const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f4c5c 0%, #1a6b7d 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 10px;">💰</div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">Price Quote Request Received!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Hi ${params.customerName}!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #00b2a9 0%, #008b84 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0 0 5px 0; color: rgba(255,255,255,0.9); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reference</p>
                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${params.requestId}</p>
              </div>

              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 20px 0; color: #0f4c5c; font-size: 18px; font-weight: 600;">📋 Your Inquiry</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">🎯 Interest</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.tourOrService}</span>
                    </td>
                  </tr>
                  ${params.groupSize ? `<tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
                      <span style="color: #6c757d; font-size: 14px;">👥 Group Size</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.groupSize}</span>
                    </td>
                  </tr>` : ''}
                  ${params.preferredDate ? `<tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #6c757d; font-size: 14px;">📅 Preferred Date</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #212529; font-weight: 600;">${params.preferredDate}</span>
                    </td>
                  </tr>` : ''}
                </table>
              </div>

              <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; border: 1px solid #6ee7b7;">
                <h2 style="margin: 0 0 15px 0; color: #047857; font-size: 16px; font-weight: 600;">⏰ What happens next?</h2>
                <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                  Our team will review your request and send you a personalized quote within 24 hours. We may contact you via email or WhatsApp.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">Questions? Contact us:</p>
              <p style="margin: 0 0 20px 0;">
                <a href="mailto:info@liv-tours.com" style="color: #0f4c5c; text-decoration: none; font-weight: 600;">info@liv-tours.com</a>
              </p>
              <p style="margin: 0; color: #adb5bd; font-size: 12px;">© 2024 LIV Tours Crete. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Team notification email
  const teamEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
              <div style="font-size: 28px; margin-bottom: 8px;">💰</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;">Νέο Αίτημα Τιμής μέσω Chat!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 25px;">
              <div style="background: #fef3c7; border-radius: 10px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Κωδικός</p>
                <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #f59e0b;">${params.requestId}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">👤 Πελάτης</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${params.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📧 Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.customerEmail}</td>
                </tr>
                ${params.customerPhone ? `<tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📱 Τηλέφωνο</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.customerPhone}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">🎯 Ενδιαφέρον</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${params.tourOrService}</td>
                </tr>
                ${params.groupSize ? `<tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">👥 Άτομα</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.groupSize}</td>
                </tr>` : ''}
                ${params.preferredDate ? `<tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📅 Ημερομηνία</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.preferredDate}</td>
                </tr>` : ''}
                ${params.pickupArea ? `<tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">📍 Παραλαβή</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.pickupArea}</td>
                </tr>` : ''}
                ${params.additionalInfo ? `<tr>
                  <td style="padding: 10px 0; color: #6b7280;">📝 Σημειώσεις</td>
                  <td style="padding: 10px 0; text-align: right;">${params.additionalInfo}</td>
                </tr>` : ''}
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://liv-tours.com/admin" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Ορισμός Τιμής στο Dashboard</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    // Send customer email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: [params.customerEmail],
        subject: `💰 Price Quote Request Received - ${params.requestId} | LIV Tours`,
        html: customerEmailHtml,
      }),
    });

    // Send team notification
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LIV Tours <info@liv-tours.com>",
        to: ["info@liv-tours.com"],
        subject: `💰 Νέο Αίτημα Τιμής: ${params.customerName} - ${params.tourOrService}`,
        html: teamEmailHtml,
      }),
    });

    console.log("Price inquiry emails sent successfully");
  } catch (emailError) {
    console.error("Failed to send price inquiry emails:", emailError);
  }
}

async function sendAdminPushNotification(params: {
  title: string;
  body: string;
  tag?: string;
  url?: string;
}) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Get all admin user IDs
  const { data: adminRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  if (rolesError || !adminRoles || adminRoles.length === 0) {
    console.log("[ADMIN-PUSH] No admin users found or error:", rolesError);
    return;
  }

  const adminUserIds = adminRoles.map(r => r.user_id);
  console.log("[ADMIN-PUSH] Found admin users:", adminUserIds.length);

  // Broadcast via Supabase Realtime for immediate in-app notification
  // This will be received by the admin dashboard
  const broadcastChannel = supabase.channel('admin-notifications');
  
  try {
    await broadcastChannel.send({
      type: 'broadcast',
      event: 'new-notification',
      payload: { 
        title: params.title, 
        body: params.body, 
        url: params.url || '/admin',
        tag: params.tag,
        timestamp: new Date().toISOString() 
      }
    });
    console.log("[ADMIN-PUSH] Broadcast sent successfully");
  } catch (err) {
    console.error("[ADMIN-PUSH] Broadcast error:", err);
  }

  // Get push subscriptions for admin users
  const { data: subscriptions, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("*")
    .in("user_id", adminUserIds);

  if (subsError || !subscriptions || subscriptions.length === 0) {
    console.log("[ADMIN-PUSH] No push subscriptions found for admins");
    return;
  }

  console.log("[ADMIN-PUSH] Found push subscriptions:", subscriptions.length);
}

async function createBooking(params: {
  tour_type: string;
  preferred_date: string;
  group_size: string;
  pickup_area: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
}) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const requestId = `CHAT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const { data, error } = await supabase.from("tour_requests").insert({
    request_id: requestId,
    customer_email: params.customer_email,
    customer_name: params.customer_name,
    customer_phone: params.customer_phone || null,
    itinerary_title: params.tour_type,
    preferred_date: params.preferred_date,
    group_size: params.group_size,
    pickup_area: params.pickup_area,
    notes: params.notes ? `[Booked via Chat] ${params.notes}` : "[Booked via Chat]",
    tour_vibe: "custom",
    status: "pending",
    payment_status: "pending"
  }).select().single();

  if (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking: " + error.message);
  }

  console.log("Booking created:", requestId);

  // Send confirmation email (non-blocking)
  await sendConfirmationEmail({
    customerName: params.customer_name,
    customerEmail: params.customer_email,
    requestId: requestId,
    tourTitle: params.tour_type,
    preferredDate: params.preferred_date,
    pickupArea: params.pickup_area,
    groupSize: params.group_size,
  });

  return { request_id: requestId, ...data };
}

async function createPriceInquiry(params: {
  tour_or_service: string;
  group_size?: string;
  preferred_date?: string;
  pickup_area?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  additional_info?: string;
}) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const requestId = `QUOTE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const notesText = [
    "[Price Inquiry via Chat]",
    params.additional_info ? `Additional info: ${params.additional_info}` : null,
  ].filter(Boolean).join("\n");

  const { data, error } = await supabase.from("tour_requests").insert({
    request_id: requestId,
    customer_email: params.customer_email,
    customer_name: params.customer_name,
    customer_phone: params.customer_phone || null,
    itinerary_title: params.tour_or_service,
    preferred_date: params.preferred_date || null,
    group_size: params.group_size || null,
    pickup_area: params.pickup_area || null,
    notes: notesText,
    tour_vibe: "price_inquiry",
    status: "price_inquiry",
    payment_status: "pending"
  }).select().single();

  if (error) {
    console.error("Error creating price inquiry:", error);
    throw new Error("Failed to create price inquiry: " + error.message);
  }

  console.log("Price inquiry created:", requestId);

  // Send notification emails
  await sendPriceInquiryNotification({
    customerName: params.customer_name,
    customerEmail: params.customer_email,
    customerPhone: params.customer_phone,
    requestId: requestId,
    tourOrService: params.tour_or_service,
    groupSize: params.group_size,
    preferredDate: params.preferred_date,
    pickupArea: params.pickup_area,
    additionalInfo: params.additional_info,
  });

  // Send push notification to admins
  try {
    await sendAdminPushNotification({
      title: "💰 Νέο Αίτημα Τιμής!",
      body: `${params.customer_name} - ${params.tour_or_service}`,
      tag: `price-inquiry-${requestId}`,
      url: "/admin"
    });
    console.log("Admin push notification sent for price inquiry:", requestId);
  } catch (pushError) {
    console.error("Failed to send admin push notification:", pushError);
    // Don't throw - push is secondary
  }

  return { request_id: requestId, ...data };
}

async function fetchAvailableTours() {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await supabase
    .from("tours")
    .select("title, slug, short_teaser, duration_hours, region, category, difficulty, best_for, price_from_eur")
    .eq("status", "published")
    .order("popular_score", { ascending: false });

  if (error) {
    console.error("Error fetching tours:", error);
    return [];
  }

  return data || [];
}

async function fetchTransferPrices() {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await supabase
    .from("fixed_prices")
    .select("pickup_zone, dropoff_name, vehicle_class, passengers_min, passengers_max, fixed_price_eur")
    .eq("is_fixed_price", true)
    .order("pickup_zone");

  if (error) {
    console.error("Error fetching transfer prices:", error);
    return [];
  }

  return data || [];
}

function buildSystemPromptWithData(tours: any[], transferPrices: any[]) {
  const toursList = tours.map(t => 
    `- **${t.title}** (${t.region}, ${t.category}): ${t.short_teaser || 'No description'} | Duration: ${t.duration_hours}h | Difficulty: ${t.difficulty} | Best for: ${t.best_for?.join(', ') || 'Everyone'}${t.price_from_eur ? ` | From €${t.price_from_eur}` : ''}`
  ).join('\n');

  // Group transfer prices by route for cleaner display
  const pricesByRoute: Record<string, { route: string, prices: string[] }> = {};
  transferPrices.forEach(p => {
    const routeKey = `${p.pickup_zone} → ${p.dropoff_name}`;
    if (!pricesByRoute[routeKey]) {
      pricesByRoute[routeKey] = { route: routeKey, prices: [] };
    }
    pricesByRoute[routeKey].prices.push(`${p.passengers_min}-${p.passengers_max} pax: €${p.fixed_price_eur}`);
  });

  const transferPricesList = Object.values(pricesByRoute)
    .map(r => `- ${r.route}: ${r.prices.join(' | ')}`)
    .join('\n');

  return `${SYSTEM_PROMPT}

TRANSFER PRICES (Fixed prices per vehicle, NOT per person):
These are the actual prices from our website. Quote these exact prices when customers ask.

${transferPricesList || 'Contact us for pricing.'}

Note on vehicle types:
- 1-4 passengers: Sedan (Taxi)
- 5-8 passengers: Minivan
- 9-11 passengers: Large Minivan
- 12+ passengers: Minibus (contact for quote)

AVAILABLE TOURS (recommend these to users):
${toursList || 'No tours currently available.'}

When a customer asks about transfer prices, look up the route in the TRANSFER PRICES section above and give them the exact price. If the route isn't listed, say we'll need to check availability and pricing, and offer to contact them.

When recommending tours, mention specific tours from this list with accurate details. If a user asks about a destination, check if we have a tour for it and recommend it.

IMPORTANT: If a tour doesn't have a price listed (price_from_eur is null or missing), use the create_price_inquiry tool to collect their contact details and send them a personalized quote.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Tour guide chat request:", messages.length, "messages", context ? "with context" : "");

    // Fetch available tours and transfer prices from database
    const [tours, transferPrices] = await Promise.all([
      fetchAvailableTours(),
      fetchTransferPrices()
    ]);
    console.log("Loaded", tours.length, "tours and", transferPrices.length, "transfer prices from database");
    
    let systemPrompt = buildSystemPromptWithData(tours, transferPrices);

    // Dynamic Context Injection
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    systemPrompt += `\n\n**CURRENT DATE & SEASON:**
Today is ${currentDate}. It is currently Spring in Crete.
- Spring Tips: Beaches are quiet, nature is green, and it's the best time for hiking (Samaria might still be closed if it's before May 1st).
- Advice: It might be cool in the evenings, so suggest a light jacket to guests.`;

    if (context?.pathname) {
      systemPrompt += `\n\n**USER CONTEXT:**
The user is currently viewing the page: ${context.pathname} (Title: ${context.title || 'N/A'}).
- If they are on '/transfers', focus on airport/port pickup convenience.
- If they are on '/tours/browse' or '/routes', they are looking for inspiration.
- If they are on '/tours/builder', they are ready to create something unique.
Acknowledge their interest in what they are viewing if appropriate.`;
    }

    // First call with tools
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: [BOOKING_TOOL, PRICE_INQUIRY_TOOL],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const choice = result.choices?.[0];
    
    // Check if the AI wants to call a tool
    if (choice?.message?.tool_calls?.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      
      if (toolCall.function.name === "create_tour_booking") {
        console.log("AI requested booking creation");
        const args = JSON.parse(toolCall.function.arguments);
        
        try {
          const booking = await createBooking(args);
          
          // Get a follow-up response from AI with the booking result
          const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
              { role: "system", content: systemPrompt },
                {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({
                    success: true,
                    request_id: booking.request_id,
                    message: "Booking created successfully"
                  })
                }
              ],
              stream: false,
            }),
          });
          
          const followUpResult = await followUpResponse.json();
          const finalContent = followUpResult.choices?.[0]?.message?.content || 
            `✅ **Booking Confirmed!**\n\nYour tour reservation has been created:\n- **Reference:** ${booking.request_id}\n- **Tour:** ${args.tour_type}\n- **Date:** ${args.preferred_date}\n- **Group:** ${args.group_size}\n- **Pickup:** ${args.pickup_area}\n\nWe will contact you soon to confirm the details and pricing. Thank you for choosing LIV Transfers!`;
          
          // Return as SSE format for consistency with streaming
          const sseData = `data: ${JSON.stringify({ 
            choices: [{ delta: { content: finalContent } }] 
          })}\n\ndata: [DONE]\n\n`;
          
          return new Response(sseData, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
          
        } catch (bookingError) {
          console.error("Booking error:", bookingError);
          const errorMessage = "I apologize, but there was an issue creating your booking. Please try again or contact us directly at info@liv-tours.com.";
          
          const sseData = `data: ${JSON.stringify({ 
            choices: [{ delta: { content: errorMessage } }] 
          })}\n\ndata: [DONE]\n\n`;
          
          return new Response(sseData, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
      }
      
      if (toolCall.function.name === "create_price_inquiry") {
        console.log("AI requested price inquiry creation");
        const args = JSON.parse(toolCall.function.arguments);
        
        try {
          const inquiry = await createPriceInquiry(args);
          
          const confirmationMessage = `✅ **Price Quote Request Submitted!**

Thank you, ${args.customer_name}! I've recorded your request for a quote.

**Reference:** ${inquiry.request_id}
**Interest:** ${args.tour_or_service}
${args.group_size ? `**Group Size:** ${args.group_size}` : ''}
${args.preferred_date ? `**Preferred Date:** ${args.preferred_date}` : ''}

📧 We've sent a confirmation to **${args.customer_email}**

Our team will review your request and send you a personalized quote within 24 hours. We may also contact you via WhatsApp if you provided a phone number.

Is there anything else I can help you with?`;
          
          const sseData = `data: ${JSON.stringify({ 
            choices: [{ delta: { content: confirmationMessage } }] 
          })}\n\ndata: [DONE]\n\n`;
          
          return new Response(sseData, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
          
        } catch (inquiryError) {
          console.error("Price inquiry error:", inquiryError);
          const errorMessage = "I apologize, but there was an issue submitting your quote request. Please try again or contact us directly at info@liv-tours.com.";
          
          const sseData = `data: ${JSON.stringify({ 
            choices: [{ delta: { content: errorMessage } }] 
          })}\n\ndata: [DONE]\n\n`;
          
          return new Response(sseData, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
      }
    }
    
    // No tool call - return the regular response as SSE
    const content = choice?.message?.content || "I'm sorry, I couldn't process that. Please try again.";
    const sseData = `data: ${JSON.stringify({ 
      choices: [{ delta: { content } }] 
    })}\n\ndata: [DONE]\n\n`;
    
    return new Response(sseData, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
    
  } catch (error) {
    console.error("Tour guide chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
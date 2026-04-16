import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Plane, 
  Edit, 
  AlertTriangle, 
  Briefcase, 
  Baby, 
  MapPin, 
  CreditCard 
} from "lucide-react";

const BookingTerms = () => {
  const sections = [
    {
      icon: CheckCircle,
      title: "Booking Confirmation",
      content: `Your booking is confirmed once you receive a confirmation email with your booking reference 
      number. Please verify all details are correct and contact us immediately if any changes are needed. 
      Keep your confirmation email for reference on the day of your transfer.`,
    },
    {
      icon: Clock,
      title: "Waiting Time",
      content: `For airport pickups, we include 60 minutes of free waiting time from the scheduled flight 
      arrival. For hotel/address pickups, we include 15 minutes of free waiting time. After this period, 
      additional waiting is charged at €10 per 15 minutes. We will attempt to contact you before 
      departing if you are not at the pickup point.`,
    },
    {
      icon: Users,
      title: "Meet and Greet",
      content: `For airport arrivals, your driver will wait in the arrivals hall holding a sign with your 
      name. We will send you the driver's name and phone number 24 hours before pickup. If you cannot 
      locate your driver, please call the provided number or our 24/7 support line.`,
    },
    {
      icon: Plane,
      title: "Flight Delays",
      content: `We monitor all incoming flights automatically. If your flight is delayed, we adjust your 
      pickup time accordingly at no extra charge. There is no need to contact us unless your flight is 
      cancelled. Our driver will be there when you land, regardless of delay duration.`,
    },
    {
      icon: Edit,
      title: "Changes and Modifications",
      content: `You can modify your booking (date, time, destination) free of charge up to 24 hours before 
      pickup by contacting us via WhatsApp, email, or phone. Changes within 24 hours are subject to 
      availability and may incur additional charges if the new route differs significantly.`,
    },
    {
      icon: AlertTriangle,
      title: "No Show Policy",
      content: `If you fail to appear at the pickup location without prior notice, and we cannot reach you 
      after multiple attempts, the booking will be marked as a no-show. No-shows are charged in full. 
      If you miss your transfer, contact us immediately to arrange alternatives.`,
    },
    {
      icon: Briefcase,
      title: "Luggage Policy",
      content: `Standard luggage allowance is 1 large suitcase and 1 carry-on per passenger. Please inform 
      us at booking if you have oversized items (surfboards, golf clubs, bikes) so we can arrange an 
      appropriate vehicle. Additional luggage trailers are available upon request.`,
    },
    {
      icon: Baby,
      title: "Child Seats",
      content: `We provide baby seats (0-12 months), child seats (1-4 years), and booster seats (4-12 years) 
      upon request. Please specify your requirements when booking, including the age and 
      weight of each child requiring a seat.`,
    },
    {
      icon: MapPin,
      title: "Extra Stops",
      content: `One brief stop (supermarket, ATM, pharmacy) of up to 10 minutes is included free on routes 
      over 30 minutes. Additional stops or longer waiting times are charged at €15 per stop. Please 
      request any planned stops at the time of booking.`,
    },
    {
      icon: CreditCard,
      title: "Payment",
      content: `You can pay online in advance or pay your driver directly on arrival (cash in Euros or card). 
      All prices are per vehicle, not per person, and include VAT where applicable. The price confirmed 
      at booking is final with no hidden fees or surcharges.`,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Booking Terms | LIV Tours"
        description="Understand our booking policies including confirmation, waiting times, cancellation, and payment terms."
        canonicalUrl="https://livtours.gr/legal/bookingterms"
      />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Booking Policies
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Booking Terms
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Everything you need to know about booking transfers and tours with LIV Tours.
            </p>
            <p className="text-sm text-primary-foreground/60 mt-4">
              Last updated: January 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          <div className="grid gap-6">
            {sections.map((section) => (
              <div key={section.title} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-olive/10 flex-shrink-0">
                    <section.icon className="w-5 h-5 text-olive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary mb-2">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 text-center p-6 rounded-2xl bg-olive/5 border border-olive/20">
            <p className="text-muted-foreground">
              Questions about your booking? Contact us 24/7 at{" "}
              <a href="tel:+306944363525" className="text-accent font-medium hover:underline">
                +30 694 436 3525
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BookingTerms;

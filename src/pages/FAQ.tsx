import Layout from "@/components/Layout";
import FAQAccordion from "@/components/FAQAccordion";
import FinalCTABlock from "@/components/FinalCTABlock";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, HelpCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import faqHero from "@/assets/hero-transfer.webp";

const FAQ = () => {
  const bookingFAQs = [
    {
      question: "How do I book?",
      answer: "Fill out the quote form, WhatsApp us, or call. We reply within 15 minutes with a confirmed price. Accept it, and you are booked. No deposit required for standard transfers.",
    },
    {
      question: "How far ahead should I book?",
      answer: "24-48 hours for airport transfers. 2-3 days for private tours in peak season (June-September). We often accommodate last-minute requests, but earlier is safer.",
    },
    {
      question: "Can I change or cancel?",
      answer: "Free changes and cancellations up to 24 hours before pickup. Within 24 hours, 50% fee applies. No-shows are charged in full.",
    },
    {
      question: "How do I pay?",
      answer: "Cash (Euro), card (Visa, Mastercard), or secure online payment. Pay on arrival or in advance—your choice. Tours may require a deposit.",
    },
  ];

  const serviceFAQs = [
    {
      question: "Do you track flights?",
      answer: "Yes. We monitor every incoming flight. If your plane is delayed, your driver adjusts automatically. No calls needed, no extra charge.",
    },
    {
      question: "What if my flight is cancelled?",
      answer: "Contact us immediately. We reschedule at no cost or refund in full. We understand travel does not always go to plan.",
    },
    {
      question: "Do you have child seats?",
      answer: "Yes—baby seats (0-12 months), child seats (1-4 years), booster seats (4-12 years). All free. Specify what you need when booking.",
    },
    {
      question: "How much luggage can I bring?",
      answer: "Sedan (1-4 passengers): 3 large bags + 3 carry-ons. Minivan (4-11 passengers): 6 large + 6 carry-on. Minibus (11-20 passengers): 16 large. Extra or oversized luggage? Let us know in advance.",
    },
    {
      question: "Do drivers speak English?",
      answer: "Yes, all drivers are fluent in English. Many speak German, French, or other languages. Need a specific language? Ask when booking.",
    },
    {
      question: "Are snacks and drinks included?",
      answer: "Yes. On tours we provide complimentary water, soft drinks, local snacks and seasonal fruit. Availability may vary by tour and season. You will see the exact inclusions during booking.",
    },
  ];

  const pricingFAQs = [
    {
      question: "Are prices fixed or metered?",
      answer: "Fixed. Always. No meters, no surge pricing. The price you accept is the price you pay. Period.",
    },
    {
      question: "Any hidden fees?",
      answer: "None. Price includes vehicle, driver, fuel, tolls, parking, and VAT. Only extras are optional stops or route changes you request during the trip.",
    },
    {
      question: "Do prices change in summer?",
      answer: "Standard route prices stay the same year-round. Tour prices may adjust slightly in peak season due to demand, but we always quote upfront.",
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Συχνές Ερωτήσεις | FAQ Μεταφορές Χανιά - LIV Tours"
        description="Απαντήσεις σε συχνές ερωτήσεις για μεταφορές αεροδρομίου στα Χανιά. Τιμές, κρατήσεις, παιδικά καθίσματα, καθυστερήσεις πτήσης."
        keywords="FAQ ταξί Χανιά, συχνές ερωτήσεις transfer Crete, airport transfer FAQ"
        canonicalUrl="https://livtours.gr/faq"
      />
      <PageHero
        label="Help Center"
        title="Quick"
        titleAccent="Answers"
        subtitle="Everything you need to know about booking, pricing, and what to expect."
        image={faqHero}
        icon={HelpCircle}
        align="left"
        overlay="dark"
        serifAccent
      />

      {/* FAQ Sections */}
      <section className="section-padding">
        <div className="container-wide max-w-4xl">
          {/* Booking */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-primary mb-6">Booking</h2>
            <FAQAccordion items={bookingFAQs} defaultOpen="item-0" />
          </div>

          {/* Services */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-primary mb-6">Service</h2>
            <FAQAccordion items={serviceFAQs} />
          </div>

          {/* Pricing */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-primary mb-6">Pricing</h2>
            <FAQAccordion items={pricingFAQs} />
          </div>

          {/* Still Have Questions */}
          <div className="glass-card p-8 text-center">
            <h3 className="text-xl font-bold text-primary mb-3">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              We respond within 15 minutes. Usually faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button variant="hero" size="lg">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a
                href="https://wa.me/306944363525"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="lg">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Ready to Book?"
        subtitle="Fixed price. Instant confirmation. No hidden fees."
        badge="FAQ"
      />
    </Layout>
  );
};

export default FAQ;

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Smartphone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import Confetti from "@/components/Confetti";
import { getWhatsAppLink } from "@/lib/booking";
import { trackEvent } from "@/lib/tracking";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(true);

  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    trackEvent("payment_success", { bookingId, sessionId });
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [bookingId, sessionId]);

  const handleWhatsApp = () => {
    const message = language === 'gr' 
      ? `Γεια! Μόλις ολοκλήρωσα την πληρωμή για την κράτηση ${bookingId}. Μπορείτε να επιβεβαιώσετε;`
      : `Hi! I just completed payment for booking ${bookingId}. Can you confirm?`;
    window.open(getWhatsAppLink(message), '_blank');
  };

  return (
    <Layout>
      <SEOHead
        title="Payment Successful | LIV Tours"
        description="Your payment has been processed successfully."
        noindex={true}
      />

      {showConfetti && <Confetti />}

      <section className="min-h-[70vh] flex items-center justify-center py-16">
        <div className="container-wide max-w-lg text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-accent animate-[pulse_2s_ease-in-out_infinite]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3 animate-fade-in">
            {language === 'gr' ? 'Πληρωμή Επιτυχής!' : 'Payment Successful!'}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2 animate-fade-in">
            {language === 'gr' 
              ? 'Ευχαριστούμε για την πληρωμή σας.'
              : 'Thank you for your payment.'}
          </p>

          {bookingId && (
            <p className="text-sm text-muted-foreground mb-8">
              {language === 'gr' ? 'Κωδικός Κράτησης: ' : 'Booking ID: '}
              <span className="font-mono font-semibold text-primary">{bookingId}</span>
            </p>
          )}

          {/* What's Next */}
          <div className="glass-card p-6 mb-8 text-left">
            <h2 className="font-semibold text-primary mb-4">
              {language === 'gr' ? 'Τι συμβαίνει τώρα;' : "What happens now?"}
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  {language === 'gr' 
                    ? 'Η κράτησή σας είναι επιβεβαιωμένη και πληρωμένη.'
                    : 'Your booking is confirmed and paid.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  {language === 'gr' 
                    ? 'Θα λάβετε επιβεβαίωση μέσω WhatsApp σύντομα.'
                    : 'You will receive confirmation via WhatsApp shortly.'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  {language === 'gr' 
                    ? 'Ο οδηγός θα επικοινωνήσει 24 ώρες πριν την παραλαβή.'
                    : 'Your driver will contact you 24 hours before pickup.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link to="/trip" className="w-full">
              <Button variant="hero" size="lg" className="w-full">
                <Smartphone className="w-5 h-5" />
                {language === 'gr' ? 'Άνοιγμα Trip Hub' : 'Open Trip Hub'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Button 
              variant="whatsapp" 
              size="lg" 
              className="w-full"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5" />
              {language === 'gr' ? 'Επικοινωνία μέσω WhatsApp' : 'Contact via WhatsApp'}
            </Button>

            <Link to="/" className="w-full">
              <Button variant="ghost" size="lg" className="w-full">
                {language === 'gr' ? 'Επιστροφή στην Αρχική' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentSuccess;

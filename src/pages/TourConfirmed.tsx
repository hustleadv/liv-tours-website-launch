import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  Calendar, 
  Smartphone, 
  Clock,
  CheckCircle2,
  MapIcon,
  Apple,
  Compass,
  Sun,
  Users,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import Confetti from "@/components/Confetti";
import { 
  BookingData, 
  getLastBooking, 
  getWhatsAppLink,
  downloadCalendarFile
} from "@/lib/booking";
import { trackEvent } from "@/lib/tracking";
import { useLanguage } from "@/contexts/LanguageContext";

const TourConfirmed = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    const lastBooking = getLastBooking();
    if (!lastBooking || lastBooking.bookingType !== 'tour') {
      navigate('/');
      return;
    }
    setBooking(lastBooking);
    trackEvent('tour_booking_submit', { tourId: lastBooking.bookingId });
  }, [navigate]);

  if (!booking) {
    return null;
  }

  const handleWhatsAppOpen = () => {
    const message = language === 'gr'
      ? `Γεια! Έκανα αίτηση για την εκδρομή "${booking.dropoff}" (${booking.bookingId}). Μπορείτε να επιβεβαιώσετε;`
      : `Hi! I submitted a tour request for "${booking.dropoff}" (${booking.bookingId}). Can you confirm?`;
    window.open(getWhatsAppLink(message), '_blank');
  };

  return (
    <Layout>
      <SEOHead
        title={language === 'gr' ? 'Αίτηση Εκδρομής Ελήφθη | LIV Tours' : 'Tour Request Received | LIV Tours'}
        description="Your tour request has been received. We will confirm your booking shortly."
        noindex={true}
      />
      
      <Confetti />

      {/* Confirmation Hero */}
      <section className="bg-primary py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-olive rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container-wide relative z-10">
          <div className="text-center mb-8">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-accent bg-accent/10 px-4 py-1.5 rounded-full mb-4 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 animate-[pulse_2s_ease-in-out_infinite]" />
              {language === 'gr' ? 'Αίτηση Ελήφθη' : 'Request Received'}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              {language === 'gr' ? 'Σας Ευχαριστούμε!' : 'Thank You!'}
            </h1>
            <p className="text-primary-foreground/70 max-w-md mx-auto">
              {language === 'gr' 
                ? 'Η αίτηση εκδρομής σας έχει ληφθεί. Θα επιβεβαιώσουμε εντός 15 λεπτών.'
                : 'Your tour request has been received. We will confirm within 15 minutes.'}
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Compass className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">
                  {language === 'gr' ? 'Εκδρομή' : 'Tour'}
                </p>
                <p className="font-semibold text-white text-lg">{booking.dropoff}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4 text-accent" />
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-accent" />
                <span>{booking.pickup}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-4 h-4 text-accent" />
                <span>{booking.passengers} {language === 'gr' ? 'άτομα' : 'guests'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs text-white/60">
                {language === 'gr' ? 'Κωδικός Κράτησης' : 'Booking ID'}
              </p>
              <p className="font-mono font-bold text-accent text-lg">{booking.bookingId}</p>
            </div>

            {/* Payment Status */}
            <div className="mt-4 flex items-center gap-2 text-sm text-white/80 bg-white/10 rounded-lg p-3">
              <Sun className="w-4 h-4 text-accent" />
              <span>
                {language === 'gr' 
                  ? 'Πληρωμή στον οδηγό (μετρητά ή κάρτα)'
                  : 'Payment to driver (cash or card)'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <Button 
              variant="whatsapp" 
              size="lg" 
              className="flex-1"
              onClick={handleWhatsAppOpen}
            >
              <MessageCircle className="w-5 h-5" />
              {language === 'gr' ? 'Επικοινωνία WhatsApp' : 'Contact on WhatsApp'}
            </Button>
            <Link to="/trip" className="flex-1">
              <Button variant="outline" size="lg" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Smartphone className="w-4 h-4" />
                {language === 'gr' ? 'Trip Hub' : 'Open Trip Hub'}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => downloadCalendarFile(booking)}
            >
              <Calendar className="w-4 h-4" />
              {language === 'gr' ? 'Ημερολόγιο' : 'Add to Calendar'}
            </Button>
          </div>
        </div>
      </section>

      {/* Next Steps Timeline */}
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <h2 className="text-2xl font-bold text-primary text-center mb-10">
            {language === 'gr' ? 'Τι Ακολουθεί' : 'What Happens Next'}
          </h2>

          <div className="space-y-0">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-border my-2" />
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-primary">
                    {language === 'gr' ? 'Επιβεβαίωση μέσω WhatsApp' : 'WhatsApp Confirmation'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {language === 'gr' 
                    ? 'Θα λάβετε επιβεβαίωση και τελική τιμή εντός 15 λεπτών μέσω WhatsApp.'
                    : 'You will receive confirmation and final price within 15 minutes via WhatsApp.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-border my-2" />
              </div>
              <div className="pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-primary">
                    {language === 'gr' ? 'Ραντεβού Παραλαβής' : 'Pickup Arrangement'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {language === 'gr' 
                    ? 'Θα σας ενημερώσουμε για την ακριβή ώρα και σημείο παραλαβής.'
                    : 'We will inform you about the exact pickup time and location.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-olive flex items-center justify-center text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-5 h-5 text-olive" />
                  <h3 className="font-semibold text-primary">
                    {language === 'gr' ? 'Απολαύστε την Εκδρομή!' : 'Enjoy Your Tour!'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {language === 'gr' 
                    ? 'Ο οδηγός σας θα σας συναντήσει στην ώρα του. Καλή διασκέδαση!'
                    : 'Your driver will meet you on time. Have a great experience!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Refreshments Reminder */}
      <section className="py-6">
        <div className="container-wide max-w-3xl">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-olive/10 border border-olive/20">
            <Apple className="w-5 h-5 text-olive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <span className="font-medium">
                {language === 'gr' 
                  ? 'Περιλαμβάνονται: Εμφιαλωμένο νερό και σνακ κατά τη διάρκεια της εκδρομής.'
                  : 'Included: Bottled water and snacks during your tour.'}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Explore More Tours */}
      <section className="py-10 bg-cream-warm">
        <div className="container-wide max-w-3xl">
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-1">
              {language === 'gr' ? 'Ανακαλύψτε Περισσότερα' : 'Discover More'}
            </p>
            <h3 className="text-xl font-bold text-primary">
              {language === 'gr' ? 'Εξερευνήστε Άλλες Εκδρομές' : 'Explore Other Tours'}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tours/browse">
              <Button variant="outline" size="lg">
                <MapIcon className="w-5 h-5" />
                {language === 'gr' ? 'Όλες οι Εκδρομές' : 'Browse All Tours'}
              </Button>
            </Link>
            <Link to="/quiz">
              <Button variant="outline" size="lg">
                <Compass className="w-5 h-5" />
                {language === 'gr' ? 'Βρες την Ιδανική Εκδρομή' : 'Find Your Perfect Tour'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8">
        <div className="container-wide text-center">
          <Link to="/">
            <Button variant="ghost" size="lg">
              {language === 'gr' ? '← Επιστροφή στην Αρχική' : '← Back to Home'}
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default TourConfirmed;

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowRight, 
  MessageCircle, 
  Calendar, 
  Map, 
  Smartphone, 
  Plane, 
  Clock,
  UserCheck,
  CheckCircle2,
  ArrowLeftRight,
  MapIcon,
  Phone,
  Baby,
  MapPinPlus,
  Battery,
  Wifi,
  Check,
  Apple,
  HelpCircle,
  Compass,
  CreditCard,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BookingPass from "@/components/BookingPass";
import ReturnTripModal from "@/components/ReturnTripModal";
import MeetingPoint from "@/components/MeetingPoint";
import Confetti from "@/components/Confetti";
import PaymentOptions from "@/components/PaymentOptions";
import { 
  BookingData, 
  getLastBooking, 
  generateBookingWhatsAppMessage,
  generateChangeTimeMessage,
  generateExtraStopMessage,
  generateChildSeatMessage,
  generateMeetingPointMessage,
  generateTourInquiryMessage,
  getWhatsAppLink,
  getGoogleMapsLink,
  downloadCalendarFile
} from "@/lib/booking";
import { trackEvent } from "@/lib/tracking";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BookingConfirmed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentSkipped, setPaymentSkipped] = useState(false);
  const [dbPrice, setDbPrice] = useState<number | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // Check if payment was canceled
  const paymentCanceled = searchParams.get("payment_canceled") === "true";

  useEffect(() => {
    const lastBooking = getLastBooking();
    if (!lastBooking) {
      navigate('/');
      return;
    }
    setBooking(lastBooking);
    trackEvent('booking_confirm_view');

    // Check localStorage data first - if cash was selected, don't show payment options
    const isCashPayment = lastBooking.paymentType === 'cash';
    const isAlreadyPaid = lastBooking.paymentStatus === 'paid';
    
    if (isCashPayment) {
      setPaymentSkipped(true);
      setShowPaymentOptions(false);
    } else if (isAlreadyPaid) {
      setIsPaid(true);
      setShowPaymentOptions(false);
    } else {
      // Show payment options for pending online payments
      setShowPaymentOptions(true);
    }

    // Use totalAmount from localStorage as the price source
    if (lastBooking.totalAmount && lastBooking.totalAmount > 0) {
      setDbPrice(lastBooking.totalAmount);
    }

    // Also try to fetch from database for most up-to-date data
    const fetchPrice = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('total_amount, payment_status, payment_type')
        .eq('booking_id', lastBooking.bookingId)
        .maybeSingle();
      
      if (data) {
        if (data.total_amount && data.total_amount > 0) {
          setDbPrice(data.total_amount);
        }
        // Hide payment options if already paid or cash selected
        if (data.payment_status === 'paid' || data.payment_type === 'cash') {
          setShowPaymentOptions(false);
        }
        // Track paid status for badge
        if (data.payment_status === 'paid') {
          setIsPaid(true);
        }
      }
    };
    fetchPrice();

    // Subscribe to real-time payment status updates
    const channel = supabase
      .channel(`booking-${lastBooking.bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `booking_id=eq.${lastBooking.bookingId}`
        },
        (payload) => {
          const newData = payload.new as { payment_status?: string; payment_type?: string };
          if (newData.payment_status === 'paid') {
            setIsPaid(true);
            setShowPaymentOptions(false);
            toast({
              title: language === 'gr' ? 'Πληρωμή Επιβεβαιώθηκε!' : 'Payment Confirmed!',
              description: language === 'gr' 
                ? 'Η κράτησή σας είναι πλέον πλήρως επιβεβαιωμένη.'
                : 'Your booking is now fully confirmed.',
            });
          }
        }
      )
      .subscribe();

    // Show toast if payment was canceled
    if (paymentCanceled) {
      toast({
        title: language === 'gr' ? 'Πληρωμή Ακυρώθηκε' : 'Payment Canceled',
        description: language === 'gr' 
          ? 'Μπορείτε να πληρώσετε αργότερα ή κατά την άφιξη.'
          : 'You can pay later or on arrival.',
      });
      trackEvent('payment_canceled', { bookingId: lastBooking.bookingId });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, paymentCanceled, language]);

  if (!booking) {
    return null;
  }

  // Get price for payment - prefer DB price, then booking totalAmount, then fallback
  const getNumericPrice = (): number => {
    // Use DB price if available (most accurate)
    if (dbPrice && dbPrice > 0) {
      return dbPrice;
    }
    // Use totalAmount from booking if available
    if (booking.totalAmount && booking.totalAmount > 0) {
      return booking.totalAmount;
    }
    // Fallback to default prices based on vehicle type
    if (booking.vehicleType.toLowerCase().includes('minibus')) {
      return 120;
    }
    return 55; // Default taxi price
  };

  const handlePaymentSkip = () => {
    setShowPaymentOptions(false);
    setPaymentSkipped(true);
    trackEvent('payment_canceled', { bookingId: booking.bookingId });
  };

  const handleWhatsAppOpen = () => {
    trackEvent('booking_whatsapp_open');
    window.open(getWhatsAppLink(generateBookingWhatsAppMessage(booking)), '_blank');
  };

  const handleReturnTripClick = () => {
    trackEvent('booking_return_trip_start');
    setShowReturnModal(true);
  };

  const handleChangeRequest = (type: 'time' | 'stop' | 'seat' | 'meetingpoint' | 'tour') => {
    trackEvent('whatsapp_quick_action_click', { ctaType: type });
    let message = '';
    switch (type) {
      case 'time':
        message = generateChangeTimeMessage(booking.bookingId);
        break;
      case 'stop':
        message = generateExtraStopMessage(booking.bookingId);
        break;
      case 'seat':
        message = generateChildSeatMessage(booking.bookingId);
        break;
      case 'meetingpoint':
        message = generateMeetingPointMessage(booking.bookingId);
        break;
      case 'tour':
        message = generateTourInquiryMessage(booking.bookingId);
        break;
    }
    window.open(getWhatsAppLink(message), '_blank');
  };

  return (
    <Layout>
      <SEOHead
        title="Booking Confirmed | LIV Tours"
        description="Your transfer booking has been received. View your booking details and next steps."
        noindex={true}
      />
      
      <Confetti />

      {/* Confirmation Hero */}
      <section className="bg-primary py-6 md:py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-accent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-olive rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container-wide relative z-10 px-4">
          <div className="text-center mb-4">
            {/* Payment Status Badge */}
            {isPaid ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 rounded-full mb-2 md:mb-4 animate-fade-in shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'gr' ? 'Προ-κρατημένο & Πληρωμένο' : 'Pre-booked & Paid'}
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full mb-2 md:mb-4 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 animate-[pulse_2s_ease-in-out_infinite]" />
                {t.booking.requestReceived}
              </p>
            )}
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-1">
              {isPaid 
                ? (language === 'gr' ? 'Η Κράτησή σας Επιβεβαιώθηκε!' : 'Your Booking is Confirmed!')
                : t.booking.wereOnIt}
            </h1>
            <p className="text-xs md:text-base text-primary-foreground/70 max-w-md mx-auto">
              {isPaid
                ? (language === 'gr' ? 'Η πληρωμή σας ελήφθη. Είστε έτοιμοι!' : 'Your payment was received. You\'re all set!')
                : t.booking.confirmingAvailability}
            </p>
          </div>

          {/* Next Step Banner */}
          <div className="text-center mb-3 md:mb-6">
            <p className="text-xs text-primary-foreground/80 font-medium">
              {t.booking.nextStep}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-2 justify-center mb-4 md:mb-8 max-w-lg mx-auto">
            <div className="flex gap-2">
              <Button 
                variant="whatsapp" 
                size="default" 
                className="flex-1 h-10 md:h-12 text-sm md:text-base"
                onClick={handleWhatsAppOpen}
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                size="default" 
                className="flex-1 h-10 md:h-12 text-sm md:text-base bg-white/10 border-white/20 text-white hover:bg-white/20"
                asChild
              >
                <a href={`mailto:info@liv-tours.com?subject=${encodeURIComponent(`Booking ${booking.bookingId}`)}&body=${encodeURIComponent(`Hi,\n\nRegarding my booking ${booking.bookingId}:\n${booking.pickup} → ${booking.dropoff}\nDate: ${booking.date}\nTime: ${booking.time}\n\n`)}`}>
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
                  Email
                </a>
              </Button>
            </div>
            <div className="flex gap-2">
              <Link to="/trip" className="flex-1">
                <Button variant="outline" size="default" className="w-full h-9 md:h-12 text-xs md:text-sm bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Smartphone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Trip Hub
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="default" 
                className="flex-1 h-9 md:h-12 text-xs md:text-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => downloadCalendarFile(booking)}
              >
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {language === 'gr' ? 'Ημερολόγιο' : 'Calendar'}
              </Button>
            </div>
          </div>

          {/* Booking Pass */}
          <BookingPass booking={booking} />
        </div>
      </section>

      {/* Payment Options Section */}
      {showPaymentOptions && !paymentSkipped && (
        <section className="py-4 md:py-8 bg-cream-warm">
          <div className="container-wide max-w-lg px-3 md:px-6">
            <div className="glass-card p-3 md:p-6">
              <PaymentOptions
                bookingId={booking.bookingId}
                customerEmail={booking.customerEmail}
                customerName={booking.customerName}
                amount={getNumericPrice()}
                bookingType={booking.bookingType === 'tour' ? 'tour' : 'transfer'}
                pickup={booking.pickup}
                dropoff={booking.dropoff}
                date={booking.date}
                onPaymentStarted={() => setShowPaymentOptions(false)}
                onSkip={handlePaymentSkip}
              />
            </div>
          </div>
        </section>
      )}

      {/* Payment Skipped Notice */}
      {paymentSkipped && (
        <section className="py-4 md:py-6 bg-cream-warm">
          <div className="container-wide max-w-lg px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-muted border border-border">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-foreground">
                  {language === 'gr' ? 'Πληρωμή κατά την άφιξη' : 'Payment on arrival'}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {language === 'gr' 
                    ? 'Θα πληρώσετε τον οδηγό με μετρητά ή κάρτα.'
                    : 'Pay the driver with cash or card.'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
                onClick={() => {
                  setShowPaymentOptions(true);
                  setPaymentSkipped(false);
                }}
              >
                {language === 'gr' ? 'Πληρωμή Τώρα' : 'Pay Now'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Meeting Point for Airport/Port routes - Show early for immediate relevance */}
      {(booking.isAirportRoute || booking.isPortRoute) && (
        <section className="py-4 md:py-8">
          <div className="container-wide max-w-lg px-3 md:px-6">
            <MeetingPoint 
              type={booking.isAirportRoute ? "airport" : "port"}
              locationName={booking.pickup}
              variant="full"
            />
          </div>
        </section>
      )}

      {/* Next Steps Timeline */}
      <section className="py-6 md:py-12 bg-cream-warm">
        <div className="container-wide max-w-3xl px-3 md:px-6">
          <h2 className="text-lg md:text-2xl font-bold text-primary text-center mb-4 md:mb-10">
            {t.booking.whatHappensNext}
          </h2>

          <div className="space-y-0">
            {/* Step 1 */}
            <div className="flex gap-2.5 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs md:text-base">
                  1
                </div>
                <div className="w-0.5 flex-1 bg-border my-1.5 md:my-2" />
              </div>
              <div className="pb-4 md:pb-8">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-2">
                  <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-accent" />
                  <h3 className="font-semibold text-xs md:text-base text-primary">{t.booking.whatsAppConfirmation}</h3>
                </div>
                <p className="text-muted-foreground text-[11px] md:text-sm leading-relaxed">
                  {t.booking.whatsAppConfirmationDesc}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-2.5 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs md:text-base">
                  2
                </div>
                <div className="w-0.5 flex-1 bg-border my-1.5 md:my-2" />
              </div>
              <div className="pb-4 md:pb-8">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-2">
                  <Plane className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
                  <h3 className="font-semibold text-xs md:text-base text-primary">{t.booking.flightMonitoring}</h3>
                </div>
                <p className="text-muted-foreground text-[11px] md:text-sm leading-relaxed">
                  {booking.isAirportRoute 
                    ? t.booking.flightMonitoringAirport
                    : t.booking.flightMonitoringGeneral
                  }
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-2.5 md:gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-olive flex items-center justify-center text-white font-bold text-xs md:text-base">
                  3
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-2">
                  <UserCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-olive" />
                  <h3 className="font-semibold text-xs md:text-base text-primary">{t.booking.meetGreetDetails}</h3>
                </div>
                <p className="text-muted-foreground text-[11px] md:text-sm leading-relaxed">
                  {t.booking.meetGreetDetailsDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Refreshments Reminder - Only for Tours */}
      {booking.bookingType === 'tour' && (
        <section className="py-3 md:py-6">
          <div className="container-wide max-w-3xl px-3 md:px-6">
            <div className="flex items-start gap-2 p-2.5 md:p-4 rounded-xl bg-olive/10 border border-olive/20">
              <Apple className="w-3.5 h-3.5 md:w-5 md:h-5 text-olive flex-shrink-0 mt-0.5" />
              <p className="text-[11px] md:text-sm text-foreground leading-relaxed">
                <span className="font-medium">{t.booking.tourRefreshments}</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="py-4 md:py-10">
        <div className="container-wide max-w-3xl px-3 md:px-6">
          <h2 className="text-base md:text-xl font-bold text-primary text-center mb-3 md:mb-6">
            {t.booking.quickActions}
          </h2>
          <div className="grid grid-cols-3 gap-1.5 md:gap-3">
            <a 
              href={getGoogleMapsLink(booking.pickup, booking.dropoff)}
              target="_blank"
              rel="noopener noreferrer"
              className="contents"
            >
              <Button 
                variant="outline" 
                size="sm"
                className="w-full flex-col h-auto py-2.5 md:py-4 text-[10px] md:text-xs"
              >
                <Map className="w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1" />
                {language === 'gr' ? 'Χάρτης' : 'Map'}
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex-col h-auto py-2.5 md:py-4 text-[10px] md:text-xs"
              onClick={() => handleChangeRequest('time')}
            >
              <Clock className="w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1" />
              {language === 'gr' ? 'Αλλαγή Ώρας' : 'Time'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex-col h-auto py-2.5 md:py-4 text-[10px] md:text-xs"
              onClick={() => handleChangeRequest('stop')}
            >
              <MapPinPlus className="w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1" />
              {language === 'gr' ? 'Στάση' : 'Stop'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex-col h-auto py-2.5 md:py-4 text-[10px] md:text-xs"
              onClick={() => handleChangeRequest('seat')}
            >
              <Baby className="w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1" />
              {language === 'gr' ? 'Παιδικό' : 'Child Seat'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex-col h-auto py-2.5 md:py-4 text-[10px] md:text-xs"
              onClick={() => handleChangeRequest('meetingpoint')}
            >
              <HelpCircle className="w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1" />
              {language === 'gr' ? 'Σημείο' : 'Meeting'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full flex-col h-auto py-2.5 md:py-4 text-[10px] md:text-xs"
              onClick={() => handleChangeRequest('tour')}
            >
              <Compass className="w-4 h-4 md:w-5 md:h-5 mb-0.5 md:mb-1" />
              {language === 'gr' ? 'Εκδρομή' : 'Tour'}
            </Button>
          </div>
        </div>
      </section>

      {/* Return Trip CTA */}
      <section className="py-6 md:section-padding">
        <div className="container-wide max-w-2xl px-3 md:px-6">
          <div className="glass-card p-4 md:p-8 text-center">
            <div className="inline-flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full bg-accent/20 mb-2 md:mb-4">
              <ArrowLeftRight className="w-4 h-4 md:w-6 md:h-6 text-accent" />
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-primary mb-1">
              {t.booking.bookYourReturnTrip}
            </h2>
            <p className="text-xs md:text-base text-muted-foreground mb-3 md:mb-6 max-w-md mx-auto">
              {t.booking.sameRouteSameVehicle}
            </p>
            <Button 
              variant="hero" 
              size="default"
              className="h-10 md:h-14 text-sm md:text-base w-full md:w-auto"
              onClick={handleReturnTripClick}
            >
              {t.booking.bookReturnIn10Seconds}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="py-5 md:py-10 bg-cream-warm">
        <div className="container-wide max-w-3xl px-3 md:px-6">
          <div className="text-center mb-3 md:mb-6">
            <p className="text-[10px] md:text-sm font-medium text-accent uppercase tracking-wider mb-0.5">{t.booking.whileInCrete}</p>
            <h3 className="text-base md:text-xl font-bold text-primary">{t.booking.makeItAFullDay}</h3>
          </div>
          <div className="flex flex-col gap-2 md:gap-4">
            <Link to="/tours" className="w-full">
              <Button variant="outline" size="default" className="w-full h-9 md:h-12 text-xs md:text-base">
                <MapIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                {t.booking.explorePrivateTours}
              </Button>
            </Link>
            <a 
              href={getWhatsAppLink("Hi! I'm interested in a custom tour/itinerary in Crete. Can you help?")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="whatsapp" size="default" className="w-full h-9 md:h-12 text-xs md:text-base">
                <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5" />
                {t.booking.askForCustomItinerary}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Return Trip Modal */}
      <ReturnTripModal 
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        originalBooking={booking}
      />
    </Layout>
  );
};

export default BookingConfirmed;

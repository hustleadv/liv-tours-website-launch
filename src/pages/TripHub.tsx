import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  Calendar, 
  Map, 
  ArrowLeftRight, 
  ArrowRight,
  Clock,
  Baby,
  MapPinPlus,
  Compass,
  Sparkles,
  Home as HomeIcon,
  Apple,
  HelpCircle,
  Search,
  Smartphone,
  Loader2,
  Star,
  ChevronRight,
  RotateCcw,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import BookingPass from "@/components/BookingPass";
import TourBookingPass from "@/components/TourBookingPass";
import ReturnTripModal from "@/components/ReturnTripModal";
import TripPackingTips from "@/components/TripPackingTips";
import TripHubReviewCard from "@/components/TripHubReviewCard";
import TripStatusTimeline from "@/components/TripStatusTimeline";
import SaveTripHubModal from "@/components/SaveTripHubModal";
import DriverStatusCard from "@/components/DriverStatusCard";
import PaymentStatusCard from "@/components/PaymentStatusCard";
import TourPaymentStatusCard from "@/components/TourPaymentStatusCard";
import { NotificationToggle } from "@/components/NotificationToggle";
import { LoyaltyBadge } from "@/components/LoyaltyBadge";
import { usePublishedTours } from "@/hooks/useTours";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  BookingData, 
  getLastBooking,
  getBookingHistory,
  saveBooking,
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
import { useQuote } from "@/contexts/QuoteContext";
import { routes } from "@/data/routes";

// Parse booking date and time to check if trip is completed
const parsePickupDateTime = (dateStr: string, timeStr: string): Date | null => {
  try {
    const months: Record<string, number> = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
    };
    
    const dateParts = dateStr.toLowerCase().split(' ');
    if (dateParts.length < 3) return null;
    
    const day = parseInt(dateParts[0]);
    const monthKey = dateParts[1].substring(0, 3);
    const month = months[monthKey];
    const year = parseInt(dateParts[2]);
    
    if (isNaN(day) || month === undefined || isNaN(year)) return null;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    return new Date(year, month, day, hours, minutes);
  } catch {
    return null;
  }
};

const TripHub = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { setQuoteData } = useQuote();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [bookingType, setBookingType] = useState<'transfer' | 'tour'>('transfer');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showFindTrip, setShowFindTrip] = useState(false);
  const [findBookingId, setFindBookingId] = useState('');
  const [findIdentifier, setFindIdentifier] = useState('');
  const [findError, setFindError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this is a tour booking
  const isTourBooking = bookingType === 'tour' || booking?.bookingId?.startsWith('TOUR-');

  // Realtime subscription for booking status and driver updates
  useEffect(() => {
    if (!booking?.bookingId) return;

    // Determine the table to listen to
    const tableName = isTourBooking ? 'tour_requests' : 'bookings';
    const filterColumn = isTourBooking ? 'request_id' : 'booking_id';

    const channel = supabase
      .channel(`booking-updates-${booking.bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: `${filterColumn}=eq.${booking.bookingId}`
        },
        (payload) => {
          const newData = payload.new as {
            driver_name?: string;
            driver_phone?: string;
            driver_language?: string;
            driver_message_sent?: boolean;
            driver_message_sent_at?: string;
            status?: string;
            confirmed_at?: string;
            payment_status?: string;
            payment_type?: string;
            payment_amount?: number;
            paid_at?: string;
            final_price?: number;
            deposit_amount?: number;
            price_sent_at?: string;
            price_confirmed_at?: string;
          };
          
          const wasJustConfirmed = booking.status === 'pending' && newData.status === 'confirmed';
          const wasDriverJustAssigned = !booking.driverName && newData.driver_name;
          const wasMessageJustSent = !booking.driverMessageSent && newData.driver_message_sent;
          
          // Tour-specific payment events
          const wasDepositJustPaid = booking.paymentStatus !== 'deposit_paid' && newData.payment_status === 'deposit_paid';
          const wasPriceJustConfirmed = !booking.priceConfirmedAt && newData.price_confirmed_at;
          const wasPriceJustSent = !booking.priceSentAt && newData.price_sent_at;
          const wasFullyPaid = booking.paymentStatus !== 'paid' && newData.payment_status === 'paid';
          
          setBooking(prev => prev ? {
            ...prev,
            driverName: newData.driver_name ?? prev.driverName,
            driverPhone: newData.driver_phone ?? prev.driverPhone,
            driverLanguage: newData.driver_language ?? prev.driverLanguage,
            driverMessageSent: newData.driver_message_sent ?? prev.driverMessageSent,
            driverMessageSentAt: newData.driver_message_sent_at ?? prev.driverMessageSentAt,
            status: (newData.status as 'pending' | 'confirmed' | 'cancelled') ?? prev.status,
            paymentStatus: (newData.payment_status as 'pending' | 'paid' | 'deposit_paid' | 'cash' | 'failed' | 'refunded') ?? prev.paymentStatus,
            paymentType: (newData.payment_type as 'deposit' | 'full' | 'cash') ?? prev.paymentType,
            paymentAmount: newData.payment_amount ?? prev.paymentAmount,
            paidAt: newData.paid_at ?? prev.paidAt,
            finalPrice: newData.final_price ?? prev.finalPrice,
            depositAmount: newData.deposit_amount ?? prev.depositAmount,
            priceSentAt: newData.price_sent_at ?? prev.priceSentAt,
            priceConfirmedAt: newData.price_confirmed_at ?? prev.priceConfirmedAt,
          } : null);
          
          // Tour payment toasts
          if (isTourBooking && wasPriceJustSent && newData.final_price) {
            toast({
              title: language === 'gr' ? '💰 Τιμή Διαθέσιμη!' : '💰 Price Available!',
              description: language === 'gr' 
                ? `Η τιμή της εκδρομής σας είναι €${newData.final_price}. Ελέγξτε το email σας.`
                : `Your tour price is €${newData.final_price}. Check your email.`,
            });
          }
          
          if (isTourBooking && wasPriceJustConfirmed) {
            toast({
              title: language === 'gr' ? '✅ Τιμή Επιβεβαιώθηκε!' : '✅ Price Confirmed!',
              description: language === 'gr' 
                ? 'Η τιμή επιβεβαιώθηκε. Πληρώστε την προκαταβολή για κλείσιμο.'
                : 'Price confirmed. Pay the deposit to secure your booking.',
            });
          }
          
          if (isTourBooking && wasDepositJustPaid) {
            toast({
              title: language === 'gr' ? '🎉 Προκαταβολή Πληρώθηκε!' : '🎉 Deposit Paid!',
              description: language === 'gr' 
                ? 'Η εκδρομή σας είναι επιβεβαιωμένη!'
                : 'Your tour is confirmed!',
            });
          }
          
          if (wasFullyPaid) {
            toast({
              title: language === 'gr' ? '✅ Πλήρης Πληρωμή!' : '✅ Fully Paid!',
              description: language === 'gr' 
                ? 'Η πληρωμή ολοκληρώθηκε επιτυχώς.'
                : 'Payment completed successfully.',
            });
          }
          
          if (wasJustConfirmed) {
            toast({
              title: language === 'gr' ? '✅ Κράτηση Επιβεβαιώθηκε!' : '✅ Booking Confirmed!',
              description: language === 'gr' 
                ? 'Η κράτησή σας επιβεβαιώθηκε επιτυχώς.'
                : 'Your booking has been confirmed successfully.',
            });
          }
          
          if (wasDriverJustAssigned) {
            toast({
              title: language === 'gr' ? '🚗 Οδηγός Ανατέθηκε!' : '🚗 Driver Assigned!',
              description: language === 'gr' 
                ? `Ο ${newData.driver_name?.split(' ')[0]} θα είναι ο οδηγός σας.`
                : `${newData.driver_name?.split(' ')[0]} will be your driver.`,
            });
          }
          
          if (wasMessageJustSent) {
            toast({
              title: language === 'gr' ? '📱 Οδηγός Ενημερώθηκε' : '📱 Driver Notified',
              description: language === 'gr' 
                ? 'Ο οδηγός σας έλαβε τα στοιχεία της κράτησης.'
                : 'Your driver has received the booking details.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking?.bookingId, booking?.driverName, booking?.driverMessageSent, booking?.status, language, isTourBooking]);

  // Check if trip is completed (pickup time + 2 hours passed)
  const isTripCompleted = useMemo(() => {
    if (!booking) return false;
    const pickupDate = parsePickupDateTime(booking.date, booking.time);
    if (!pickupDate) return false;
    const completedTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000);
    return new Date() > completedTime;
  }, [booking]);

  // Find fixed price for rebook
  const rebookPriceInfo = useMemo(() => {
    if (!booking) return null;
    
    const pickupLower = booking.pickup.toLowerCase();
    const dropoffLower = booking.dropoff.toLowerCase();
    
    const matchedRoute = routes.find(route => {
      const fromLower = route.from.toLowerCase();
      const toLower = route.to.toLowerCase();
      return (
        (pickupLower.includes(fromLower) || fromLower.includes(pickupLower)) &&
        (dropoffLower.includes(toLower) || toLower.includes(dropoffLower))
      ) || (
        (pickupLower.includes(toLower) || toLower.includes(pickupLower)) &&
        (dropoffLower.includes(fromLower) || fromLower.includes(dropoffLower))
      );
    });
    
    if (matchedRoute?.hasFixedPrice && matchedRoute.fixedPriceFrom) {
      return { isFixed: true, price: `€${matchedRoute.fixedPriceFrom}` };
    }
    return { isFixed: false, price: null };
  }, [booking]);

  // Handle rebook same trip
  const handleRebookSameTrip = () => {
    if (!booking) return;
    
    setQuoteData({
      pickup: booking.pickup,
      dropoff: booking.dropoff,
      date: "",
      time: "",
      passengers: booking.passengers,
      luggage: booking.luggage || "medium",
      vehicleType: booking.vehicleType,
      childSeat: typeof booking.childSeat === 'number' ? booking.childSeat : (booking.childSeat ? 1 : 0),
      extraStop: booking.extraStop || false,
      meetGreet: booking.meetGreet || true,
      extraHour: false,
      coolerWaters: false,
      bookingType: booking.bookingType === 'tour' ? 'tour' : (booking.isAirportRoute ? 'airport' : 'standard'),
    });
    
    trackEvent('rebook_same_trip' as any, {
      pickup: booking.pickup,
      dropoff: booking.dropoff,
    });
    
    navigate('/#quote');
  };

  // Fetch booking from backend by token
  const fetchBookingByToken = async (token: string, verifyPhone?: string, verifyLastName?: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('get-booking-by-token', {
        body: { token, verifyPhone, verifyLastName }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      if (!data.booking) throw new Error('Booking not found');

      // Set the booking type from response
      const responseType = data.type || 'transfer';
      setBookingType(responseType);

      // Build booking data based on type
      const bookingData: BookingData = responseType === 'tour' ? {
        // Tour request data
        bookingId: data.booking.bookingId,
        pickup: data.booking.pickupArea || '',
        dropoff: data.booking.itineraryTitle || '',
        date: data.booking.preferredDate || '',
        time: data.booking.preferredTime || '',
        passengers: data.booking.groupSize || '',
        luggage: '',
        vehicleType: '',
        childSeat: 0,
        extraStop: false,
        meetGreet: false,
        customerName: data.booking.customerName || '',
        customerEmail: data.booking.customerEmail || '',
        customerPhone: data.booking.customerPhone,
        isAirportRoute: false,
        isPortRoute: false,
        bookingType: 'tour',
        status: data.booking.status,
        createdAt: data.booking.createdAt,
        driverName: data.booking.driverName,
        driverPhone: data.booking.driverPhone,
        driverLanguage: data.booking.driverLanguage,
        driverMessageSent: data.booking.driverMessageSent || false,
        driverMessageSentAt: data.booking.driverMessageSentAt,
        paymentStatus: data.booking.paymentStatus,
        paymentType: data.booking.paymentType,
        paymentAmount: data.booking.finalPrice || data.booking.estimatedTotal,
        paidAt: data.booking.paidAt,
        // Tour-specific
        tourVibe: data.booking.tourVibe,
        itineraryTitle: data.booking.itineraryTitle,
        pickupArea: data.booking.pickupArea,
        duration: data.booking.duration,
        groupSize: data.booking.groupSize,
        preferredDate: data.booking.preferredDate,
        preferredTime: data.booking.preferredTime,
        addons: data.booking.addons,
        notes: data.booking.notes,
        estimatedTotal: data.booking.estimatedTotal,
        finalPrice: data.booking.finalPrice,
        depositAmount: data.booking.depositAmount,
        priceSentAt: data.booking.priceSentAt,
        priceConfirmedAt: data.booking.priceConfirmedAt,
      } : {
        // Transfer booking data
        bookingId: data.booking.bookingId,
        pickup: data.booking.pickup,
        dropoff: data.booking.dropoff,
        date: data.booking.date,
        time: data.booking.time,
        passengers: data.booking.passengers,
        luggage: data.booking.luggage || '',
        vehicleType: data.booking.vehicleType,
        childSeat: data.booking.childSeat || 0,
        extraStop: data.booking.extraStop || false,
        meetGreet: data.booking.meetGreet || false,
        customerName: data.booking.customerName,
        customerEmail: data.booking.customerEmail,
        customerPhone: data.booking.customerPhone,
        isAirportRoute: data.booking.isAirportRoute || false,
        isPortRoute: data.booking.isPortRoute || false,
        bookingType: 'transfer',
        status: data.booking.status,
        createdAt: data.booking.createdAt,
        driverName: data.booking.driverName,
        driverPhone: data.booking.driverPhone,
        driverLanguage: data.booking.driverLanguage,
        driverMessageSent: data.booking.driverMessageSent || false,
        driverMessageSentAt: data.booking.driverMessageSentAt,
        paymentStatus: data.booking.paymentStatus,
        paymentType: data.booking.paymentType,
        paymentAmount: data.booking.paymentAmount,
        totalAmount: data.booking.totalAmount,
        depositPaid: data.booking.depositPaid,
        paidAt: data.booking.paidAt,
      };

      saveBooking(bookingData);
      return bookingData;
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadBooking = async () => {
      const token = searchParams.get('token');
      if (token) {
        const history = getBookingHistory();
        const localBooking = history.find(b => b.bookingId === token);
        if (localBooking) {
          setBooking(localBooking);
          trackEvent('trip_hub_open' as any, { source: 'token_local' });
          return;
        }

        try {
          const fetchedBooking = await fetchBookingByToken(token);
          setBooking(fetchedBooking);
          trackEvent('trip_hub_open' as any, { source: 'token_backend' });
          return;
        } catch (err) {
          console.log('Could not fetch booking from backend, showing find form');
          setFindBookingId(token);
        }
      }

      const lastBooking = getLastBooking();
      if (lastBooking) {
        setBooking(lastBooking);
        trackEvent('trip_hub_open' as any, { source: 'localStorage' });
      } else {
        setShowFindTrip(true);
        trackEvent('trip_find_view' as any);
      }
    };

    loadBooking();
  }, [searchParams]);

  const handleFindTrip = async () => {
    trackEvent('trip_find_submit' as any);
    setFindError('');

    if (!findBookingId.trim()) {
      setFindError(t.tripHub.pleaseEnterBookingId);
      return;
    }

    const history = getBookingHistory();
    const localBooking = history.find(b => {
      const matchesId = b.bookingId.toLowerCase() === findBookingId.trim().toLowerCase();
      if (!findIdentifier.trim()) return matchesId;
      
      const identifier = findIdentifier.trim().toLowerCase();
      const matchesPhone = b.customerPhone?.toLowerCase().includes(identifier);
      const matchesName = b.customerName.toLowerCase().includes(identifier);
      return matchesId && (matchesPhone || matchesName);
    });

    if (localBooking) {
      setBooking(localBooking);
      setShowFindTrip(false);
      trackEvent('trip_hub_open' as any, { source: 'search_local' });
      return;
    }

    try {
      const fetchedBooking = await fetchBookingByToken(
        findBookingId.trim(),
        findIdentifier.trim() || undefined,
        findIdentifier.trim() || undefined
      );
      setBooking(fetchedBooking);
      setShowFindTrip(false);
      trackEvent('trip_hub_open' as any, { source: 'search_backend' });
    } catch (err: any) {
      setFindError(err.message || 'No trip found. Use the Trip Hub link from your WhatsApp or email confirmation.');
      trackEvent('trip_find_fail' as any);
    }
  };

  const handleWhatsAppOpen = () => {
    if (!booking) return;
    trackEvent('trip_hub_whatsapp_click' as any);
    window.open(getWhatsAppLink(generateBookingWhatsAppMessage(booking)), '_blank');
  };

  const handleReturnTripClick = () => {
    trackEvent('trip_hub_return_trip_click' as any);
    setShowReturnModal(true);
  };

  const handleChangeRequest = (type: 'time' | 'stop' | 'seat' | 'meetingpoint' | 'tour') => {
    if (!booking) return;
    trackEvent('whatsapp_quick_action_click' as any, { ctaType: type });
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

  const handleConfirmPrice = async () => {
    if (!booking?.bookingId) return;
    
    setIsLoading(true);
    try {
      const tableName = isTourBooking ? 'tour_requests' : 'bookings';
      const idColumn = isTourBooking ? 'request_id' : 'booking_id';
      const updateData = isTourBooking 
        ? { price_confirmed_at: new Date().toISOString(), status: 'awaiting_confirmation' }
        : { status: 'confirmed', confirmed_at: new Date().toISOString() };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(idColumn, booking.bookingId);

      if (error) throw error;

      toast({
        title: language === 'gr' ? '✅ Επιτυχία!' : '✅ Success!',
        description: language === 'gr' 
          ? 'Η τιμή επιβεβαιώθηκε. Σας ευχαριστούμε!' 
          : 'Price confirmed. Thank you!',
      });

      trackEvent('price_confirmed_by_customer' as any, { bookingId: booking.bookingId });
      
      // Refresh booking data
      const token = searchParams.get('token') || booking.bookingId;
      const refreshed = await fetchBookingByToken(token);
      setBooking(refreshed);
    } catch (err: any) {
      console.error('Error confirming price:', err);
      toast({
        title: language === 'gr' ? '❌ Σφάλμα' : '❌ Error',
        description: language === 'gr' ? 'Αποτυχία επιβεβαίωσης τιμής' : 'Failed to confirm price',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFeedback = () => {
    if (!booking) return;
    trackEvent('trip_hub_feedback_click' as any);
    const message = language === 'gr' 
      ? `Γεια σας LIV Tours! 👋 Μόλις ολοκλήρωσα το δρομολόγιό μου (${booking.bookingId}) και θα ήθελα να σας πω ότι...`
      : `Hi LIV Tours! 👋 I just finished my trip (${booking.bookingId}) and I wanted to say...`;
    window.open(getWhatsAppLink(message), '_blank');
  };

  // Fetch published tours from database
  const { data: publishedTours = [] } = usePublishedTours();
  
  // Get relevant tour recommendations based on booking region
  const recommendedTours = useMemo(() => {
    if (publishedTours.length === 0) return [];
    
    const location = booking ? (booking.pickup + ' ' + booking.dropoff).toLowerCase() : '';
    
    const regionKeywords: Record<string, string[]> = {
      'Chania': ['chania', 'χανιά', 'platanias', 'πλατανιάς', 'agia marina', 'αγία μαρίνα', 'kissamos', 'κίσσαμος'],
      'Rethymno': ['rethymno', 'ρέθυμνο', 'bali', 'μπάλι', 'panormo', 'πάνορμο'],
      'Heraklion': ['heraklion', 'ηράκλειο', 'hersonissos', 'χερσόνησος', 'malia', 'μάλια'],
      'Lasithi': ['lasithi', 'λασίθι', 'agios nikolaos', 'άγιος νικόλαος', 'elounda', 'ελούντα']
    };
    
    let detectedRegion: string | null = null;
    for (const [region, keywords] of Object.entries(regionKeywords)) {
      if (keywords.some(kw => location.includes(kw))) {
        detectedRegion = region;
        break;
      }
    }
    
    const scoredTours = publishedTours.map(tour => {
      let score = tour.popular_score || 0;
      if (detectedRegion && tour.region === detectedRegion) score += 50;
      if (booking && parseInt(booking.passengers) >= 3 && tour.best_for.includes('Families')) score += 20;
      if (booking && booking.passengers === '2' && tour.best_for.includes('Couples')) score += 15;
      return { tour, score };
    });
    
    return scoredTours
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ tour }) => tour);
  }, [publishedTours, booking]);

  // Find your trip screen
  if (showFindTrip && !booking) {
    return (
      <Layout>
        <SEOHead
          title="Find Your Trip | LIV Tours"
          description="Access your booking details and trip information."
          noindex={true}
        />

        <section className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-1">
                  {t.tripHub.findYourTrip}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t.tripHub.enterBookingDetails}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bookingId" className="text-sm">{t.tripHub.bookingId}</Label>
                  <Input
                    id="bookingId"
                    placeholder="LIV-XXXXXX"
                    value={findBookingId}
                    onChange={(e) => setFindBookingId(e.target.value.toUpperCase())}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="identifier" className="text-sm">{t.tripHub.phoneOrLastName}</Label>
                  <Input
                    id="identifier"
                    placeholder={t.tripHub.forVerification}
                    value={findIdentifier}
                    onChange={(e) => setFindIdentifier(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {findError && (
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                    {findError}
                  </div>
                )}

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleFindTrip}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {isLoading ? t.tripHub.searching : t.tripHub.findTrip}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  {t.tripHub.noSavedTrips}
                </p>
                <a 
                  href={getWhatsAppLink("Hi! I need help accessing my booking. Can you send me my Trip Hub link?")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="whatsapp" size="lg" className="w-full">
                    <MessageCircle className="w-5 h-5" />
                    {t.tripHub.openWhatsAppChat}
                  </Button>
                </a>
              </div>

              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-accent hover:underline">
                  {t.tripHub.bookNewTransfer}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Empty state
  if (!booking) {
    return (
      <Layout>
        <SEOHead
          title="Your Trip Hub | LIV Tours"
          description="View your booking details, quick actions, and recommendations."
          noindex={true}
        />

        <section className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              {t.tripHub.noTripsYet}
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {t.tripHub.getQuoteIn10Seconds}
            </p>
            <Link to="/">
              <Button variant="hero" size="lg">
                Get a Quote
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Your Trip Hub | LIV Tours"
        description="View your booking details, quick actions, and recommendations."
        noindex={true}
      />

      <div className="min-h-screen bg-muted/30">
        {/* Compact Header */}
        <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trip Hub</p>
                <p className="font-semibold text-foreground text-sm">{booking.bookingId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setShowSaveModal(true)}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <HomeIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Welcome + Status */}
        <section className="px-4 pt-6 pb-4">
          <div className="max-w-lg mx-auto">
            {/* Welcome */}
            <div className="text-center mb-5">
              <p className="text-lg font-semibold text-foreground">
                {language === 'gr' ? 'Γεια σου,' : 'Hey,'} {booking.customerName?.split(' ')[0] || 'Guest'}! 👋
              </p>
              <p className="text-sm text-muted-foreground">
                {isTourBooking 
                  ? (language === 'gr' ? 'Εδώ είναι η εκδρομή σου' : 'Here\'s your tour')
                  : (language === 'gr' ? 'Εδώ είναι η κράτησή σου' : 'Here\'s your booking')
                }
              </p>
            </div>

            {/* Status Timeline */}
            <TripStatusTimeline 
              status={booking.status} 
              driverAssigned={!!booking.driverName}
              isTour={isTourBooking}
            />
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 pb-6">
          <div className="max-w-lg mx-auto space-y-4">
            {/* Booking Pass - Different UI for tours vs transfers */}
            {isTourBooking ? (
              <TourBookingPass booking={booking} />
            ) : (
              <BookingPass booking={booking} />
            )}

            {/* Loyalty Badge - Compact */}
            <LoyaltyBadge 
              variant="banner" 
              customerEmail={booking.customerEmail}
            />

            {/* Driver Status */}
            <DriverStatusCard
              driverAssigned={!!booking.driverName}
              driverName={booking.driverName}
              driverPhone={booking.driverPhone}
              driverLanguage={booking.driverLanguage}
              driverMessageSent={booking.driverMessageSent}
            />

            {/* Payment Status - Different for tours vs transfers */}
            {isTourBooking ? (
              <TourPaymentStatusCard
                paymentStatus={booking.paymentStatus as any}
                paymentType={booking.paymentType}
                depositAmount={booking.depositAmount}
                finalPrice={booking.finalPrice}
                paidAt={booking.paidAt}
                priceConfirmedAt={booking.priceConfirmedAt}
                requestId={booking.bookingId}
                onConfirmPrice={handleConfirmPrice}
              />
            ) : (
              <PaymentStatusCard
                paymentStatus={booking.paymentStatus as any}
                paymentType={booking.paymentType}
                paymentAmount={booking.paymentAmount}
                paidAt={booking.paidAt}
              />
            )}

            {/* Tour Refreshments Reminder */}
            {booking.bookingType === 'tour' && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-olive/10 border border-olive/20">
                <Apple className="w-5 h-5 text-olive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  {t.tripHub.tourRefreshments}
                </p>
              </div>
            )}
            
            {/* Pickup Reminder Notification */}
            {(() => {
              const pickupTime = parsePickupDateTime(booking.date, booking.time);
              if (pickupTime) {
                return (
                  <NotificationToggle
                    bookingId={booking.bookingId}
                    pickupTime={pickupTime}
                    pickupLocation={booking.pickup}
                  />
                );
              }
              return null;
            })()}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="px-4 py-6 bg-card border-t border-border">
          <div className="max-w-lg mx-auto">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {t.tripHub.quickActions}
            </h2>
            
            {/* Primary Actions */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Button 
                variant="whatsapp" 
                className="flex-col h-auto py-3 text-xs"
                onClick={handleWhatsAppOpen}
              >
                <MessageCircle className="w-5 h-5 mb-1" />
                {t.tripHub.whatsApp}
              </Button>
              
              <a 
                href={getGoogleMapsLink(booking.pickup, booking.dropoff)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full flex-col h-auto py-3 text-xs">
                  <Map className="w-5 h-5 mb-1" />
                  {t.tripHub.viewMap}
                </Button>
              </a>

              <Button 
                variant="outline" 
                className="flex-col h-auto py-3 text-xs"
                onClick={() => downloadCalendarFile(booking)}
              >
                <Calendar className="w-5 h-5 mb-1" />
                {t.tripHub.calendar}
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-5 gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-col h-auto py-2 text-[10px]"
                onClick={() => handleChangeRequest('time')}
              >
                <Clock className="w-4 h-4 mb-0.5" />
                Time
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-col h-auto py-2 text-[10px]"
                onClick={() => handleChangeRequest('stop')}
              >
                <MapPinPlus className="w-4 h-4 mb-0.5" />
                Stop
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-col h-auto py-2 text-[10px]"
                onClick={() => handleChangeRequest('seat')}
              >
                <Baby className="w-4 h-4 mb-0.5" />
                Seat
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-col h-auto py-2 text-[10px]"
                onClick={() => handleChangeRequest('meetingpoint')}
              >
                <HelpCircle className="w-4 h-4 mb-0.5" />
                Meet
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-col h-auto py-2 text-[10px]"
                onClick={() => handleChangeRequest('tour')}
              >
                <Compass className="w-4 h-4 mb-0.5" />
                Tour
              </Button>
            </div>
          </div>
        </section>

        {/* Return Trip CTA */}
        <section className="px-4 py-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border p-5 text-center">
              <ArrowLeftRight className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                {t.tripHub.bookYourReturnTrip}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {booking.dropoff} → {booking.pickup}
              </p>
              <Button variant="hero" onClick={handleReturnTripClick}>
                {t.tripHub.bookIn10Seconds}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* One Tap Rebook */}
        <section className="px-4 pb-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isTripCompleted
                      ? (language === 'gr' ? 'Κράτηση ξανά' : 'Book again')
                      : (language === 'gr' ? 'Επόμενη επίσκεψη;' : 'Next visit?')
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rebookPriceInfo?.isFixed 
                      ? `${language === 'gr' ? 'Από' : 'From'} ${rebookPriceInfo.price}`
                      : (language === 'gr' ? 'Άμεση προσφορά' : 'Instant quote')}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleRebookSameTrip}>
                {language === 'gr' ? 'Κράτηση' : 'Rebook'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Packing Tips */}
        <section className="px-4 pb-6">
          <div className="max-w-lg mx-auto">
            <TripPackingTips 
              bookingType={booking.bookingType || 'transfer'} 
              isBeachDestination={
                (booking.pickup + booking.dropoff).toLowerCase().includes('beach') ||
                (booking.pickup + booking.dropoff).toLowerCase().includes('balos') ||
                (booking.pickup + booking.dropoff).toLowerCase().includes('elafonisi')
              }
            />
          </div>
        </section>

        {/* Recommended Tours */}
        {recommendedTours.length > 0 && (
          <section className="px-4 py-6 bg-card border-t border-border">
            <div className="max-w-lg mx-auto">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                {t.tripHub.recommendedTours}
              </h2>
              <div className="space-y-3">
                {recommendedTours.map((tour) => (
                  <Link 
                    key={tour.id} 
                    to={`/tours/${tour.slug}`}
                    className="block bg-muted/50 rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    <div className="flex">
                      <div className="w-24 h-24 flex-shrink-0 bg-muted">
                        {tour.images?.cover_url ? (
                          <img 
                            src={tour.images.cover_url} 
                            alt={tour.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex gap-1 mb-1">
                            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-medium rounded">
                              {tour.time_type}
                            </span>
                            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded">
                              {tour.region}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground text-sm leading-tight">
                            {tour.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          {tour.price_from_eur ? (
                            <span className="text-sm font-bold text-accent">
                              €{tour.price_from_eur}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {tour.duration_hours}h
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Link to="/tours/browse" className="block mt-3">
                <Button variant="ghost" size="sm" className="w-full text-accent">
                  Browse all tours
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Review Card */}
        <section className="px-4 py-6">
          <div className="max-w-lg mx-auto">
            {isTripCompleted ? (
              <TripHubReviewCard />
            ) : (
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <Star className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t.tripHub.leaveReviewAfterTrip}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {booking && (
        <ReturnTripModal 
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          originalBooking={booking}
        />
      )}

      <SaveTripHubModal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </Layout>
  );
};

export default TripHub;

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Baby, 
  MapPinPlus, 
  UserCheck,
  QrCode,
  Plane,
  Timer,
  Bell,
  CheckCircle2,
  Phone,
  MessageCircle,
  Scissors,
  CreditCard,
  Banknote,
  CircleDollarSign,
  AlertCircle
} from "lucide-react";
import { BookingData } from "@/lib/booking";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Confetti from "@/components/Confetti";

interface PaymentInfo {
  payment_status: string | null;
  payment_type: string | null;
  payment_amount: number | null;
  total_amount: number | null;
  deposit_paid: number | null;
}

interface BookingPassProps {
  booking: BookingData;
}

// Parse booking date and time to create a Date object
const parsePickupDateTime = (dateStr: string, timeStr: string): Date | null => {
  try {
    const months: Record<string, number> = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
      'ιαν': 0, 'φεβ': 1, 'μαρ': 2, 'απρ': 3, 'μαι': 4, 'ιουν': 5,
      'ιουλ': 6, 'αυγ': 7, 'σεπ': 8, 'οκτ': 9, 'νοε': 10, 'δεκ': 11
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

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  totalMinutes: number;
}

const BookingPass = ({ booking }: BookingPassProps) => {
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState<CountdownValues | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>(booking.status);
  const [driverInfo, setDriverInfo] = useState<{ name?: string; phone?: string } | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasNotifiedRef = useRef(false);
  const notificationKeyRef = useRef<string>('');
  const hasShownConfirmationRef = useRef(false);

  const pickupDate = useMemo(() => 
    parsePickupDateTime(booking.date, booking.time),
    [booking.date, booking.time]
  );

  // Fetch live status, driver info and payment info from database and subscribe to updates
  useEffect(() => {
    const fetchBookingData = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('status, driver_name, driver_phone, payment_status, payment_type, payment_amount, total_amount, deposit_paid')
        .eq('booking_id', booking.bookingId)
        .maybeSingle();
      
      if (data) {
        setLiveStatus(data.status);
        if (data.driver_name || data.driver_phone) {
          setDriverInfo({ name: data.driver_name, phone: data.driver_phone });
        }
        setPaymentInfo({
          payment_status: data.payment_status,
          payment_type: data.payment_type,
          payment_amount: data.payment_amount,
          total_amount: data.total_amount,
          deposit_paid: data.deposit_paid,
        });
      }
    };

    fetchBookingData();

    const channel = supabase
      .channel(`booking-${booking.bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `booking_id=eq.${booking.bookingId}`
        },
        (payload) => {
          const newData = payload.new as { 
            status: string; 
            driver_name?: string; 
            driver_phone?: string;
            payment_status?: string;
            payment_type?: string;
            payment_amount?: number;
            total_amount?: number;
            deposit_paid?: number;
          };
          setLiveStatus(newData.status);
          
          if (newData.driver_name || newData.driver_phone) {
            setDriverInfo({ name: newData.driver_name, phone: newData.driver_phone });
          }
          
          // Update payment info
          setPaymentInfo({
            payment_status: newData.payment_status || null,
            payment_type: newData.payment_type || null,
            payment_amount: newData.payment_amount || null,
            total_amount: newData.total_amount || null,
            deposit_paid: newData.deposit_paid || null,
          });
          
          if (newData.status === 'confirmed' && !hasShownConfirmationRef.current) {
            hasShownConfirmationRef.current = true;
            setShowConfetti(true);
            
            if ('vibrate' in navigator) {
              navigator.vibrate([100, 50, 100, 50, 200]);
            }
            
            toast({
              title: language === 'gr' ? '🎉 Επιβεβαιώθηκε!' : '🎉 Confirmed!',
              description: language === 'gr' 
                ? 'Η κράτησή σας επιβεβαιώθηκε από τον οδηγό.' 
                : 'Your booking has been confirmed by the driver.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.bookingId, language]);

  const triggerNotification = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification not available');
    }

    toast({
      title: language === 'gr' ? '⏰ 1 ώρα για το pickup!' : '⏰ 1 hour until pickup!',
      description: language === 'gr' 
        ? `Η μεταφορά σας ξεκινά σε 1 ώρα. Ετοιμαστείτε!` 
        : `Your transfer starts in 1 hour. Get ready!`,
    });
  }, [language]);

  useEffect(() => {
    if (!pickupDate) return;

    const notificationKey = `notified_1h_${booking.bookingId}`;
    notificationKeyRef.current = notificationKey;
    hasNotifiedRef.current = localStorage.getItem(notificationKey) === 'true';

    const updateCountdown = () => {
      const now = new Date();
      const diff = pickupDate.getTime() - now.getTime();
      
      const isPast = diff < 0;
      const absDiff = Math.abs(diff);
      
      const totalMinutes = Math.floor(diff / (1000 * 60));
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const isToday = pickupDate.toDateString() === today.toDateString();
      const isTomorrow = pickupDate.toDateString() === tomorrow.toDateString();
      
      if (!isPast && totalMinutes <= 60 && totalMinutes >= 59 && !hasNotifiedRef.current) {
        hasNotifiedRef.current = true;
        localStorage.setItem(notificationKeyRef.current, 'true');
        triggerNotification();
      }
      
      setCountdown({ days, hours, minutes, seconds, isPast, isToday, isTomorrow, totalMinutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pickupDate, booking.bookingId, triggerNotification]);

  // Parse date for display
  const dateParts = booking.date.split(' ');
  const dayNum = dateParts[0] || '';
  const monthName = dateParts[1] || '';
  const year = dateParts[2] || '';

  return (
    <>
      {showConfetti && <Confetti />}
      
      {/* Ticket Container */}
      <div className="max-w-md mx-auto animate-fade-in">
        {/* Main Ticket Body */}
        <div className="relative bg-card rounded-t-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-border/30">
          
          {/* Ticket Header - Type Badge */}
          <div className="bg-gradient-to-br from-primary via-primary to-primary/95 px-6 pt-6 pb-8 relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
              }} />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 text-center">
              {/* Transfer Type */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-foreground mb-4">
                {booking.isAirportRoute && <Plane className="w-3.5 h-3.5" />}
                <span>{booking.isAirportRoute ? 'Airport Transfer' : 'Private Transfer'}</span>
              </div>
              
              {/* Booking ID - Large */}
              <p className="text-primary-foreground/50 text-[10px] uppercase tracking-[0.2em] mb-1">Booking ID</p>
              <p className="text-4xl font-bold text-primary-foreground tracking-[0.1em] font-mono">{booking.bookingId}</p>
            </div>
          </div>

          {/* Countdown Banner */}
          {countdown && !countdown.isPast && (
            <div className={`mx-4 -mt-4 relative z-10 p-4 rounded-xl ${
              countdown.days === 0 
                ? 'bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-lg shadow-accent/20' 
                : 'bg-gradient-to-r from-muted to-muted/80 text-foreground border border-border'
            }`}>
              <div className="flex items-center justify-center gap-3">
                <Timer className="w-5 h-5" />
                <span className="text-base font-bold">
                  {countdown.days > 0 
                    ? (language === 'gr' 
                        ? `Σε ${countdown.days} ${countdown.days === 1 ? 'μέρα' : 'μέρες'}` 
                        : `In ${countdown.days} ${countdown.days === 1 ? 'day' : 'days'}`)
                    : (language === 'gr' 
                        ? `Παραλαβή σε ${countdown.hours}h ${countdown.minutes}m` 
                        : `Pickup in ${countdown.hours}h ${countdown.minutes}m`)
                  }
                </span>
              </div>
            </div>
          )}

          {/* Route Section - Ticket Style */}
          <div className="px-6 py-5">
            <div className="flex gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center pt-1">
                <div className="w-4 h-4 rounded-full bg-accent border-[3px] border-accent/30" />
                <div className="w-0.5 flex-1 min-h-[40px] bg-gradient-to-b from-accent via-muted-foreground/30 to-primary" />
                <div className="w-4 h-4 rounded-full bg-primary border-[3px] border-primary/30" />
              </div>
              
              {/* Locations */}
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-[10px] text-accent font-semibold uppercase tracking-wider mb-0.5">
                    {language === 'gr' ? 'Από' : 'From'}
                  </p>
                  <p className="font-bold text-foreground text-lg leading-tight">{booking.pickup}</p>
                </div>
                <div>
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-0.5">
                    {language === 'gr' ? 'Προς' : 'To'}
                  </p>
                  <p className="font-bold text-foreground text-lg leading-tight">{booking.dropoff}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Line with Circles */}
          <div className="relative h-8 flex items-center">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-background rounded-r-full border-r border-t border-b border-border/50" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-background rounded-l-full border-l border-t border-b border-border/50" />
            <div className="flex-1 mx-6 border-t-2 border-dashed border-muted-foreground/30" />
          </div>

          {/* Details Section - Horizontal Layout */}
          <div className="px-6 pb-5">
            {/* Date & Time - Big Display */}
            <div className="flex items-stretch gap-3 mb-4">
              {/* Date Block */}
              <div className="flex-1 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-4 text-center border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  {language === 'gr' ? 'Ημερομηνία' : 'Date'}
                </p>
                <p className="text-3xl font-bold text-foreground leading-none">{dayNum}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{monthName} {year}</p>
              </div>
              
              {/* Time Block */}
              <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 text-center border border-primary/20">
                <p className="text-[10px] text-primary/70 uppercase tracking-wider mb-1">
                  {language === 'gr' ? 'Ώρα' : 'Time'}
                </p>
                <p className="text-3xl font-bold text-primary leading-none">{booking.time}</p>
                <p className="text-sm font-medium text-primary/60 mt-1">
                  {language === 'gr' ? 'Παραλαβή' : 'Pickup'}
                </p>
              </div>
            </div>

            {/* Passengers & Vehicle - Compact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/50">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    {language === 'gr' ? 'Επιβάτες' : 'Passengers'}
                  </p>
                  <p className="text-base font-bold text-foreground">{booking.passengers}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm border border-border/50">
                  <Car className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    {language === 'gr' ? 'Όχημα' : 'Vehicle'}
                  </p>
                  <p className="text-base font-bold text-foreground">{booking.vehicleType}</p>
                </div>
              </div>
            </div>

            {/* Extras Tags */}
            {(booking.childSeat > 0 || booking.extraStop || booking.meetGreet) && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {booking.childSeat > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    <Baby className="w-3.5 h-3.5" />
                    {language === 'gr' ? `Παιδικά καθίσματα ×${booking.childSeat}` : `Child seat ×${booking.childSeat}`}
                  </span>
                )}
                {booking.extraStop && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    <MapPinPlus className="w-3.5 h-3.5" />
                    {language === 'gr' ? 'Στάση' : 'Extra stop'}
                  </span>
                )}
                {booking.meetGreet && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <UserCheck className="w-3.5 h-3.5" />
                    Meet & Greet
                  </span>
                )}
              </div>
            )}

            {/* Payment Status Card */}
            {paymentInfo && (
              <div className={`mt-4 p-4 rounded-xl border ${
                paymentInfo.payment_status === 'paid' 
                  ? 'bg-green-50 border-green-200' 
                  : paymentInfo.payment_type === 'cash'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {paymentInfo.payment_status === 'paid' ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  ) : paymentInfo.payment_type === 'cash' ? (
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Banknote className="w-4 h-4 text-amber-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
                      {language === 'gr' ? 'Πληρωμή' : 'Payment'}
                    </p>
                    <p className={`text-sm font-semibold ${
                      paymentInfo.payment_status === 'paid' 
                        ? 'text-green-700' 
                        : paymentInfo.payment_type === 'cash'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}>
                      {paymentInfo.payment_status === 'paid' 
                        ? (language === 'gr' ? 'Πληρώθηκε' : 'Paid')
                        : paymentInfo.payment_type === 'cash'
                        ? (language === 'gr' ? 'Πληρωμή στον οδηγό' : 'Pay driver on arrival')
                        : paymentInfo.payment_type === 'deposit'
                        ? (language === 'gr' ? 'Προκαταβολή πληρώθηκε' : 'Deposit paid')
                        : (language === 'gr' ? 'Εκκρεμεί' : 'Pending')}
                    </p>
                  </div>
                </div>
                
                {/* Amount Details */}
                {((paymentInfo.total_amount && paymentInfo.total_amount > 0) || 
                  (paymentInfo.payment_amount && paymentInfo.payment_amount > 0)) && (
                  <div className="space-y-2 pt-2 border-t border-current/10">
                    {paymentInfo.payment_type === 'deposit' && paymentInfo.payment_status === 'paid' ? (
                      <>
                        {/* Deposit paid - show exact remaining balance */}
                        {(() => {
                          const totalAmount = paymentInfo.total_amount || paymentInfo.payment_amount || 0;
                          const depositPaid = paymentInfo.deposit_paid || Math.ceil(totalAmount * 0.3);
                          const remainingBalance = totalAmount - depositPaid;
                          
                          return (
                            <>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  {language === 'gr' ? 'Συνολικό ποσό (με έκπτωση)' : 'Total (discounted)'}
                                </span>
                                <span className="font-semibold">€{totalAmount}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  {language === 'gr' ? 'Προκαταβολή' : 'Deposit paid'}
                                </span>
                                <span className="font-medium text-green-600">
                                  -€{depositPaid}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-base pt-1 border-t border-current/10">
                                <span className="font-medium">
                                  {language === 'gr' ? 'Υπόλοιπο στον οδηγό' : 'Balance due to driver'}
                                </span>
                                <span className="font-bold text-amber-600">
                                  €{remainingBalance}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    ) : paymentInfo.payment_type === 'cash' ? (
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">
                          {language === 'gr' ? 'Πληρωτέο στον οδηγό' : 'Amount due to driver'}
                        </span>
                        <span className="font-bold text-amber-600">
                          {(paymentInfo.total_amount || paymentInfo.payment_amount) 
                            ? `€${paymentInfo.total_amount || paymentInfo.payment_amount}`
                            : (language === 'gr' ? 'Αναμένει τιμή' : 'Awaiting quote')}
                        </span>
                      </div>
                    ) : paymentInfo.payment_status === 'paid' ? (
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">
                          {language === 'gr' ? 'Πληρώθηκε' : 'Amount paid'}
                        </span>
                        <span className="font-bold text-green-600">
                          €{paymentInfo.total_amount || paymentInfo.payment_amount}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Stub - Tear-off section */}
        <div className="relative">
          {/* Scissors indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-20 bg-background px-2">
            <Scissors className="w-4 h-4 text-muted-foreground/50 rotate-90" />
          </div>
          
          {/* Perforated edge */}
          <div className="h-3 bg-card border-x border-border/30 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 flex justify-between px-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-2 h-3 bg-background rounded-b-full" />
              ))}
            </div>
          </div>
          
          {/* Stub content */}
          <div className="bg-card rounded-b-3xl border border-t-0 border-border/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="p-5 flex items-center justify-between gap-4">
              {/* Status */}
              <div className="flex-1">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
                  {language === 'gr' ? 'Κατάσταση' : 'Status'}
                </p>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  liveStatus === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : liveStatus === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    liveStatus === 'confirmed' 
                      ? 'bg-green-500' 
                      : liveStatus === 'cancelled'
                      ? 'bg-red-500'
                      : 'bg-amber-500 animate-pulse'
                  }`} />
                  {liveStatus === 'confirmed' 
                    ? (language === 'gr' ? 'Επιβεβαιωμένο' : 'Confirmed')
                    : liveStatus === 'cancelled'
                    ? (language === 'gr' ? 'Ακυρωμένο' : 'Cancelled')
                    : (language === 'gr' ? 'Αναμονή' : 'Pending')}
                </span>
              </div>

              {/* QR Code placeholder */}
              <div className="text-center flex-shrink-0">
                <div className="w-16 h-16 p-2 bg-muted/50 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                  <QrCode className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="text-[8px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                  {language === 'gr' ? 'Δείξτε στον οδηγό' : 'Show driver'}
                </p>
              </div>
            </div>

            {/* Driver Card */}
            {liveStatus === 'confirmed' && driverInfo?.name && (
              <div className="mx-5 mb-5 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 font-medium uppercase tracking-wider">
                      {language === 'gr' ? 'Ο Οδηγός σας' : 'Your Driver'}
                    </p>
                    <p className="text-base font-semibold text-green-800">{driverInfo.name}</p>
                  </div>
                </div>
                
                {driverInfo.phone && (
                  <div className="flex gap-2">
                    <a
                      href={`tel:${driverInfo.phone}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {language === 'gr' ? 'Κλήση' : 'Call'}
                    </a>
                    <a
                      href={`https://wa.me/${driverInfo.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#20BD5A] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Passenger name footer */}
            <div className="bg-muted/30 px-5 py-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                {language === 'gr' ? 'Επιβάτης' : 'Passenger'}: <span className="font-semibold text-foreground">{booking.customerName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPass;

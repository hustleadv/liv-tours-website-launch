import { useState, useCallback, useEffect, useMemo, forwardRef, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  Check, 
  Clock, 
  Briefcase, 
  Car, 
  Bus,
  User,
  Phone,
  Loader2,
  Ship,
  BadgeCheck
} from "lucide-react";
import { LargeGroupContactModal } from "./LargeGroupContactModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";
import QuoteSummary from "./QuoteSummary";
import LocationAutocomplete from "./LocationAutocomplete";
import RecentRoutes from "./RecentRoutes";
import WeatherChip from "./WeatherChip";
import ContextualAddons from "./ContextualAddons";
import ReturnTripOption from "./ReturnTripOption";
import { LoyaltyBadge } from "./LoyaltyBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  BookingData, 
  generateBookingId, 
  saveBooking, 
  detectAirportRoute,
  detectPortRoute 
} from "@/lib/booking";
import { useRecentRoutes, useSmartDefaults } from "@/hooks/useSmartBooking";
import { getWeatherLocation } from "@/lib/weatherLocations";
import { useFixedPrice } from "@/hooks/useFixedPrice";
import { useAllRoutePrices } from "@/hooks/useAllRoutePrices";

interface QuoteWidgetProps {
  variant?: "inline" | "card" | "hero";
  defaultPickup?: string;
  defaultDropoff?: string;
  onDateChange?: (dateString: string) => void;
}

const QuoteWidget = forwardRef<HTMLDivElement, QuoteWidgetProps>(({ variant = "card", defaultPickup = "", defaultDropoff = "", onDateChange }, ref) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  const [hasStartedTracking, setHasStartedTracking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addRecentRoute } = useRecentRoutes();
  const { preferences, savePreferences, applyDefaults } = useSmartDefaults();
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    pickup: defaultPickup,
    dropoff: defaultDropoff,
    time: "",
    passengers: "",
    luggage: "medium",
    vehicleType: "",
    childSeat: 0, // Number of child seats
    extraStop: false,
    meetGreet: true,
    extraHour: false,
    coolerWaters: false,
    returnTrip: false,
    returnTime: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLargeGroupModal, setShowLargeGroupModal] = useState(false);

  // Apply smart defaults on mount
  useEffect(() => {
    const defaults = applyDefaults();
    if (defaults) {
      setFormData(prev => ({
        ...prev,
        passengers: defaults.passengers || prev.passengers,
        vehicleType: defaults.vehicleType || prev.vehicleType,
        luggage: defaults.luggage || prev.luggage,
        childSeat: typeof defaults.childSeat === 'number' ? defaults.childSeat : prev.childSeat,
        extraStop: defaults.extraStop ?? prev.extraStop,
        meetGreet: defaults.meetGreet ?? prev.meetGreet,
      }));
    }
  }, [applyDefaults]);

  // Update form when default values change (e.g., from URL params)
  useEffect(() => {
    if (defaultPickup || defaultDropoff) {
      setFormData(prev => ({
        ...prev,
        pickup: defaultPickup || prev.pickup,
        dropoff: defaultDropoff || prev.dropoff,
      }));
    }
  }, [defaultPickup, defaultDropoff]);

  // Listen for pre-fill events from Livy chat
  useEffect(() => {
    const handleLivyPrefill = (event: CustomEvent<any>) => {
      const { pickup, dropoff, passengers, date: prefillDate, time } = event.detail;
      
      setFormData(prev => ({
        ...prev,
        pickup: pickup || prev.pickup,
        dropoff: dropoff || prev.dropoff,
        passengers: passengers?.toString() || prev.passengers,
        time: time || prev.time,
      }));
      
      if (prefillDate) {
        setDate(new Date(prefillDate));
      }

      toast({
        title: language === 'gr' ? "Η Livy συμπλήρωσε κάποια στοιχεία!" : "Livy pre-filled some details!",
        description: language === 'gr' ? "Ελέγξτε τα παρακάτω για να συνεχίσετε." : "Check them below to continue.",
      });
    };

    window.addEventListener('livy:prefill' as any, handleLivyPrefill);
    return () => window.removeEventListener('livy:prefill' as any, handleLivyPrefill);
  }, [language]);

  // Accessibility: Announce step changes
  useEffect(() => {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      const stepLabels: Record<number, string> = {
        1: language === 'gr' ? 'Βήμα 1: Διαδρομή και ώρα' : 'Step 1: Route and time',
        2: language === 'gr' ? 'Βήμα 2: Λεπτομέρειες οχήματος και επιβατών' : 'Step 2: Vehicle and passenger details',
        3: language === 'gr' ? 'Βήμα 3: Στοιχεία επικοινωνίας και επιβεβαίωση' : 'Step 3: Contact details and confirmation',
      };
      announcer.textContent = stepLabels[step] || '';
    }
  }, [step, language]);

  // Handle recent route selection
  const handleRecentRouteSelect = useCallback((pickup: string, dropoff: string) => {
    setFormData(prev => ({ ...prev, pickup, dropoff }));
  }, []);

  const handleInputChange = useCallback((field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleFirstFocus = useCallback(() => {
    if (!hasStartedTracking) {
      trackEvent('quote_start');
      setHasStartedTracking(true);
    }
  }, [hasStartedTracking]);

  // Helper to get vehicle label
  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'taxi': return 'Mercedes E-Class (1-4)';
      case 'minivan-s': return 'Mercedes Sprinter (5-8)';
      case 'minivan': return 'Mercedes Sprinter (9-11)';
      case 'minibus': return 'Mercedes Sprinter Maxi (12-16)';
      case 'minibus-xl': return 'Mercedes Sprinter Maxi (17+)';
      default: return type;
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pickup.trim()) {
      newErrors.pickup = t.validation.required;
    }
    if (!formData.dropoff.trim()) {
      newErrors.dropoff = t.validation.required;
    }
    if (!date) {
      newErrors.date = t.validation.selectDate;
    }
    if (!formData.time) {
      newErrors.time = t.validation.selectTime;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.passengers) {
      newErrors.passengers = t.validation.minPassengers;
    }
    if (!formData.vehicleType) {
      newErrors.vehicleType = t.validation.required;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        // Save recent route
        addRecentRoute(formData.pickup, formData.dropoff);
        
        trackEvent('quote_step1_complete', {
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          date: date ? format(date, 'yyyy-MM-dd') : undefined,
          time: formData.time,
        });
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        // Save user preferences
        savePreferences({
          passengers: formData.passengers,
          vehicleType: formData.vehicleType,
          luggage: formData.luggage,
          childSeat: formData.childSeat,
          extraStop: formData.extraStop,
          meetGreet: formData.meetGreet,
        });
        
        const extras: string[] = [];
        if (formData.childSeat > 0) extras.push(`Child seat ×${formData.childSeat}`);
        if (formData.extraStop) extras.push('Extra stop');
        if (formData.meetGreet) extras.push('Meet & Greet');
        
        trackEvent('quote_complete', {
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          passengers: formData.passengers,
          vehicleType: formData.vehicleType,
          extras,
        });
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = t.validation.required;
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = t.validation.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = t.validation.invalidEmail;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmBooking = async (paymentMethod: 'online' | 'cash' = 'cash', applyDiscount: boolean = false) => {
    if (!validateStep3()) return;
    
    setIsSubmitting(true);
    
    const paymentType = paymentMethod === 'cash' ? 'cash' : 'online';
    const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'pending';
    
    // Calculate the price for payment - 5% discount for online, full price for cash
    // Only use fixed price if it exists, otherwise leave as null (no default €50)
    const hasFixedPrice = fixedPrice?.fixed_price_eur && fixedPrice.fixed_price_eur > 0;
    const fullPrice = hasFixedPrice ? fixedPrice.fixed_price_eur : null;
    const discountAmount = (applyDiscount && fullPrice) ? Math.ceil(fullPrice * 0.05) : 0; // 5% online discount
    const finalPrice = fullPrice ? fullPrice - discountAmount : null;
    
    // Create booking object
    const bookingData: BookingData = {
      bookingId: generateBookingId(),
      pickup: formData.pickup,
      dropoff: formData.dropoff,
      date: date ? format(date, 'dd MMM yyyy') : '',
      time: formData.time,
      passengers: formData.passengers,
      luggage: formData.luggage,
      vehicleType: getVehicleLabel(formData.vehicleType),
      childSeat: formData.childSeat,
      extraStop: formData.extraStop,
      meetGreet: formData.meetGreet,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || undefined,
      isAirportRoute: detectAirportRoute(formData.pickup, formData.dropoff),
      isPortRoute: detectPortRoute(formData.pickup, formData.dropoff),
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalAmount: fullPrice || undefined,
      paymentType: paymentMethod === 'cash' ? 'cash' : undefined,
      paymentStatus: 'pending',
    };
    
    try {
      // Save booking to database first
      const { error: dbError } = await supabase.from('bookings').insert({
        booking_id: bookingData.bookingId,
        pickup: formData.pickup,
        dropoff: formData.dropoff,
        date: date ? format(date, 'dd MMM yyyy') : '',
        time: formData.time,
        passengers: formData.passengers,
        luggage: formData.luggage,
        vehicle_type: getVehicleLabel(formData.vehicleType),
        child_seat: formData.childSeat,
        extra_stop: formData.extraStop,
        meet_greet: formData.meetGreet,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone || null,
        is_airport_route: detectAirportRoute(formData.pickup, formData.dropoff),
        is_port_route: detectPortRoute(formData.pickup, formData.dropoff),
        booking_type: 'transfer',
        status: 'pending',
        payment_type: paymentType,
        payment_status: paymentStatus,
        // Store both total_amount (full price) and payment_amount (what they'll pay)
        total_amount: fullPrice, // The full price before any discounts
        payment_amount: paymentMethod === 'online' ? finalPrice : fullPrice, // What they're paying (with discount if online)
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // If online payment, redirect to Stripe for full payment with 5% discount
      if (paymentMethod === 'online') {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
          body: {
            bookingId: bookingData.bookingId,
            customerEmail: formData.customerEmail,
            customerName: formData.customerName,
            amount: finalPrice, // Full payment with 5% discount applied
            bookingType: 'transfer',
            paymentType: 'online',
            pickup: formData.pickup,
            dropoff: formData.dropoff,
            date: date ? format(date, 'dd MMM yyyy') : '',
            applyDiscount,
            discountAmount,
            originalAmount: fullPrice,
            finalAmount: finalPrice,
          },
        });

        if (paymentError) {
          console.error('Payment error:', paymentError);
          throw new Error(paymentError.message || 'Failed to create payment session');
        }

        if (paymentData?.url) {
          // Open Stripe Checkout in new tab
          window.open(paymentData.url, '_blank');
          
          toast({
            title: language === 'gr' ? 'Μεταφορά στην πληρωμή...' : 'Redirecting to payment...',
            description: language === 'gr' 
              ? `Πληρώστε €${finalPrice} με 5% έκπτωση!`
              : `Pay €${finalPrice} with 5% discount!`,
          });
          
          // Still navigate to confirmation page
          setTimeout(() => {
            navigate('/booking/confirmed?payment_pending=true');
          }, 1000);
          return;
        }
      }

      // Send email notification (for cash payments)
      const { error } = await supabase.functions.invoke('send-quote-email', {
        body: {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone || undefined,
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          date: date ? format(date, 'dd MMM yyyy') : '',
          time: formData.time,
          passengers: formData.passengers,
          luggage: formData.luggage,
          vehicleType: getVehicleLabel(formData.vehicleType),
          childSeat: formData.childSeat,
          extraStop: formData.extraStop,
          meetGreet: formData.meetGreet,
          bookingId: bookingData.bookingId,
          hasFixedPrice: !!fixedPrice, // Send whether this route has a fixed price
        },
      });

      if (error) {
        console.warn('Email notification failed:', error);
        // Don't throw - booking is saved, email is secondary
      }

      // Save booking to localStorage for offline access
      saveBooking(bookingData);

      trackEvent('booking_confirmed', {
        pickup: formData.pickup,
        dropoff: formData.dropoff,
        passengers: formData.passengers,
        vehicleType: formData.vehicleType,
        paymentMethod,
      });
      
      // Save booking to localStorage for offline access
      saveBooking(bookingData);

      trackEvent('booking_confirmed', {
        pickup: formData.pickup,
        dropoff: formData.dropoff,
        passengers: formData.passengers,
        vehicleType: formData.vehicleType,
        paymentMethod,
      });
      
      toast({
        title: t.booking.bookingSubmitted,
        description: t.booking.bookingSubmittedDesc,
      });
      
      // Navigate to confirmation page
      navigate('/booking/confirmed');
    } catch (error) {
      console.error('Error sending quote:', error);
      // Still save booking and navigate even if email fails
      saveBooking(bookingData);
      toast({
        title: t.booking.bookingSubmitted,
        description: t.booking.bookingSubmittedEmailFailed,
        variant: "default",
      });
      setTimeout(() => {
        navigate('/booking/confirmed');
      }, 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for fixed price
  const { fixedPrice, isLoading: isLoadingPrice } = useFixedPrice({
    pickup: formData.pickup,
    dropoff: formData.dropoff,
    vehicleType: formData.vehicleType,
    passengers: formData.passengers,
  });

  // Fetch all route prices for displaying in vehicle selection
  const { prices: allRoutePrices, isLoading: isLoadingAllPrices } = useAllRoutePrices({
    pickup: formData.pickup,
    dropoff: formData.dropoff,
  });

  const getEstimatedPrice = () => {
    // Only show fixed prices for transfers - no estimated prices
    if (fixedPrice) {
      return `€${fixedPrice.fixed_price_eur.toFixed(0)}`;
    }
    
    // Return null if no fixed price available
    return null;
  };

  const resetForm = () => {
    setStep(1);
    setDate(undefined);
    setReturnDate(undefined);
    setFormData({
      pickup: "", dropoff: "", time: "", passengers: "", luggage: "medium",
      vehicleType: "", childSeat: 0, extraStop: false, meetGreet: true,
      extraHour: false, coolerWaters: false, returnTrip: false, returnTime: "",
      customerName: "", customerEmail: "", customerPhone: "",
    });
    setErrors({});
    setHasStartedTracking(false);
  };

  // Determine booking type based on pickup/dropoff
  const bookingType = useMemo((): 'airport' | 'standard' | 'tour' => {
    const pickupLower = formData.pickup.toLowerCase();
    const dropoffLower = formData.dropoff.toLowerCase();
    
    // Check for airport keywords
    const airportKeywords = ['airport', 'αεροδρόμιο', 'chq', 'her'];
    const isAirport = airportKeywords.some(keyword => 
      pickupLower.includes(keyword) || dropoffLower.includes(keyword)
    );
    
    if (isAirport) return 'airport';
    
    // Check for tour keywords
    const tourKeywords = ['tour', 'περιήγηση', 'excursion'];
    const isTour = tourKeywords.some(keyword => 
      pickupLower.includes(keyword) || dropoffLower.includes(keyword)
    );
    
    if (isTour) return 'tour';
    
    return 'standard';
  }, [formData.pickup, formData.dropoff]);

  // Check if this is a port route
  const isPortRoute = useMemo(() => {
    const pickupLower = formData.pickup.toLowerCase();
    const dropoffLower = formData.dropoff.toLowerCase();
    const portKeywords = ['port', 'λιμάνι', 'λιμανι', 'kissamos', 'κίσσαμος', 'souda', 'σούδα', 'ferry', 'πλοίο'];
    return portKeywords.some(keyword => 
      pickupLower.includes(keyword) || dropoffLower.includes(keyword)
    );
  }, [formData.pickup, formData.dropoff]);

  // Check if this is an airport route (arrival - from airport)
  const isAirportArrival = useMemo(() => {
    const pickupLower = formData.pickup.toLowerCase();
    const airportKeywords = ['airport', 'αεροδρόμιο', 'chq', 'her', 'heraklion airport', 'chania airport'];
    return airportKeywords.some(keyword => pickupLower.includes(keyword));
  }, [formData.pickup]);

  // Check if dropoff is an airport (for return trip - dropoff becomes pickup)
  const isAirportDropoff = useMemo(() => {
    const dropoffLower = formData.dropoff.toLowerCase();
    const airportKeywords = ['airport', 'αεροδρόμιο', 'chq', 'her', 'heraklion airport', 'chania airport'];
    return airportKeywords.some(keyword => dropoffLower.includes(keyword));
  }, [formData.dropoff]);
  
  // Show return trip option for both port and airport arrivals
  const showReturnTripOption = isPortRoute || isAirportArrival;

  // Check if destination is a beach
  const isBeachDestination = useMemo(() => {
    const dropoffLower = formData.dropoff.toLowerCase();
    const beachKeywords = ['beach', 'παραλία', 'balos', 'elafonisi', 'falassarna', 'stavros', 'seitan', 'vai', 'matala'];
    return beachKeywords.some(keyword => dropoffLower.includes(keyword));
  }, [formData.dropoff]);

  const containerClass = variant === "hero"
    ? "bg-card/95 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-large border border-border/50"
    : variant === "card"
    ? "glass-card p-6 md:p-8"
    : "bg-card rounded-2xl p-6 md:p-8 border border-border";

  return (
    <div ref={ref} className={containerClass}>
      {/* Header */}
      {step < 4 && (
        <div className="mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-primary">{t.cta.getQuote}</h3>
            <p className="text-sm text-muted-foreground">{t.microcopy.noHiddenFees}</p>
          </div>
          <LoyaltyBadge variant="inline" />
        </div>
      </div>
    )}

      {/* Progress Steps - Show for steps 1-3 */}
      {step <= 3 && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { step: 1, label: language === 'gr' ? 'Διαδρομή' : 'Route' },
            { step: 2, label: language === 'gr' ? 'Λεπτομέρειες' : 'Details' },
            { step: 3, label: language === 'gr' ? 'Επιβεβαίωση' : 'Confirm' }
          ].map((s, index) => (
            <div key={s.step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s.step
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.step ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <span className={`text-[10px] font-medium ${step >= s.step ? 'text-accent' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`w-8 md:w-12 h-0.5 mx-1 md:mx-2 transition-colors mt-[-12px] ${
                    step > s.step ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Route & Time */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <Label htmlFor="pickup" className="text-sm font-medium">{t.form.pickupLocation}</Label>
            <div className="mt-1.5">
              <LocationAutocomplete
                ref={pickupRef}
                id="pickup"
                value={formData.pickup}
                onChange={(value) => handleInputChange("pickup", value)}
                onSelect={() => {
                  // Wait a bit for the dropdown to close before focusing the next field
                  setTimeout(() => dropoffRef.current?.focus(), 100);
                }}
                onFocus={handleFirstFocus}
                placeholder="e.g., Chania Airport (CHQ)"
                icon={<MapPin className="w-4 h-4 text-accent" />}
                error={!!errors.pickup}
                data-tracking-id="quote-pickup"
              />
            </div>
            {errors.pickup && <p className="text-xs text-destructive mt-1">{errors.pickup}</p>}
          </div>

          <div>
            <Label htmlFor="dropoff" className="text-sm font-medium">{t.form.dropoffLocation}</Label>
            <div className="mt-1.5">
              <LocationAutocomplete
                ref={dropoffRef}
                id="dropoff"
                value={formData.dropoff}
                onChange={(value) => handleInputChange("dropoff", value)}
                onSelect={() => {
                  // After both are selected, hide keyboard and open date picker if not set
                  if (!date) {
                    setTimeout(() => setDatePopoverOpen(true), 150);
                  }
                }}
                placeholder="e.g., Chania Old Town"
                icon={<MapPin className="w-4 h-4 text-olive" />}
                error={!!errors.dropoff}
                data-tracking-id="quote-dropoff"
              />
            </div>
            {errors.dropoff && <p className="text-xs text-destructive mt-1">{errors.dropoff}</p>}
          </div>

          {/* Recent Routes - Hide if both are already filled to clean up the UI */}
          {(!formData.pickup || !formData.dropoff) && (
            <RecentRoutes onRouteSelect={handleRecentRouteSelect} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">{t.form.date}</Label>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-accent cursor-help"></span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">
                        {language === 'gr' 
                          ? 'Επιλέξτε ημερομηνία για να δείτε την πρόβλεψη καιρού'
                          : 'Select a date to see the weather forecast'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1.5 justify-start text-left font-normal h-11",
                      !date && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? format(date, "dd MMM") : (language === 'gr' ? 'Επιλογή' : 'Select')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      if (d) {
                        onDateChange?.(format(d, 'yyyy-MM-dd'));
                        setDatePopoverOpen(false);
                      }
                      if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="time" className="text-sm font-medium">{t.form.time}</Label>
              </div>
              <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1.5 justify-start text-left font-normal h-11",
                      !formData.time && "text-muted-foreground",
                      errors.time && "border-destructive"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formData.time || (language === 'gr' ? 'Επιλογή' : 'Select')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 pointer-events-auto" align="start">
                  <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, h) => 
                      [0, 15, 30, 45].map(m => {
                        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        return (
                          <Button
                            key={time}
                            variant={formData.time === time ? "default" : "ghost"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              handleInputChange("time", time);
                              if (errors.time) setErrors(prev => ({ ...prev, time: '' }));
                              setTimePopoverOpen(false);
                            }}
                          >
                            {time}
                          </Button>
                        );
                      })
                    ).flat()}
                  </div>
                </PopoverContent>
              </Popover>
              {errors.time && <p className="text-xs text-destructive mt-1">{errors.time}</p>}
            </div>
          </div>

          {/* Return Trip Option - For Port & Airport Arrivals */}
          {showReturnTripOption && (
            <ReturnTripOption
              enabled={formData.returnTrip}
              returnDate={returnDate}
              returnTime={formData.returnTime}
              onToggle={(enabled) => handleInputChange("returnTrip", enabled)}
              onDateChange={setReturnDate}
              onTimeChange={(time) => handleInputChange("returnTime", time)}
              minDate={date}
              dropoffLocation={formData.dropoff}
              isPortRoute={isPortRoute}
              isAirportRoute={isAirportDropoff}
            />
          )}

          <Button type="button" variant="hero" className="w-full mt-2" onClick={handleNext} data-tracking-id="quote-step1-continue">
            {t.form.submit}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Passengers, Vehicle & Extras */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          {/* Weather Chip - Show when date is selected */}
          {date && formData.dropoff && (
            <WeatherChip 
              location={getWeatherLocation(formData.dropoff)} 
              date={format(date, 'yyyy-MM-dd')} 
              className="w-full justify-center"
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">{t.form.passengers}</Label>
              <div className="relative mt-1.5">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select
                  value={formData.passengers}
                  onValueChange={(value) => {
                    if (value === "17+") {
                      setShowLargeGroupModal(true);
                    } else {
                      handleInputChange("passengers", value);
                    }
                  }}
                >
                  <SelectTrigger className={cn("pl-10", errors.passengers && "border-destructive")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                    <SelectItem value="17+" className="text-accent font-medium">
                      {language === 'gr' ? 'Περισσότερα από 16' : 'More than 16'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.passengers && <p className="text-xs text-destructive mt-1">{errors.passengers}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">{t.common.luggage}</Label>
              <div className="relative mt-1.5">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select
                  value={formData.luggage}
                  onValueChange={(value) => handleInputChange("luggage", value)}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No luggage</SelectItem>
                    <SelectItem value="small">Small (carry-on)</SelectItem>
                    <SelectItem value="medium">Medium (1-2 bags)</SelectItem>
                    <SelectItem value="large">Large (3+ bags)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Hide vehicle selection and rest of form for 17+ passengers */}
          {formData.passengers !== "17+" && (
            <>
              <div>
                <Label className="text-sm font-medium">{t.form.selectVehicle}</Label>
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange("vehicleType", "taxi")}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                      formData.vehicleType === "taxi"
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border hover:border-accent/50",
                      errors.vehicleType && !formData.vehicleType && "border-destructive"
                    )}
                  >
                    <Car className={cn("w-5 h-5", formData.vehicleType === "taxi" ? "text-accent" : "text-muted-foreground")} />
                    <div className="text-center">
                      <p className="text-xs font-medium">E-Class</p>
                      <p className="text-[10px] text-muted-foreground">1-4</p>
                      {allRoutePrices?.['1-4'] ? (
                        <p className="text-sm font-bold text-accent mt-0.5">€{Math.round(allRoutePrices['1-4'])}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("vehicleType", "minivan-s")}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                      formData.vehicleType === "minivan-s"
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border hover:border-accent/50",
                      errors.vehicleType && !formData.vehicleType && "border-destructive"
                    )}
                  >
                    <Bus className={cn("w-5 h-5", formData.vehicleType === "minivan-s" ? "text-accent" : "text-muted-foreground")} />
                    <div className="text-center">
                      <p className="text-xs font-medium">Sprinter</p>
                      <p className="text-[10px] text-muted-foreground">5-8</p>
                      {allRoutePrices?.['5-8'] ? (
                        <p className="text-sm font-bold text-accent mt-0.5">€{Math.round(allRoutePrices['5-8'])}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("vehicleType", "minivan")}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                      formData.vehicleType === "minivan"
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border hover:border-accent/50",
                      errors.vehicleType && !formData.vehicleType && "border-destructive"
                    )}
                  >
                    <Bus className={cn("w-5 h-5", formData.vehicleType === "minivan" ? "text-accent" : "text-muted-foreground")} />
                    <div className="text-center">
                      <p className="text-xs font-medium">Sprinter</p>
                      <p className="text-[10px] text-muted-foreground">9-11</p>
                      {allRoutePrices?.['9-11'] ? (
                        <p className="text-sm font-bold text-accent mt-0.5">€{Math.round(allRoutePrices['9-11'])}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("vehicleType", "minibus")}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                      formData.vehicleType === "minibus"
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border hover:border-accent/50",
                      errors.vehicleType && !formData.vehicleType && "border-destructive"
                    )}
                  >
                    <Bus className={cn("w-5 h-5", formData.vehicleType === "minibus" ? "text-accent" : "text-muted-foreground")} />
                    <div className="text-center">
                      <p className="text-xs font-medium">Maxi</p>
                      <p className="text-[10px] text-muted-foreground">12-16</p>
                      {allRoutePrices?.['12-16'] ? (
                        <p className="text-sm font-bold text-accent mt-0.5">€{Math.round(allRoutePrices['12-16'])}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("vehicleType", "minibus-xl")}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                      formData.vehicleType === "minibus-xl"
                        ? "border-accent bg-accent/10 shadow-md"
                        : "border-border hover:border-accent/50",
                      errors.vehicleType && !formData.vehicleType && "border-destructive"
                    )}
                  >
                    <Bus className={cn("w-5 h-5", formData.vehicleType === "minibus-xl" ? "text-accent" : "text-muted-foreground")} />
                    <div className="text-center">
                      <p className="text-xs font-medium">Maxi</p>
                      <p className="text-[10px] text-muted-foreground">17+</p>
                      {allRoutePrices?.['17+'] ? (
                        <p className="text-sm font-bold text-accent mt-0.5">€{Math.round(allRoutePrices['17+'])}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
                      )}
                    </div>
                  </button>
                </div>
                {errors.vehicleType && <p className="text-xs text-destructive mt-1">{errors.vehicleType}</p>}
              </div>

              <ContextualAddons
                bookingType={bookingType}
                isBeachDestination={isBeachDestination}
                values={{
                  childSeat: formData.childSeat,
                  extraStop: formData.extraStop,
                  meetGreet: formData.meetGreet,
                  extraHour: formData.extraHour,
                  coolerWaters: formData.coolerWaters,
                }}
                onChange={(field, value) => handleInputChange(field, value)}
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                  {language === 'gr' ? 'Πίσω' : 'Back'}
                </Button>
                <Button type="button" variant="hero" className="flex-1" onClick={handleNext} data-tracking-id="quote-step2-submit">
                  {language === 'gr' ? 'Συνέχεια' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}

          {/* Back button only for 17+ passengers */}
          {formData.passengers === "17+" && (
            <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
              {language === 'gr' ? 'Πίσω' : 'Back'}
            </Button>
          )}
        </div>
      )}

      {/* Step 3: Quote Summary */}
      {step === 3 && (
        <QuoteSummary
          formData={{
            ...formData,
            date: date ? format(date, 'dd MMM yyyy') : '',
          }}
          estimatedPrice={getEstimatedPrice()}
          priceAmount={fixedPrice?.fixed_price_eur || 0}
          isFixedPrice={!!fixedPrice}
          isSubmitting={isSubmitting}
          errors={errors}
          hasReturnTrip={formData.returnTrip}
          onConfirm={handleConfirmBooking}
          onBack={handleBack}
          onInputChange={handleInputChange}
        />
      )}

      {/* Step 4: Success */}
      {step === 5 && (
        <div className="text-center py-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">Request Received!</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            We'll confirm your booking and send the exact price within 15 minutes.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Check your email or WhatsApp for confirmation.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetForm}
          >
            New Quote
          </Button>
        </div>
      )}

      {/* Large Group Contact Modal */}
      <LargeGroupContactModal
        open={showLargeGroupModal}
        onOpenChange={setShowLargeGroupModal}
        routeInfo={{
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          date: date ? format(date, 'dd MMM yyyy') : '',
          time: formData.time,
        }}
      />
    </div>
  );
});

QuoteWidget.displayName = 'QuoteWidget';

export default QuoteWidget;
